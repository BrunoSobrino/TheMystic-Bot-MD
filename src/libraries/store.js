/*
 * store.js optimizado - Sin logs debug excesivos
 * - Trabaja directamente con cache LID del archivo JSON
 * - Aplica reemplazo de menciones en textos como main.js
 * - Integración con LidResolver.js para resolver LIDs faltantes
 */

import fs from 'fs';
import path from 'path';
import LidResolver from './LidResolver.js';

const baileys = (await import('baileys')).default;
const {
  BufferJSON,
  proto,
  isJidBroadcast,
  WAMessageStubType,
  updateMessageWithReceipt,
  updateMessageWithReaction,
  jidNormalizedUser
} = baileys;

// Configuración
const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const RETRY_DELAY = 3000;
const MAX_RETRIES = 6;
const WS_WAIT_TIMEOUT = 30000;
const WS_WAIT_STEP = 300;
const SEND_RETRY_ATTEMPTS_PER_CYCLE = 3;

function makeInMemoryStore() {
  // Estado interno
  let chats = {};
  let messages = {};
  let contacts = {};
  let state = { connection: 'close' };
  let conn = null;
  let lidResolver = null;

  const pendingDecryption = new Map();
  let errorStats = {
    lidDecryptionErrors: 0,
    webDesktopErrors: 0,
    successfulRetries: 0,
    totalRetries: 0
  };

  // Gestión del cache LID
  class LidCacheManager {
    constructor() {
      this.cacheFile = path.join(process.cwd(), 'src', 'lidsresolve.json');
      this.cache = new Map();
      this.jidToLidMap = new Map();
      this.isDirty = false;
      this.loadCache();
      this.setupAutoSave();
    }

    loadCache() {
      try {
        if (fs.existsSync(this.cacheFile)) {
          const data = fs.readFileSync(this.cacheFile, 'utf8');
          const parsed = JSON.parse(data);
          
          for (const [key, entry] of Object.entries(parsed)) {
            if (entry && entry.jid && entry.lid && entry.timestamp) {
              this.cache.set(key, entry);
              if (entry.jid && entry.jid.includes('@s.whatsapp.net')) {
                this.jidToLidMap.set(entry.jid, entry.lid);
              }
            }
          }
        }
      } catch (error) {
        this.cache = new Map();
        this.jidToLidMap = new Map();
      }
    }

    saveCache() {
      try {
        const data = {};
        for (const [key, value] of this.cache.entries()) {
          data[key] = value;
        }
        fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        this.isDirty = false;
      } catch (error) {
        // Error silencioso
      }
    }

    setupAutoSave() {
      setInterval(() => {
        if (this.isDirty) {
          this.saveCache();
        }
      }, 30000);

      const gracefulSave = () => {
        if (this.isDirty) {
          this.saveCache();
        }
      };

      process.on('SIGINT', gracefulSave);
      process.on('SIGTERM', gracefulSave);
      process.on('exit', gracefulSave);
    }

    getUserInfo(lidKey) {
      return this.cache.get(lidKey) || null;
    }

    getUserInfoByJid(jid) {
      for (const [key, entry] of this.cache.entries()) {
        if (entry && entry.jid === jid) {
          return entry;
        }
      }
      return null;
    }

    findLidByJid(jid) {
      return this.jidToLidMap.get(jid) || null;
    }

    async resolveLid(lidJid, groupChatId) {
      if (!lidJid.endsWith('@lid')) {
        return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
      }

      const lidKey = lidJid.split('@')[0];
      
      // Buscar en cache primero
      if (this.cache.has(lidKey)) {
        const entry = this.cache.get(lidKey);
        if (entry.jid && !entry.notFound && !entry.error) {
          return entry.jid;
        }
      }

      // Si no está en cache o falló antes, usar LidResolver
      if (lidResolver && groupChatId?.endsWith('@g.us')) {
        try {
          const resolved = await lidResolver.resolveLid(lidJid, groupChatId);
          return resolved;
        } catch (error) {
          return lidJid;
        }
      }

      return lidJid;
    }
  }

  const lidCacheManager = new LidCacheManager();

  // Utilidades
  function decodeJidSafe(jid) {
    try {
      if (!jid) return jid;
      if (typeof jid === 'object' && typeof jid.decodeJid === 'function') {
        return jid.decodeJid();
      }
      return jid;
    } catch (e) {
      return jid;
    }
  }

  // Procesar texto para reemplazar menciones LID (como en main.js)
  async function processTextMentions(text, groupId) {
    if (!text || !groupId || !text.includes('@')) return text;

    const mentionRegex = /@(\d{8,20})/g;
    const mentions = [...text.matchAll(mentionRegex)];

    if (!mentions.length) return text;

    let processedText = text;
    const processedMentions = new Set();

    for (const mention of mentions) {
      const [fullMatch, lidNumber] = mention;
      
      if (processedMentions.has(lidNumber)) continue;
      processedMentions.add(lidNumber);
      
      const lidJid = `${lidNumber}@lid`;

      try {
        const resolvedJid = await lidCacheManager.resolveLid(lidJid, groupId);
        if (resolvedJid && resolvedJid !== lidJid) {
          const resolvedNumber = resolvedJid.split('@')[0];
          const globalRegex = new RegExp(`@${lidNumber}`, 'g');
          processedText = processedText.replace(globalRegex, `@${resolvedNumber}`);
        }
      } catch (error) {
        // Error silencioso
      }
    }

    return processedText;
  }

  // Extraer JID real de atributos de mensaje
  function extractRealJid(messageAttrs) {
    try {
      if (!messageAttrs) return null;
      if (messageAttrs.participant_pn) {
        return messageAttrs.participant_pn;
      }
      if (messageAttrs.participant && messageAttrs.participant.endsWith?.('@lid')) {
        const lidPart = messageAttrs.participant.split('@')[0];
        if (lidPart.includes(':')) {
          const numberPart = lidPart.split(':')[0];
          return `${numberPart}@s.whatsapp.net`;
        }
      }
      return messageAttrs.participant;
    } catch (error) {
      return messageAttrs?.participant;
    }
  }

  // Crear placeholder para mensajes LID
  async function handleLidMessage(messageNode, isRetry = false) {
    if (!messageNode || !messageNode.attrs) return null;
    const attrs = messageNode.attrs;
    const messageId = attrs.id;
    const groupJid = attrs.from;
    const lidParticipant = attrs.participant;
    const realJid = extractRealJid(attrs);

    let resolved = lidParticipant;
    if (lidParticipant?.endsWith?.('@lid')) {
      const maybe = await lidCacheManager.resolveLid(lidParticipant, groupJid);
      if (maybe && !maybe.endsWith?.('@lid')) {
        resolved = maybe;
      } else if (realJid) {
        resolved = realJid;
      } else {
        resolved = maybe;
      }
    } else {
      resolved = realJid || lidParticipant;
    }

    const messageTimestamp = parseInt(attrs.t || `${Math.floor(Date.now() / 1000)}`);

    return {
      key: { 
        remoteJid: groupJid, 
        fromMe: false, 
        id: messageId, 
        participant: resolved || realJid 
      },
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
      _resolvedJid: resolved,
      _realJid: realJid,
      _retryCount: isRetry ? (pendingDecryption.get(messageId)?.retryCount || 0) + 1 : 0
    };
  }

  // Esperar por WebSocket listo
  function waitForWsReady(timeout = WS_WAIT_TIMEOUT) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        try {
          if (conn && conn.ws && conn.ws.readyState === 1) return resolve(true);
          if (Date.now() - start > timeout) return resolve(false);
          setTimeout(check, WS_WAIT_STEP);
        } catch (e) {
          return resolve(false);
        }
      };
      check();
    });
  }

  // Reintentar descifrado de LID
  async function retryLidDecryption(messageId, originalNode, retryCount = 0) {
    try {
      if (retryCount >= MAX_RETRIES) {
        errorStats.lidDecryptionErrors++;
        const errorMessage = await handleLidMessage(originalNode, true);
        if (errorMessage) {
          errorMessage.message.conversation = '⚠ No se pudo descifrar el mensaje web';
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

      setTimeout(async () => {
        try {
          const wsReady = await waitForWsReady();
          if (!wsReady) {
            setTimeout(() => retryLidDecryption(messageId, originalNode, retryCount + 1), 
              RETRY_DELAY * (retryCount + 2));
            return;
          }

          const groupJid = originalNode.attrs.from;
          const participantJid = extractRealJid(originalNode.attrs);

          let attemptOk = false;
          for (let attempt = 1; attempt <= SEND_RETRY_ATTEMPTS_PER_CYCLE; attempt++) {
            try {
              if (typeof conn.sendRetryRequest === 'function') {
                await conn.sendRetryRequest(groupJid, messageId, participantJid);
                attemptOk = true;
                break;
              } else {
                break;
              }
            } catch (retryErr) {
              await new Promise(r => setTimeout(r, 300));
            }
          }

          setTimeout(() => retryLidDecryption(messageId, originalNode, retryCount + 1), 
            RETRY_DELAY * (retryCount + 2));
        } catch (err) {
          setTimeout(() => retryLidDecryption(messageId, originalNode, retryCount + 1), 
            RETRY_DELAY * (retryCount + 2));
        }
      }, waitMs);

      return await handleLidMessage(originalNode, true);
    } catch (err) {
      return null;
    }
  }

  // Procesar mensajes para resolver LIDs y aplicar reemplazo de menciones
  async function processMessageLids(message) {
    try {
      if (!message || !message.key) return message;
      
      const groupChatId = message.key.remoteJid?.endsWith?.('@g.us') ? message.key.remoteJid : null;
      if (!groupChatId) return message;

      const processedMessage = { ...message };

      // Resolver participant LID
      if (processedMessage.key?.participant?.endsWith?.('@lid')) {
        const resolved = await lidCacheManager.resolveLid(processedMessage.key.participant, groupChatId);
        if (resolved && resolved !== processedMessage.key.participant) {
          processedMessage.key.participant = resolved;
        }
      }

      // Procesar mensaje para reemplazar menciones en texto
      if (processedMessage.message) {
        const messageTypes = Object.keys(processedMessage.message);
        
        for (const msgType of messageTypes) {
          const msgContent = processedMessage.message[msgType];
          if (!msgContent) continue;

          // Procesar texto principal
          if (msgContent.text) {
            msgContent.text = await processTextMentions(msgContent.text, groupChatId);
          }

          // Procesar caption
          if (msgContent.caption) {
            msgContent.caption = await processTextMentions(msgContent.caption, groupChatId);
          }

          // Resolver menciones en contextInfo
          if (msgContent?.contextInfo?.mentionedJid) {
            const resolvedMentions = [];
            for (const jid of msgContent.contextInfo.mentionedJid) {
              if (typeof jid === 'string' && jid.endsWith?.('@lid')) {
                const resolved = await lidCacheManager.resolveLid(jid, groupChatId);
                resolvedMentions.push(resolved);
              } else {
                resolvedMentions.push(jid);
              }
            }
            msgContent.contextInfo.mentionedJid = resolvedMentions;
          }

          // Resolver participant en contextInfo
          if (msgContent?.contextInfo?.participant?.endsWith?.('@lid')) {
            const resolved = await lidCacheManager.resolveLid(msgContent.contextInfo.participant, groupChatId);
            msgContent.contextInfo.participant = resolved;
          }

          // Procesar mensajes citados
          if (msgContent?.contextInfo?.quotedMessage) {
            const quotedTypes = Object.keys(msgContent.contextInfo.quotedMessage);
            
            for (const quotedType of quotedTypes) {
              const quotedContent = msgContent.contextInfo.quotedMessage[quotedType];
              if (!quotedContent) continue;
              
              if (quotedContent.text) {
                quotedContent.text = await processTextMentions(quotedContent.text, groupChatId);
              }
              
              if (quotedContent.caption) {
                quotedContent.caption = await processTextMentions(quotedContent.caption, groupChatId);
              }
            }
          }
        }
      }

      return processedMessage;
    } catch (err) {
      return message;
    }
  }

  // Funciones de store
  function loadMessage(jid, id = null) {
    try {
      if (!jid) return null;
      const realJid = decodeJidSafe(jid);
      if (!id) {
        const filter = m => m?.key?.id === jid;
        const found = Object.entries(messages).find(([, msgs]) => msgs.find(filter));
        return found?.[1]?.find(filter) || null;
      } else {
        if (!(realJid in messages)) return null;
        return messages[realJid]?.find(m => m.key.id === id) || null;
      }
    } catch (err) {
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
            Object.assign(chats[jid], { 
              subject: metadata.subject, 
              lastfetch: Date.now(), 
              metadata 
            });
          }
        } catch (err) {
          // Error silencioso
        }
      }
      return chats[jid].metadata;
    } catch (err) {
      // Error silencioso
    }
  }

  function upsertMessage(jid, message, type = 'append') {
    try {
      jid = decodeJidSafe(jid);
      if (!jid) return;
      if (!(jid in messages)) messages[jid] = [];

      delete message.message?.messageContextInfo;
      delete message.message?.senderKeyDistributionMessage;

      const existing = loadMessage(jid, message.key.id);
      if (existing) {
        if ((existing._isLidWebMessage || existing._lidDecryptError) && !message._isLidWebMessage && message.message && !message._finalError) {
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
        if (type === 'append') {
          messages[jid].push(message);
        } else {
          messages[jid].unshift(message);
        }
      }
    } catch (err) {
      // Error silencioso
    }
  }

  // Función bind principal
  function bind(connection) {
    conn = connection;
    if (!conn.chats) conn.chats = {};

    // Inicializar LidResolver
    lidResolver = new LidResolver(conn);

    // Envolver conn.ws.on para interceptar mensajes LID
    try {
      if (conn.ws && typeof conn.ws.on === 'function') {
        const originalOn = conn.ws.on.bind(conn.ws);
        conn.ws.on = function (event, handler) {
          if (event === 'CB:message') {
            const wrappedCBHandler = async function (node) {
              try {
                if (node && node.attrs && node.attrs.addressing_mode === 'lid') {
                  try {
                    const placeholder = await handleLidMessage(node);
                    if (placeholder) {
                      const jid = node.attrs.from;
                      upsertMessage(jid, proto.WebMessageInfo.fromObject(placeholder), 'append');
                      pendingDecryption.set(node.attrs.id, { 
                        originalNode: node, 
                        retryCount: 0, 
                        lastRetry: Date.now() 
                      });
                      setTimeout(() => retryLidDecryption(node.attrs.id, node, 0), 500);
                    }
                  } catch (inner) {
                    // Error silencioso
                  }
                }
              } catch (e) {
                // Error silencioso
              }
              return handler(node);
            };
            return originalOn(event, wrappedCBHandler);
          }

          if (event === 'message') {
            const wrappedHandler = async function (data) {
              try {
                return await handler(data);
              } catch (error) {
                try {
                  if (error && typeof error.message === 'string' && 
                      error.message.includes('error in handling message') && 
                      data?.attrs?.addressing_mode === 'lid') {
                    errorStats.webDesktopErrors++;
                    const placeholder = await handleLidMessage(data);
                    if (placeholder) {
                      const jid = data.attrs.from;
                      upsertMessage(jid, proto.WebMessageInfo.fromObject(placeholder), 'append');
                      pendingDecryption.set(data.attrs.id, { 
                        originalNode: data, 
                        retryCount: 0, 
                        lastRetry: Date.now() 
                      });
                      setTimeout(() => retryLidDecryption(data.attrs.id, data, 0), 500);
                    }
                    return;
                  }
                } catch (inner) {
                  // Error silencioso
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
      // Error silencioso
    }

    // Eventos de Baileys
    try {
      conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
        try {
          if (!['append', 'notify'].includes(type)) return;
          for (const msg of newMessages) {
            try {
              const jid = decodeJidSafe(msg.key.remoteJid);
              if (!jid || isJidBroadcast(jid)) continue;

              if (pendingDecryption.has(msg.key.id)) {
                pendingDecryption.delete(msg.key.id);
                errorStats.successfulRetries++;
              }

              const processed = await processMessageLids(msg);
              upsertMessage(jid, proto.WebMessageInfo.fromObject(processed), type);
            } catch (mErr) {
              try {
                const jid = decodeJidSafe(msg.key.remoteJid);
                upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
              } catch (_) {
                // Error silencioso
              }
            }
          }
        } catch (outer) {
          // Error silencioso
        }
      });

      conn.ev.on('messages.update', async updates => {
        try {
          for (const { key, update } of updates) {
            try {
              const jid = decodeJidSafe(key.remoteJid);
              const message = loadMessage(jid, key.id);
              if (message) {
                if ((message._isLidWebMessage || pendingDecryption.has(key.id)) && update.message) {
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
              // Error silencioso
            }
          }
        } catch (e) {
          // Error silencioso
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
              }
            } catch (e) {
              // Error silencioso
            }
          }
        } catch (e) {
          // Error silencioso
        }
      });

      // Eventos de chats y contactos
      conn.ev.on('chats.set', ({ chats: newChats }) => {
        for (const chat of newChats) {
          const jid = decodeJidSafe(chat.id);
          if (!(jid in chats)) chats[jid] = { id: jid };
          Object.assign(chats[jid], chat);
          conn.chats[jid] = chats[jid];
        }
      });

      conn.ev.on('contacts.set', ({ contacts: newContacts }) => {
        for (const contact of newContacts) {
          const jid = decodeJidSafe(contact.id);
          if (!(jid in contacts)) contacts[jid] = { id: jid };
          Object.assign(contacts[jid], contact);
          if (!(jid in chats)) chats[jid] = { id: jid };
          Object.assign(chats[jid], contact);
          conn.chats[jid] = chats[jid];
        }
      });

      conn.ev.on('chats.upsert', newChats => {
        for (const chat of newChats) {
          const jid = decodeJidSafe(chat.id);
          if (!(jid in chats)) chats[jid] = { id: jid };
          Object.assign(chats[jid], chat);
          conn.chats[jid] = chats[jid];
        }
      });

      conn.ev.on('chats.update', updates => {
        for (const update of updates) {
          const jid = decodeJidSafe(update.id);
          if (!(jid in chats)) chats[jid] = { id: jid };
          Object.assign(chats[jid], update);
          conn.chats[jid] = chats[jid];
        }
      });

      conn.ev.on('presence.update', ({ id, presences: updates }) => {
        const jid = decodeJidSafe(id);
        if (!(jid in chats)) chats[jid] = { id: jid };
        Object.assign(chats[jid], { 
          presences: { 
            ...(chats[jid].presences || {}), 
            ...updates 
          } 
        });
        conn.chats[jid] = chats[jid];
      });

      conn.ev.on('groups.update', async (updates) => {
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
            }
          } catch (_) {
            // Error silencioso
          }
          conn.chats[jid] = chats[jid];
        }
      });

      conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
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
          }
        } catch (_) {
          // Error silencioso
        }
        conn.chats[jid] = chats[jid];
      });

    } catch (e) {
      // Error silencioso
    }
  }

  // Funciones de limpieza
  function getErrorStats() {
    return {
      ...errorStats,
      pendingDecryption: pendingDecryption.size,
      cacheSize: lidCacheManager.cache.size,
      jidMappings: lidCacheManager.jidToLidMap.size
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
    return cleaned;
  }

  // Limpiar mensajes pendientes cada 30 minutos
  setInterval(cleanupPendingMessages, 30 * 60 * 1000);

  // Serialización
  function toJSON() {
    return { chats, messages, contacts };
  }

  function fromJSON(json) {
    Object.assign(chats, json.chats || {});
    Object.assign(contacts, json.contacts || {});
    for (const jid in json.messages || {}) {
      messages[jid] = (json.messages[jid] || [])
        .map(m => m && proto.WebMessageInfo.fromObject(m))
        .filter(Boolean);
    }
  }

  // API pública
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
    lidResolver: {
      async resolve(lidJid, groupChatId) { 
        return await lidCacheManager.resolveLid(lidJid, groupChatId);
      },
      add(lidKey, jid, name = null) {
        if (lidCacheManager.cache.has(lidKey)) return;
        const entry = { 
          jid, 
          lid: `${lidKey}@lid`, 
          name: name || jid.split('@')[0], 
          timestamp: Date.now(), 
          manual: true 
        };
        lidCacheManager.cache.set(lidKey, entry);
        lidCacheManager.jidToLidMap.set(jid, `${lidKey}@lid`);
        lidCacheManager.isDirty = true;
      },
      get cache() { 
        return lidCacheManager.cache; 
      },
      getStats() { 
        return getErrorStats(); 
      },
      forceSave() { 
        lidCacheManager.saveCache(); 
      },
      forceRetryPending() {
        let retriedCount = 0;
        for (const [messageId, data] of pendingDecryption.entries()) {
          if (data.originalNode) {
            setTimeout(() => retryLidDecryption(messageId, data.originalNode, 0), 
              retriedCount * 1000);
            retriedCount++;
          }
        }
        return retriedCount;
      },
      clearErrors() {
        const cleared = {
          pendingDecryption: pendingDecryption.size,
          errorStats: { ...errorStats }
        };
        pendingDecryption.clear();
        errorStats = {
          lidDecryptionErrors: 0,
          webDesktopErrors: 0,
          successfulRetries: 0,
          totalRetries: 0
        };
        return cleared;
      },
      getStatus() {
        return {
          lidCache: lidCacheManager.cache.size,
          jidMappings: lidCacheManager.jidToLidMap.size,
          pendingDecryption: pendingDecryption.size,
          errorStats,
          isDirty: lidCacheManager.isDirty,
          cacheFile: lidCacheManager.cacheFile
        };
      }
    },
    getErrorStats,
    cleanupPendingMessages
  };
}

export default makeInMemoryStore();
