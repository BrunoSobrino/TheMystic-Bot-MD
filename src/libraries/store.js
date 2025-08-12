/*
 * Enhanced WhatsApp Store with specialized LID decryption handling
 * Soluciona errores específicos de mensajes desde WhatsApp Web/Desktop
 */

import fs from 'fs';
import path from 'path';
const { BufferJSON, proto, isJidBroadcast, WAMessageStubType, updateMessageWithReceipt, updateMessageWithReaction, jidNormalizedUser } = (await import('baileys')).default;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const RETRY_DELAY = 3000; // 3 segundos para retry
const MAX_RETRIES = 5; // Aumentado para LID messages

function makeInMemoryStore() {
    let chats = {};
    let messages = {};
    let contacts = {};
    let state = { connection: 'close' };
    
    // Sistema de retry especializado para LID messages
    const lidRetryQueue = new Map();
    const failedLidMessages = new Map();
    const pendingDecryption = new Map();
    
    // LID Cache integrado
    const cacheFile = path.join(process.cwd(), 'lidsresolve.json');
    let lidCache = new Map();
    let jidToLidMap = new Map();
    let isDirty = false;
    let conn = null;
    
    // Estadísticas de errores
    let errorStats = {
        lidDecryptionErrors: 0,
        webDesktopErrors: 0,
        successfulRetries: 0,
        totalRetries: 0
    };
    
    // Cargar cache LID al inicializar
    function loadLidCache() {
        try {
            if (fs.existsSync(cacheFile)) {
                const data = fs.readFileSync(cacheFile, 'utf8');
                const parsed = JSON.parse(data);
                
                for (const [key, entry] of Object.entries(parsed)) {
                    if (entry && typeof entry === 'object' && entry.jid && entry.lid) {
                        lidCache.set(key, entry);
                        if (entry.jid.includes('@s.whatsapp.net')) {
                            jidToLidMap.set(entry.jid, entry.lid);
                        }
                    }
                }
                console.log(`📱 Cache LID cargado: ${lidCache.size} entradas`);
            }
        } catch (error) {
            console.error('❌ Error cargando cache LID:', error.message);
            lidCache = new Map();
            jidToLidMap = new Map();
        }
    }
    
    // Guardar cache LID
    function saveLidCache() {
        try {
            const data = {};
            for (const [key, value] of lidCache.entries()) {
                data[key] = value;
            }
            fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
            isDirty = false;
        } catch (error) {
            console.error('❌ Error guardando cache LID:', error.message);
        }
    }
    
    // Auto-guardado del cache
    setInterval(() => {
        if (isDirty) saveLidCache();
    }, 30000);
    
    // Resolver LID usando cache y conexión activa
    async function resolveLidFromCache(lidJid, groupChatId) {
        if (!lidJid.endsWith('@lid')) {
            return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
        }
        
        const lidKey = lidJid.split('@')[0];
        
        // Verificar cache primero
        if (lidCache.has(lidKey)) {
            const cached = lidCache.get(lidKey);
            if (cached.jid && !cached.jid.endsWith('@lid')) {
                return cached.jid;
            }
        }
        
        // Si no está en cache y tenemos conexión, intentar resolver
        if (conn && groupChatId?.endsWith('@g.us')) {
            try {
                const metadata = await conn.groupMetadata(groupChatId);
                if (metadata?.participants) {
                    for (const participant of metadata.participants) {
                        try {
                            // Comparar directamente con participant_pn si está disponible
                            if (participant.jid.includes(lidKey.replace(':', ''))) {
                                const entry = {
                                    jid: participant.jid,
                                    lid: lidJid,
                                    name: participant.jid.split('@')[0],
                                    timestamp: Date.now(),
                                    groupJid: groupChatId
                                };
                                
                                lidCache.set(lidKey, entry);
                                jidToLidMap.set(participant.jid, lidJid);
                                isDirty = true;
                                
                                return participant.jid;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            } catch (e) {
                // Silencioso
            }
        }
        
        return lidJid; // Fallback
    }

    // Detectar si un mensaje es de WhatsApp Web/Desktop
    function isWebDesktopMessage(messageNode) {
        if (!messageNode || !messageNode.attrs) return false;
        
        const attrs = messageNode.attrs;
        return (
            attrs.addressing_mode === 'lid' && 
            attrs.participant?.includes('@lid') &&
            attrs.participant_pn && 
            attrs.participant_pn.includes('@s.whatsapp.net')
        );
    }

    // Extraer JID real desde participant_pn
    function extractRealJid(messageAttrs) {
        if (messageAttrs.participant_pn) {
            return messageAttrs.participant_pn;
        }
        
        // Fallback: intentar extraer desde participant LID
        if (messageAttrs.participant?.endsWith('@lid')) {
            const lidPart = messageAttrs.participant.split('@')[0];
            // Intentar construir JID desde LID
            if (lidPart.includes(':')) {
                const numberPart = lidPart.split(':')[0];
                return `${numberPart}@s.whatsapp.net`;
            }
        }
        
        return messageAttrs.participant;
    }

    // Manejar mensajes LID específicamente
    async function handleLidMessage(messageNode, isRetry = false) {
        if (!messageNode || !messageNode.attrs) return null;

        const attrs = messageNode.attrs;
        const messageId = attrs.id;
        const groupJid = attrs.from;
        const lidParticipant = attrs.participant;
        const realJid = extractRealJid(attrs);
        
        if (!isRetry) {
            console.log(`🔍 Procesando mensaje LID: ${messageId}`);
            console.log(`   Grupo: ${groupJid}`);
            console.log(`   LID Participant: ${lidParticipant}`);
            console.log(`   Real JID: ${realJid}`);
        }

        // Intentar resolver el LID
        let resolvedJid = realJid;
        if (lidParticipant?.endsWith('@lid')) {
            resolvedJid = await resolveLidFromCache(lidParticipant, groupJid);
            if (resolvedJid !== lidParticipant && !resolvedJid.endsWith('@lid')) {
                console.log(`✅ LID resuelto: ${lidParticipant} -> ${resolvedJid}`);
            }
        }

        // Crear estructura de mensaje compatible
        const messageKey = {
            remoteJid: groupJid,
            fromMe: false,
            id: messageId,
            participant: resolvedJid || realJid
        };

        // Crear mensaje placeholder para Web/Desktop
        const placeholderMessage = {
            key: messageKey,
            messageTimestamp: parseInt(attrs.t || Date.now() / 1000),
            pushName: attrs.notify || 'Usuario Web',
            message: {
                conversation: isRetry ? 
                    `🔄 Reintentando descifrar mensaje web... (${Math.floor(Math.random() * 1000)})` :
                    '🌐 Mensaje desde Web/Desktop - Procesando...'
            },
            messageStubType: proto.WebMessageInfo.StubType.CIPHERTEXT,
            status: proto.WebMessageInfo.Status.PENDING,
            _isLidWebMessage: true,
            _originalNode: messageNode,
            _resolvedJid: resolvedJid,
            _realJid: realJid,
            _retryCount: isRetry ? (pendingDecryption.get(messageId)?.retryCount || 0) + 1 : 0
        };

        return placeholderMessage;
    }

    // Sistema de retry específico para mensajes LID
    async function retryLidDecryption(messageId, originalNode, retryCount = 0) {
        if (retryCount >= MAX_RETRIES) {
            console.log(`❌ Mensaje LID ${messageId} falló después de ${MAX_RETRIES} intentos`);
            errorStats.lidDecryptionErrors++;
            
            // Crear mensaje de error final
            const errorMessage = await handleLidMessage(originalNode, true);
            if (errorMessage) {
                errorMessage.message.conversation = '❌ No se pudo descifrar el mensaje web';
                errorMessage.status = proto.WebMessageInfo.Status.ERROR;
                errorMessage._finalError = true;
            }
            
            pendingDecryption.delete(messageId);
            return errorMessage;
        }

        errorStats.totalRetries++;
        console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES} para mensaje ${messageId}`);

        // Actualizar contador en pendingDecryption
        const pending = pendingDecryption.get(messageId) || {};
        pending.retryCount = retryCount + 1;
        pending.lastRetry = Date.now();
        pendingDecryption.set(messageId, pending);

        // Programar siguiente retry
        setTimeout(async () => {
            try {
                // Intentar obtener el mensaje real desde la conexión
                if (conn && conn.ws && conn.ws.readyState === 1) {
                    
                    // Solicitar reenvío específico para mensajes LID
                    try {
                        const groupJid = originalNode.attrs.from;
                        const participantJid = extractRealJid(originalNode.attrs);
                        
                        if (groupJid && participantJid) {
                            await conn.sendRetryRequest(groupJid, messageId, participantJid);
                            console.log(`📤 Retry request enviado para ${messageId}`);
                        }
                    } catch (retryError) {
                        console.error(`❌ Error enviando retry request: ${retryError.message}`);
                    }
                    
                    // Programar siguiente intento
                    setTimeout(() => {
                        retryLidDecryption(messageId, originalNode, retryCount + 1);
                    }, RETRY_DELAY * (retryCount + 2)); // Delay incremental
                }
            } catch (error) {
                console.error(`❌ Error en retry LID ${messageId}:`, error.message);
                retryLidDecryption(messageId, originalNode, retryCount + 1);
            }
        }, RETRY_DELAY * (retryCount + 1));

        // Retornar mensaje de retry actualizado
        return await handleLidMessage(originalNode, true);
    }
    
    // Procesar mensaje para resolver LIDs (función original mejorada)
    async function processMessageLids(message) {
        if (!message || !message.key) return message;
        
        const groupChatId = message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null;
        if (!groupChatId) return message;
        
        const processedMessage = { ...message };
        
        // Resolver participant
        if (processedMessage.key?.participant?.endsWith('@lid')) {
            const resolved = await resolveLidFromCache(processedMessage.key.participant, groupChatId);
            if (resolved !== processedMessage.key.participant) {
                processedMessage.key.participant = resolved;
            }
        }
        
        // Procesar mentions y contextInfo
        if (processedMessage.message) {
            const messageTypes = Object.keys(processedMessage.message);
            for (const msgType of messageTypes) {
                const msgContent = processedMessage.message[msgType];
                if (msgContent?.contextInfo?.mentionedJid) {
                    const resolvedMentions = [];
                    for (const jid of msgContent.contextInfo.mentionedJid) {
                        if (typeof jid === 'string' && jid.endsWith('@lid')) {
                            const resolved = await resolveLidFromCache(jid, groupChatId);
                            resolvedMentions.push(resolved);
                        } else {
                            resolvedMentions.push(jid);
                        }
                    }
                    msgContent.contextInfo.mentionedJid = resolvedMentions;
                }
                
                if (msgContent?.contextInfo?.participant?.endsWith('@lid')) {
                    msgContent.contextInfo.participant = await resolveLidFromCache(
                        msgContent.contextInfo.participant, 
                        groupChatId
                    );
                }
            }
        }
        
        return processedMessage;
    }

    function loadMessage(jid, id = null) {
        let message = null;
        if (jid && !id) {
            id = jid;
            const filter = m => m.key?.id == id;
            const messageFind = Object.entries(messages).find(([, msgs]) => msgs.find(filter));
            message = messageFind?.[1]?.find(filter);
        } else {
            jid = jid?.decodeJid?.();
            if (!(jid in messages)) return null;
            message = messages[jid]?.find(m => m.key.id == id);
        }
        return message || null;
    }

    function isJidGroup(jid) {
        return jid?.endsWith?.('@g.us');
    }

    async function fetchGroupMetadata(jid, groupMetadataFunc) {
        jid = jid?.decodeJid?.();
        if (!isJidGroup(jid)) return;
        if (!(jid in chats)) return (chats[jid] = { id: jid });
        
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
            } catch (error) {
                // Silencioso
            }
        }
        return chats[jid].metadata;
    }

    function upsertMessage(jid, message, type = 'append') {
        jid = jid?.decodeJid?.();
        if (!(jid in messages)) messages[jid] = [];
        
        // Limpiar datos innecesarios
        delete message.message?.messageContextInfo;
        delete message.message?.senderKeyDistributionMessage;
        
        const msg = loadMessage(jid, message.key.id);
        if (msg) {
            // Si el mensaje existente es un placeholder LID y el nuevo es válido, reemplazar
            if ((msg._isLidWebMessage || msg._lidDecryptError) && !message._isLidWebMessage && message.message && !message._finalError) {
                console.log(`✅ Reemplazando placeholder LID con mensaje real: ${message.key.id}`);
                Object.assign(msg, message);
                
                // Limpiar flags de error/placeholder
                delete msg._isLidWebMessage;
                delete msg._lidDecryptError;
                delete msg._retryCount;
                delete msg._originalNode;
                
                // Remover de colas de retry
                pendingDecryption.delete(message.key.id);
                errorStats.successfulRetries++;
            } else {
                Object.assign(msg, message);
            }
        } else {
            if (type === 'append') {
                messages[jid].push(message);
            } else {
                messages[jid].unshift(message);
            }
        }
    }

    function bind(connection) {
        conn = connection;
        if (!conn.chats) conn.chats = {};
        
        // Cargar cache LID
        loadLidCache();

        // INTERCEPTAR ERRORES DE MANEJO DE MENSAJES DIRECTAMENTE
        const originalEmitError = conn.ev.emit.bind(conn.ev);
        conn.ev.emit = function(event, ...args) {
            if (event === 'connection.update' && args[0]?.lastDisconnect?.error?.message?.includes('error in handling message')) {
                // Capturar el error pero no propagarlo
                console.log('🔄 Error de manejo de mensaje interceptado y manejado');
                return;
            }
            return originalEmitError(event, ...args);
        };

        // HOOK PRINCIPAL: Interceptar errores de procesamiento de mensajes
        const originalProcessMessage = conn.ws?.on;
        if (conn.ws && typeof conn.ws.on === 'function') {
            const originalOn = conn.ws.on.bind(conn.ws);
            conn.ws.on = function(event, handler) {
                if (event === 'message') {
                    // Interceptar mensajes entrantes para manejar LID errors
                    const wrappedHandler = async function(data) {
                        try {
                            return await handler(data);
                        } catch (error) {
                            if (error.message?.includes('error in handling message') && data?.attrs?.addressing_mode === 'lid') {
                                console.log(`🌐 Detectado mensaje Web/Desktop con error: ${data.attrs.id}`);
                                errorStats.webDesktopErrors++;
                                
                                // Crear y almacenar placeholder
                                const placeholder = await handleLidMessage(data);
                                if (placeholder) {
                                    const jid = data.attrs.from;
                                    upsertMessage(jid, proto.WebMessageInfo.fromObject(placeholder), 'append');
                                    
                                    // Iniciar proceso de retry
                                    setTimeout(() => {
                                        retryLidDecryption(data.attrs.id, data, 0);
                                    }, 1000);
                                }
                                return; // No propagar el error
                            }
                            throw error;
                        }
                    };
                    return originalOn(event, wrappedHandler);
                }
                return originalOn(event, handler);
            };
        }

        conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    
                    try {
                        // Verificar si es un mensaje exitosamente descifrado después de retry
                        if (pendingDecryption.has(msg.key.id)) {
                            console.log(`🎉 Mensaje LID descifrado exitosamente: ${msg.key.id}`);
                            pendingDecryption.delete(msg.key.id);
                            errorStats.successfulRetries++;
                        }
                        
                        // Procesar LIDs normalmente
                        const processedMsg = await processMessageLids(msg);
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(processedMsg), type);
                        
                    } catch (error) {
                        console.error(`❌ Error en upsert de mensaje ${msg.key.id}:`, error.message);
                        // Usar mensaje original como fallback
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
                    }
                }
            }
        });

        conn.ev.on('messages.update', async updates => {
            for (const { key, update } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    try {
                        // Si es una actualización de un mensaje LID pendiente
                        if ((message._isLidWebMessage || pendingDecryption.has(key.id)) && update.message) {
                            console.log(`✅ Actualización de mensaje LID recibida: ${key.id}`);
                            
                            const processedUpdate = await processMessageLids({ key, ...update });
                            Object.assign(message, processedUpdate);
                            
                            // Limpiar flags y colas
                            delete message._isLidWebMessage;
                            delete message._retryCount;
                            delete message._originalNode;
                            pendingDecryption.delete(key.id);
                            errorStats.successfulRetries++;
                        } else {
                            const processedUpdate = await processMessageLids({ key, ...update });
                            Object.assign(message, processedUpdate);
                        }
                    } catch (error) {
                        console.error(`❌ Error actualizando mensaje ${key.id}:`, error.message);
                        Object.assign(message, update);
                    }
                }
            }
        });

        conn.ev.on('message-receipt.update', updates => {
            for (const { key, receipt } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    updateMessageWithReceipt(message, receipt);
                    
                    // Manejar receipts de retry para mensajes LID
                    if (receipt.type === 'retry' && pendingDecryption.has(key.id)) {
                        console.log(`🔄 Retry receipt para mensaje LID: ${key.id}`);
                    }
                }
            }
        });

        conn.ev.on('messages.reaction', updates => {
            for (const { key, reaction } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    updateMessageWithReaction(message, reaction);
                }
            }
        });

        // Resto de eventos sin cambios...
        conn.ev.on('chats.set', ({ chats: newChats }) => {
            for (const chat of newChats) {
                const jid = chat.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], chat);
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('contacts.set', ({ contacts: newContacts }) => {
            for (const contact of newContacts) {
                const jid = contact.id.decodeJid();
                if (!(jid in contacts)) contacts[jid] = { id: jid };
                Object.assign(contacts[jid], contact);
                
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], contact);
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('chats.upsert', newChats => {
            for (const chat of newChats) {
                const jid = chat.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], chat);
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('chats.update', updates => {
            for (const update of updates) {
                const jid = update.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], update);
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('presence.update', ({ id, presences: updates }) => {
            const jid = id.decodeJid();
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], { 
                presences: { 
                    ...chats[jid].presences, 
                    ...updates 
                } 
            });
            conn.chats[jid] = chats[jid];
        });

        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                const jid = update.id?.decodeJid?.();
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
                } catch (error) {
                    // Silencioso
                }
                
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
            if (!id) return;
            const jid = id.decodeJid();
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
            } catch (error) {
                // Silencioso
            }
            
            conn.chats[jid] = chats[jid];
        });
    }

    // Actualizar cache LID desde metadata de grupo
    async function updateLidCacheFromMetadata(metadata, groupJid) {
        if (!metadata?.participants || !conn) return;
        
        for (const participant of metadata.participants) {
            try {
                // Intentar construir LID desde JID
                const phoneNumber = participant.jid.split('@')[0];
                const possibleLid = `${phoneNumber}:13@lid`; // Formato común de LID
                
                if (!lidCache.has(phoneNumber)) {
                    const entry = {
                        jid: participant.jid,
                        lid: possibleLid,
                        name: participant.jid.split('@')[0],
                        timestamp: Date.now(),
                        groupJid: groupJid,
                        inferred: true
                    };
                    
                    lidCache.set(phoneNumber, entry);
                    jidToLidMap.set(participant.jid, possibleLid);
                    isDirty = true;
                }
            } catch (e) {
                continue;
            }
        }
    }

    // Función para obtener estadísticas completas
    function getErrorStats() {
        return {
            ...errorStats,
            pendingDecryption: pendingDecryption.size,
            cacheSize: lidCache.size,
            jidMappings: jidToLidMap.size,
            pendingMessages: Array.from(pendingDecryption.entries()).map(([id, data]) => ({
                id,
                retryCount: data.retryCount,
                lastRetry: data.lastRetry
            }))
        };
    }

    // Limpiar mensajes pendientes antiguos
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

    // Limpiar cada 30 minutos
    setInterval(cleanupPendingMessages, 30 * 60 * 1000);

    function toJSON() {
        return { 
            chats, 
            messages, 
            contacts 
        };
    }

    function fromJSON(json) {
        Object.assign(chats, json.chats || {});
        Object.assign(contacts, json.contacts || {});
        
        for (const jid in json.messages || {}) {
            messages[jid] = (json.messages[jid] || []).map(m => 
                m && proto.WebMessageInfo.fromObject(m)
            ).filter(Boolean);
        }
    }

    const lidResolver = {
        async resolve(lidJid, groupChatId) {
            return await resolveLidFromCache(lidJid, groupChatId);
        },
        
        add(lidKey, jid, name = null) {
            if (lidCache.has(lidKey)) return;
            
            const entry = {
                jid: jid,
                lid: `${lidKey}@lid`,
                name: name || jid.split('@')[0],
                timestamp: Date.now(),
                manual: true
            };
            
            lidCache.set(lidKey, entry);
            jidToLidMap.set(jid, `${lidKey}@lid`);
            isDirty = true;
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
        
        // Función para forzar retry de mensajes pendientes
        forceRetryPending() {
            let retriedCount = 0;
            for (const [messageId, data] of pendingDecryption.entries()) {
                if (data.originalNode) {
                    setTimeout(() => {
                        retryLidDecryption(messageId, data.originalNode, 0);
                        retriedCount++;
                    }, retriedCount * 1000); // Escalonar retries
                }
            }
            return retriedCount;
        },
        
        // Función para limpiar errores y mensajes pendientes
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
        
        // Función para mostrar estado actual
        getStatus() {
            return {
                lidCache: lidCache.size,
                jidMappings: jidToLidMap.size,
                pendingDecryption: pendingDecryption.size,
                errorStats,
                isDirty,
                cacheFile: cacheFile
            };
        }
    };

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
        
        // Funciones específicas para debugging
        handleLidMessage,
        retryLidDecryption,
        isWebDesktopMessage,
        extractRealJid
    };
}

export default makeInMemoryStore();
