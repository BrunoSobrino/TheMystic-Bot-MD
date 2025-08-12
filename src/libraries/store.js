/*
 * store.js
 * Enhanced WhatsApp Store with specialized LID handling + always-on debug logs
 * Reemplaza directamente tu store.js con este archivo (todo incluido)
 */

import fs from 'fs';
import path from 'path';

// Nota: usamos import dinámico para compatibilidad con entornos ESM / baileys
const baileysMod = (await import('baileys')).default;
const {
  BufferJSON,
  proto,
  isJidBroadcast,
  WAMessageStubType,
  updateMessageWithReceipt,
  updateMessageWithReaction,
  jidNormalizedUser
} = baileysMod;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const RETRY_DELAY = 3000; // ms
const MAX_RETRIES = 5;

function makeInMemoryStore() {
  // Estructuras internas
  let chats = {};
  let messages = {};
  let contacts = {};
  let state = { connection: 'close' };

  // Colas y caches para LID / Web/Desktop
  const lidRetryQueue = new Map();
  const failedLidMessages = new Map();
  const pendingDecryption = new Map();

  // Cache persistente
  const cacheFile = path.join(process.cwd(), 'lidsresolve.json');
  let lidCache = new Map();
  let jidToLidMap = new Map();
  let isDirty = false;
  let conn = null;

  // Estadísticas
  let errorStats = {
    lidDecryptionErrors: 0,
    webDesktopErrors: 0,
    successfulRetries: 0,
    totalRetries: 0
  };

  /***************
   * Utilidades
   ***************/
  function decodeJidSafe(jid) {
    try {
      if (!jid) return jid;
      if (typeof jid === 'object' && typeof jid.decodeJid === 'function') return jid.decodeJid();
      return jid;
    } catch (e) {
      return jid;
    }
  }

  /***************
   * Cache LID
   ***************/
  function loadLidCache() {
    try {
      if (fs.existsSync(cacheFile)) {
        const data = fs.readFileSync(cacheFile, 'utf8');
        const parsed = JSON.parse(data);
        for (const [key, entry] of Object.entries(parsed)) {
          if (entry && typeof entry === 'object' && entry.jid && entry.lid) {
            lidCache.set(key, entry);
            jidToLidMap.set(entry.jid, entry.lid);
          }
        }
        console.log(`[LID-DEBUG] Cache LID cargado: ${lidCache.size} entradas (${cacheFile})`);
      } else {
        console.log(`[LID-DEBUG] No existe ${cacheFile}, iniciando cache vacía`);
      }
    } catch (error) {
      console.error('[LID-DEBUG] Error cargando cache LID:', error && error.message ? error.message : error);
      lidCache = new Map();
      jidToLidMap = new Map();
    }
  }

  function saveLidCache() {
    try {
      const data = {};
      for (const [key, value] of lidCache.entries()) data[key] = value;
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      isDirty = false;
      console.log(`[LID-DEBUG] Cache LID guardado (${lidCache.size} entradas) -> ${cacheFile}`);
    } catch (error) {
      console.error('[LID-DEBUG] Error guardando cache LID:', error && error.message ? error.message : error);
    }
  }

  // Auto-save periódico del cache
  setInterval(() => {
    if (isDirty) saveLidCache();
  }, 30 * 1000);

  /***************
   * Resolución LID
   ***************/
  async function resolveLidFromCache(lidJid, groupChatId) {
    try {
      console.log(`[LID-DEBUG] Resolviendo LID: ${lidJid} (group: ${groupChatId})`);

      if (!lidJid || !lidJid.endsWith?.('@lid')) {
        console.log(`[LID-DEBUG] No parece LID, retorno: ${lidJid}`);
        return lidJid && lidJid.includes('@') ? lidJid : (lidJid ? `${lidJid}@s.whatsapp.net` : lidJid);
      }

      const lidKey = lidJid.split('@')[0]; // e.g. "119280452550827:13"

      // 1) Buscar en cache por lidKey
      if (lidCache.has(lidKey)) {
        const cached = lidCache.get(lidKey);
        console.log(`[LID-DEBUG] Encontrado en cache: ${JSON.stringify(cached)}`);
        if (cached.jid && !cached.jid.endsWith('@lid')) return cached.jid;
      } else {
        console.log(`[LID-DEBUG] No hay entrada de cache para lidKey=${lidKey}`);
      }

      // 2) Intentar encontrar por jidToLidMap (reverse map) - si tenemos participant JID conocido
      for (const [jid, lid] of jidToLidMap.entries()) {
        if (lid === lidJid) {
          console.log(`[LID-DEBUG] Encontrado en jidToLidMap: ${jid} -> ${lid}`);
          return jid;
        }
      }

      // 3) Si estamos en un grupo, consultar metadata para mapear LID a JID
      if (conn && groupChatId && groupChatId.endsWith?.('@g.us')) {
        try {
          console.log(`[LID-DEBUG] Intentando groupMetadata(${groupChatId}) para resolver LID...`);
          const metadata = await conn.groupMetadata(groupChatId).catch(e => { throw e; });
          const participants = metadata?.participants || [];
          console.log(`[LID-DEBUG] metadata.participants length=${participants.length}`);
          for (const p of participants) {
            try {
              // comparar el número base (sin sufijos) con el lidKey (que usualmente tiene el número)
              const numberFromParticipant = p.jid?.split?.('@')?.[0];
              if (!numberFromParticipant) continue;
              if (lidKey.includes(numberFromParticipant) || numberFromParticipant.includes(lidKey.split(':')[0])) {
                const entry = {
                  jid: p.jid,
                  lid: lidJid,
                  name: p.jid.split('@')[0],
                  timestamp: Date.now(),
                  groupJid: groupChatId
                };
                lidCache.set(lidKey, entry);
                jidToLidMap.set(p.jid, lidJid);
                isDirty = true;
                console.log(`[LID-DEBUG] Resuelto por metadata: ${lidJid} -> ${p.jid}`);
                return p.jid;
              }
            } catch (inner) {
              continue;
            }
          }
        } catch (e) {
          console.error(`[LID-DEBUG] Error consultando metadata: ${e && e.message ? e.message : e}`);
        }
      }

      // 4) Fallback: devolver el lidJid (no resuelto)
      console.log(`[LID-DEBUG] No resuelto, fallback -> ${lidJid}`);
      return lidJid;
    } catch (err) {
      console.error('[LID-DEBUG] Error en resolveLidFromCache:', err && err.message ? err.message : err);
      return lidJid;
    }
  }

  /***************
   * Detectores simples
   ***************/
  function isWebDesktopMessage(messageNode) {
    if (!messageNode || !messageNode.attrs) return false;
    const a = messageNode.attrs;
    const res = a.addressing_mode === 'lid' && a.participant?.includes?.('@lid') && !!a.participant_pn;
    console.log(`[LID-DEBUG] isWebDesktopMessage(${a.id}) => ${res}`);
    return res;
  }

  function extractRealJid(messageAttrs) {
    try {
      if (!messageAttrs) return null;
      if (messageAttrs.participant_pn) {
        console.log(`[LID-DEBUG] extractRealJid: usando participant_pn = ${messageAttrs.participant_pn}`);
        return messageAttrs.participant_pn;
      }
      if (messageAttrs.participant && messageAttrs.participant.endsWith?.('@lid')) {
        const lidPart = messageAttrs.participant.split('@')[0];
        if (lidPart.includes(':')) {
          const numberPart = lidPart.split(':')[0];
          console.log(`[LID-DEBUG] extractRealJid: construido desde lidPart => ${numberPart}@s.whatsapp.net`);
          return `${numberPart}@s.whatsapp.net`;
        }
      }
      return messageAttrs.participant;
    } catch (err) {
      console.error('[LID-DEBUG] Error en extractRealJid:', err && err.message ? err.message : err);
      return messageAttrs.participant;
    }
  }

  /***************
   * Manejo LID: placeholder + retry
   ***************/
  async function handleLidMessage(messageNode, isRetry = false) {
    if (!messageNode || !messageNode.attrs) return null;

    const attrs = messageNode.attrs;
    const messageId = attrs.id;
    const groupJid = attrs.from;
    const lidParticipant = attrs.participant;
    const realJid = extractRealJid(attrs);

    console.log(`[LID-DEBUG] handleLidMessage: id=${messageId} group=${groupJid} lidParticipant=${lidParticipant} realJid=${realJid} retry=${isRetry}`);

    let resolvedJid = realJid;
    if (lidParticipant?.endsWith?.('@lid')) {
      resolvedJid = await resolveLidFromCache(lidParticipant, groupJid);
      console.log(`[LID-DEBUG] handleLidMessage: resolvedJid=${resolvedJid}`);
    }

    const messageTimestamp = parseInt(attrs.t || `${Math.floor(Date.now() / 1000)}`);

    const placeholder = {
      key: { remoteJid: groupJid, fromMe: false, id: messageId, participant: resolvedJid || realJid },
      messageTimestamp,
      pushName: attrs.notify || 'Usuario Web',
      message: {
        conversation: isRetry
          ? `🔄 Reintentando descifrar mensaje web... (${(pendingDecryption.get(messageId)?.retryCount || 0)})`
          : '🌐 Mensaje desde Web/Desktop - Procesando...'
      },
      messageStubType: proto.WebMessageInfo.StubType?.CIPHERTEXT || WAMessageStubType.CIPHERTEXT,
      status: proto.WebMessageInfo.Status?.PENDING || 0,
      _isLidWebMessage: true,
      _originalNode: messageNode,
      _resolvedJid: resolvedJid,
      _realJid: realJid,
      _retryCount: isRetry ? (pendingDecryption.get(messageId)?.retryCount || 0) + 1 : 0
    };

    console.log(`[LID-DEBUG] Creado placeholder para id=${messageId} participant=${placeholder.key.participant}`);
    return placeholder;
  }

  async function retryLidDecryption(messageId, originalNode, retryCount = 0) {
    try {
      console.log(`[LID-DEBUG] retryLidDecryption: id=${messageId} retry=${retryCount}`);

      if (retryCount >= MAX_RETRIES) {
        console.log(`[LID-DEBUG] Max retries alcanzado para ${messageId}`);
        errorStats.lidDecryptionErrors++;
        const errorMessage = await handleLidMessage(originalNode, true);
        if (errorMessage) {
          errorMessage.message.conversation = '❌ No se pudo descifrar el mensaje web';
          errorMessage.status = proto.WebMessageInfo.Status?.ERROR || 0;
          errorMessage._finalError = true;
        }
        pendingDecryption.delete(messageId);
        return errorMessage;
      }

      errorStats.totalRetries++;
      const pending = pendingDecryption.get(messageId) || {};
      pending.retryCount = retryCount + 1;
      pending.lastRetry = Date.now();
      pending.originalNode = originalNode;
      pendingDecryption.set(messageId, pending);

      const waitMs = RETRY_DELAY * (retryCount + 1);
      console.log(`[LID-DEBUG] Programando retry en ${waitMs}ms para id=${messageId}`);

      setTimeout(async () => {
        try {
          if (conn && conn.ws && conn.ws.readyState === 1) {
            const groupJid = originalNode.attrs.from;
            const participantJid = extractRealJid(originalNode.attrs);
            console.log(`[LID-DEBUG] Enviando retry request (sendRetryRequest) para id=${messageId} group=${groupJid} participant=${participantJid}`);
            try {
              // sendRetryRequest puede variar según la versión de baileys, se intenta y se atrapa error
              if (typeof conn.sendRetryRequest === 'function') {
                await conn.sendRetryRequest(groupJid, messageId, participantJid);
                console.log(`[LID-DEBUG] Retry request enviado para id=${messageId}`);
              } else if (conn.ws && conn.ws.send) {
                // fallback mínimo (no garantiza comportamiento, pero lo intentamos)
                console.log('[LID-DEBUG] conn.sendRetryRequest no disponible en esta versión de baileys');
              }
            } catch (retryErr) {
              console.error(`[LID-DEBUG] Error enviando retry request: ${retryErr && retryErr.message ? retryErr.message : retryErr}`);
            }
          } else {
            console.log('[LID-DEBUG] Conexión no disponible o ws no lista para enviar retry');
          }

          // Programar siguiente intento incremental
          setTimeout(() => {
            retryLidDecryption(messageId, originalNode, retryCount + 1);
          }, RETRY_DELAY * (retryCount + 2));
        } catch (err) {
          console.error('[LID-DEBUG] Error en setTimeout de retryLidDecryption:', err && err.message ? err.message : err);
          retryLidDecryption(messageId, originalNode, retryCount + 1);
        }
      }, waitMs);

      return await handleLidMessage(originalNode, true);
    } catch (err) {
      console.error('[LID-DEBUG] Exception en retryLidDecryption:', err && err.message ? err.message : err);
      return null;
    }
  }

  /***************
   * Procesamiento de mensajes (resolver LIDs en mensajes reales)
   ***************/
  async function processMessageLids(message) {
    try {
      if (!message || !message.key) return message;

      const groupChatId = message.key.remoteJid && message.key.remoteJid.endsWith?.('@g.us') ? message.key.remoteJid : null;
      if (!groupChatId) return message;

      const processedMessage = { ...message };

      // Resolver participant si es @lid
      if (processedMessage.key?.participant?.endsWith?.('@lid')) {
        const resolved = await resolveLidFromCache(processedMessage.key.participant, groupChatId);
        if (resolved && resolved !== processedMessage.key.participant) {
          console.log(`[LID-DEBUG] processMessageLids: reemplazando participant ${processedMessage.key.participant} -> ${resolved}`);
          processedMessage.key.participant = resolved;
        }
      }

      // Resolver mentions y contextInfo
      if (processedMessage.message) {
        const messageTypes = Object.keys(processedMessage.message);
        for (const msgType of messageTypes) {
          const msgContent = processedMessage.message[msgType];
          if (!msgContent) continue;

          if (msgContent?.contextInfo?.mentionedJid) {
            const resolvedMentions = [];
            for (const jid of msgContent.contextInfo.mentionedJid) {
              if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
                const r = await resolveLidFromCache(jid, groupChatId);
                resolvedMentions.push(r);
                console.log(`[LID-DEBUG] Resuelto mention ${jid} -> ${r}`);
              } else {
                resolvedMentions.push(jid);
              }
            }
            msgContent.contextInfo.mentionedJid = resolvedMentions;
          }

          if (msgContent?.contextInfo?.participant && msgContent.contextInfo.participant.endsWith?.('@lid')) {
            const r = await resolveLidFromCache(msgContent.contextInfo.participant, groupChatId);
            msgContent.contextInfo.participant = r;
            console.log(`[LID-DEBUG] Resuelto contextInfo.participant -> ${r}`);
          }
        }
      }

      return processedMessage;
    } catch (err) {
      console.error('[LID-DEBUG] Error en processMessageLids:', err && err.message ? err.message : err);
      return message;
    }
  }

  /***************
   * Manejo de mensajes en memoria
   ***************/
  function loadMessage(jid, id = null) {
    try {
      if (!jid) return null;
      // helper decode
      const realJid = decodeJidSafe(jid);
      if (!id) {
        // buscar por id en todo el store
        const filter = m => m?.key?.id === jid;
        const found = Object.entries(messages).find(([, msgs]) => msgs.find(filter));
        return found?.[1]?.find(filter) || null;
      } else {
        if (!(realJid in messages)) return null;
        return messages[realJid]?.find(m => m.key.id === id) || null;
      }
    } catch (err) {
      console.error('[STORE] Error loadMessage:', err && err.message ? err.message : err);
      return null;
    }
  }

  function isJidGroup(jid) {
    jid = decodeJidSafe(jid);
    return jid && jid.endsWith?.('@g.us');
  }

  async function fetchGroupMetadata(jid, groupMetadataFunc) {
    try {
      jid = decodeJidSafe(jid);
      if (!isJidGroup(jid)) return;
      if (!(jid in chats)) chats[jid] = { id: jid };
      const isRequiredToUpdate = !chats[jid].metadata || Date.now() - (chats[jid].lastfetch || 0) > TIME_TO_DATA_STALE;
      if (isRequiredToUpdate) {
        try {
          const metadata = await groupMetadataFunc?.(jid);
          if (metadata) {
            Object.assign(chats[jid], { subject: metadata.subject, lastfetch: Date.now(), metadata });
          }
        } catch (err) {
          // silencio intencional
          console.error('[STORE] Error fetchGroupMetadata:', err && err.message ? err.message : err);
        }
      }
      return chats[jid].metadata;
    } catch (err) {
      console.error('[STORE] Error fetchGroupMetadata outer:', err && err.message ? err.message : err);
    }
  }

  function upsertMessage(jid, message, type = 'append') {
    try {
      jid = decodeJidSafe(jid);
      if (!jid) return;
      if (!(jid in messages)) messages[jid] = [];

      // Limpiar mensajes con data innecesaria
      delete message.message?.messageContextInfo;
      delete message.message?.senderKeyDistributionMessage;

      const existing = loadMessage(jid, message.key.id);
      if (existing) {
        // Si el mensaje existente era placeholder LID y el nuevo es válido -> reemplazar
        if ((existing._isLidWebMessage || existing._lidDecryptError) && !message._isLidWebMessage && message.message && !message._finalError) {
          console.log(`[LID-DEBUG] Reemplazando placeholder LID con mensaje real: ${message.key.id}`);
          Object.assign(existing, message);
          delete existing._isLidWebMessage;
          delete existing._lidDecryptError;
          delete existing._retryCount;
          delete existing._originalNode;
          pendingDecryption.delete(message.key.id);
          errorStats.successfulRetries++;
        } else {
          Object.assign(existing, message);
        }
      } else {
        if (type === 'append') messages[jid].push(message);
        else messages[jid].unshift(message);
      }
    } catch (err) {
      console.error('[STORE] Error upsertMessage:', err && err.message ? err.message : err);
    }
  }

  /***************
   * Bind: conectar el store a la conexión (conn)
   ***************/
  function bind(connection) {
    conn = connection;
    if (!conn.chats) conn.chats = {};

    // Cargar cache LID en bind
    loadLidCache();

    // Interceptar ev.emit para suprimir algunos errores recurrentes y loguearlos
    try {
      if (conn.ev && typeof conn.ev.emit === 'function') {
        const originalEmit = conn.ev.emit.bind(conn.ev);
        conn.ev.emit = function (event, ...args) {
          try {
            // Si detectamos disconnect con "error in handling message" lo logueamos y seguimos
            if (event === 'connection.update' && args[0]?.lastDisconnect?.error?.message?.includes?.('error in handling message')) {
              console.log('[LID-DEBUG] connection.update interceptado: error in handling message (suppressing propagation)');
              return;
            }
          } catch (e) {
            // ignore
          }
          return originalEmit(event, ...args);
        };
      }
    } catch (err) {
      console.error('[STORE] Error al sobreescribir conn.ev.emit:', err && err.message ? err.message : err);
    }

    // Si existe ws, envolver "on" para capturar mensajes 'raw' que fallan en handler y crear placeholder LID
    try {
      if (conn.ws && typeof conn.ws.on === 'function') {
        const originalOn = conn.ws.on.bind(conn.ws);
        conn.ws.on = function (event, handler) {
          if (event === 'message') {
            const wrappedHandler = async function (data) {
              try {
                return await handler(data);
              } catch (error) {
                try {
                  // Si es un error de "handling message" y addressing_mode === 'lid', generamos placeholder y plan de retry
                  if (error && typeof error.message === 'string' && error.message.includes('error in handling message') && data?.attrs?.addressing_mode === 'lid') {
                    console.log(`[LID-DEBUG] Mensaje Web/Desktop con fallo en handler: id=${data.attrs.id}`);
                    errorStats.webDesktopErrors++;

                    // Crear placeholder e insertarlo
                    const placeholder = await handleLidMessage(data);
                    if (placeholder) {
                      const jid = data.attrs.from;
                      upsertMessage(jid, proto.WebMessageInfo.fromObject(placeholder), 'append');

                      // Registrar en pendingDecryption
                      pendingDecryption.set(data.attrs.id, { originalNode: data, retryCount: 0, lastRetry: Date.now() });

                      // Iniciar retries
                      setTimeout(() => retryLidDecryption(data.attrs.id, data, 0), 1000);
                    }
                    return;
                  }
                } catch (inner) {
                  console.error('[LID-DEBUG] Error dentro del wrapper de ws.on:', inner && inner.message ? inner.message : inner);
                }
                throw error;
              }
            };
            return originalOn(event, wrappedHandler);
          }
          return originalOn(event, handler);
        };
      }
    } catch (err) {
      console.error('[STORE] Error al envolver conn.ws.on:', err && err.message ? err.message : err);
    }

    /***************
     * Eventos importantes
     ***************/
    try {
      conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
        try {
          if (!['append', 'notify'].includes(type)) return;
          for (const msg of newMessages) {
            try {
              const jid = decodeJidSafe(msg.key.remoteJid);
              if (!jid || isJidBroadcast(jid)) continue;

              // Si estaba en pendingDecryption, loguear que se descifró correctamente
              if (pendingDecryption.has(msg.key.id)) {
                console.log(`[LID-DEBUG] Mensaje LID descifrado exitosamente (upsert): ${msg.key.id}`);
                pendingDecryption.delete(msg.key.id);
                errorStats.successfulRetries++;
              }

              // Resolver LIDs dentro del mensaje y upsert
              const processed = await processMessageLids(msg);
              upsertMessage(jid, proto.WebMessageInfo.fromObject(processed), type);
            } catch (mErr) {
              console.error('[STORE] Error procesando message.upsert:', mErr && mErr.message ? mErr.message : mErr);
              // fallback: insertar mensaje sin procesar
              try {
                const jid = decodeJidSafe(msg.key.remoteJid);
                upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
              } catch (inner) { /* ignore */ }
            }
          }
        } catch (outer) {
          console.error('[STORE] Exception en messages.upsert handler:', outer && outer.message ? outer.message : outer);
        }
      });

      conn.ev.on('messages.update', async updates => {
        try {
          for (const { key, update } of updates) {
            try {
              const jid = decodeJidSafe(key.remoteJid);
              const message = loadMessage(jid, key.id);
              if (message) {
                // Si era placeholder LID y ahora tenemos update.message -> intentar reemplazar
                if ((message._isLidWebMessage || pendingDecryption.has(key.id)) && update.message) {
                  console.log(`[LID-DEBUG] Actualización de mensaje LID recibida: ${key.id}`);
                  const processedUpdate = await processMessageLids({ key, ...update });
                  Object.assign(message, processedUpdate);

                  delete message._isLidWebMessage;
                  delete message._retryCount;
                  delete message._originalNode;
                  pendingDecryption.delete(key.id);
                  errorStats.successfulRetries++;
                } else {
                  const processedUpdate = await processMessageLids({ key, ...update });
                  Object.assign(message, processedUpdate);
                }
              }
            } catch (e) {
              console.error('[STORE] Error en messages.update inner:', e && e.message ? e.message : e);
            }
          }
        } catch (e) {
          console.error('[STORE] Error manejando messages.update:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('message-receipt.update', updates => {
        try {
          for (const { key, receipt } of updates) {
            try {
              const jid = decodeJidSafe(key.remoteJid);
              const message = loadMessage(jid, key.id);
              if (message) {
                updateMessageWithReceipt(message, receipt);
                if (receipt.type === 'retry' && pendingDecryption.has(key.id)) {
                  console.log(`[LID-DEBUG] Retry receipt para mensaje LID: ${key.id}`);
                }
              }
            } catch (e) {
              console.error('[STORE] Error message-receipt.update inner:', e && e.message ? e.message : e);
            }
          }
        } catch (e) {
          console.error('[STORE] Error message-receipt.update:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('messages.reaction', updates => {
        try {
          for (const { key, reaction } of updates) {
            const jid = decodeJidSafe(key.remoteJid);
            const message = loadMessage(jid, key.id);
            if (message) updateMessageWithReaction(message, reaction);
          }
        } catch (e) {
          console.error('[STORE] Error messages.reaction:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('chats.set', ({ chats: newChats }) => {
        try {
          for (const chat of newChats) {
            const jid = decodeJidSafe(chat.id);
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], chat);
            conn.chats[jid] = chats[jid];
          }
        } catch (e) {
          console.error('[STORE] Error chats.set:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('contacts.set', ({ contacts: newContacts }) => {
        try {
          for (const contact of newContacts) {
            const jid = decodeJidSafe(contact.id);
            if (!(jid in contacts)) contacts[jid] = { id: jid };
            Object.assign(contacts[jid], contact);

            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], contact);
            conn.chats[jid] = chats[jid];
          }
        } catch (e) {
          console.error('[STORE] Error contacts.set:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('chats.upsert', newChats => {
        try {
          for (const chat of newChats) {
            const jid = decodeJidSafe(chat.id);
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], chat);
            conn.chats[jid] = chats[jid];
          }
        } catch (e) {
          console.error('[STORE] Error chats.upsert:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('chats.update', updates => {
        try {
          for (const update of updates) {
            const jid = decodeJidSafe(update.id);
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], update);
            conn.chats[jid] = chats[jid];
          }
        } catch (e) {
          console.error('[STORE] Error chats.update:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('presence.update', ({ id, presences: updates }) => {
        try {
          const jid = decodeJidSafe(id);
          if (!(jid in chats)) chats[jid] = { id: jid };
          Object.assign(chats[jid], { presences: { ...(chats[jid].presences || {}), ...updates } });
          conn.chats[jid] = chats[jid];
        } catch (e) {
          console.error('[STORE] Error presence.update:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('groups.update', async (updates) => {
        try {
          for (const update of updates) {
            const jid = decodeJidSafe(update.id);
            if (!jid || !isJidGroup(jid)) continue;
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], update);

            try {
              const metadata = await conn.groupMetadata(jid).catch(() => null);
              if (metadata) {
                chats[jid].metadata = metadata;
                chats[jid].subject = metadata.subject;
                await updateLidCacheFromMetadata(metadata, jid);
              }
            } catch (err) {
              // silencio
            }

            conn.chats[jid] = chats[jid];
          }
        } catch (e) {
          console.error('[STORE] Error groups.update:', e && e.message ? e.message : e);
        }
      });

      conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
          if (!id) return;
          const jid = decodeJidSafe(id);
          if (!isJidGroup(jid)) return;
          if (!(jid in chats)) chats[jid] = { id: jid };
          chats[jid].isChats = true;

          try {
            const metadata = await conn.groupMetadata(jid).catch(() => null);
            if (metadata) {
              chats[jid].metadata = metadata;
              chats[jid].subject = metadata.subject;
              await updateLidCacheFromMetadata(metadata, jid);
            }
          } catch (err) {
            // silencio
          }

          conn.chats[jid] = chats[jid];
        } catch (e) {
          console.error('[STORE] Error group-participants.update:', e && e.message ? e.message : e);
        }
      });

    } catch (e) {
      console.error('[STORE] Error en bind - setup de eventos:', e && e.message ? e.message : e);
    }
  }

  /***************
   * Actualizar cache inferida desde metadata de grupo
   ***************/
  async function updateLidCacheFromMetadata(metadata, groupJid) {
    try {
      if (!metadata?.participants || !conn) return;
      for (const participant of metadata.participants) {
        try {
          const phoneNumber = participant.jid.split('@')[0];
          if (!phoneNumber) continue;
          // formato probable de lid para este bot: `${phone}:13@lid` (podría variar)
          const possibleLid = `${phoneNumber}:13@lid`;
          if (!lidCache.has(phoneNumber)) {
            const entry = {
              jid: participant.jid,
              lid: possibleLid,
              name: participant.jid.split('@')[0],
              timestamp: Date.now(),
              groupJid,
              inferred: true
            };
            lidCache.set(phoneNumber, entry);
            jidToLidMap.set(participant.jid, possibleLid);
            isDirty = true;
            console.log(`[LID-DEBUG] updateLidCacheFromMetadata: inferido ${possibleLid} -> ${participant.jid}`);
          }
        } catch (e) {
          // ignorar
        }
      }
    } catch (err) {
      console.error('[LID-DEBUG] Error updateLidCacheFromMetadata:', err && err.message ? err.message : err);
    }
  }

  /***************
   * Estadísticas y limpieza
   ***************/
  function getErrorStats() {
    return {
      ...errorStats,
      pendingDecryption: pendingDecryption.size,
      cacheSize: lidCache.size,
      jidMappings: jidToLidMap.size,
      pendingMessages: Array.from(pendingDecryption.entries()).map(([id, data]) => ({
        id, retryCount: data.retryCount, lastRetry: data.lastRetry
      }))
    };
  }

  function cleanupPendingMessages() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleaned = 0;
    for (const [messageId, data] of pendingDecryption.entries()) {
      if (data.lastRetry && data.lastRetry < oneHourAgo) {
        pendingDecryption.delete(messageId);
        cleaned++;
      }
    }
    if (cleaned) console.log(`[LID-DEBUG] cleanupPendingMessages limpió ${cleaned} entradas`);
    return cleaned;
  }

  setInterval(cleanupPendingMessages, 30 * 60 * 1000);

  /***************
   * Serialización
   ***************/
  function toJSON() {
    return { chats, messages, contacts };
  }

  function fromJSON(json) {
    Object.assign(chats, json.chats || {});
    Object.assign(contacts, json.contacts || {});
    for (const jid in json.messages || {}) {
      messages[jid] = (json.messages[jid] || []).map(m => m && proto.WebMessageInfo.fromObject(m)).filter(Boolean);
    }
  }

  /***************
   * API pública para LID resolver y debugging (útil en runtime)
   ***************/
  const lidResolver = {
    async resolve(lidJid, groupChatId) {
      return await resolveLidFromCache(lidJid, groupChatId);
    },
    add(lidKey, jid, name = null) {
      if (lidCache.has(lidKey)) return;
      const entry = {
        jid,
        lid: `${lidKey}@lid`,
        name: name || jid.split('@')[0],
        timestamp: Date.now(),
        manual: true
      };
      lidCache.set(lidKey, entry);
      jidToLidMap.set(jid, `${lidKey}@lid`);
      isDirty = true;
      console.log(`[LID-DEBUG] lidResolver.add: ${lidKey} -> ${jid}`);
    },
    get cache() {
      return lidCache;
    },
    getStats() {
      return getErrorStats();
    },
    forceSave() {
      saveLidCache();
    },
    forceRetryPending() {
      let retriedCount = 0;
      for (const [messageId, data] of pendingDecryption.entries()) {
        if (data.originalNode) {
          setTimeout(() => {
            retryLidDecryption(messageId, data.originalNode, 0);
          }, retriedCount * 1000);
          retriedCount++;
        }
      }
      return retriedCount;
    },
    clearErrors() {
      const cleared = { pendingDecryption: pendingDecryption.size, errorStats: { ...errorStats } };
      pendingDecryption.clear();
      errorStats = { lidDecryptionErrors: 0, webDesktopErrors: 0, successfulRetries: 0, totalRetries: 0 };
      return cleared;
    },
    getStatus() {
      return {
        lidCache: lidCache.size,
        jidMappings: jidToLidMap.size,
        pendingDecryption: pendingDecryption.size,
        errorStats,
        isDirty,
        cacheFile
      };
    }
  };

  /***************
   * Retorno de la store
   ***************/
  return {
    bind,
    loadMessage,
    toJSON,
    fromJSON,
    upsertMessage,
    fetchGroupMetadata: (jid) => fetchGroupMetadata(jid, conn?.groupMetadata),
    chats,
    messages,
    contacts,
    lidResolver,
    getErrorStats,
    cleanupPendingMessages,
    // funciones internas útiles (exportadas para debugging directo si las necesitas)
    handleLidMessage,
    retryLidDecryption,
    isWebDesktopMessage,
    extractRealJid
  };
}

export default makeInMemoryStore();

