/*
 * Enhanced WhatsApp Store with improved decryption error handling
 * Soluciona errores de descifrado desde WhatsApp Web/Desktop
 */

import fs from 'fs';
import path from 'path';
const { BufferJSON, proto, isJidBroadcast, WAMessageStubType, updateMessageWithReceipt, updateMessageWithReaction, jidNormalizedUser } = (await import('baileys')).default;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const RETRY_DELAY = 2000; // 2 segundos para retry
const MAX_RETRIES = 3;

function makeInMemoryStore() {
    let chats = {};
    let messages = {};
    let contacts = {};
    let state = { connection: 'close' };
    
    // Sistema de retry para mensajes fallidos
    const retryQueue = new Map();
    const failedMessages = new Map();
    
    // LID Cache integrado
    const cacheFile = path.join(process.cwd(), 'lidsresolve.json');
    let lidCache = new Map();
    let jidToLidMap = new Map();
    let isDirty = false;
    let conn = null;
    
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
            }
        } catch (error) {
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
            // Silencioso
        }
    }
    
    // Auto-guardado del cache
    setInterval(() => {
        if (isDirty) saveLidCache();
    }, 30000);
    
    // Resolver LID usando cache
    async function resolveLidFromCache(lidJid, groupChatId) {
        if (!lidJid.endsWith('@lid')) {
            return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
        }
        
        const lidKey = lidJid.split('@')[0];
        
        // Verificar cache
        if (lidCache.has(lidKey)) {
            return lidCache.get(lidKey).jid;
        }
        
        // Si no está en cache y tenemos conexión, intentar resolver
        if (conn && groupChatId?.endsWith('@g.us')) {
            try {
                const metadata = await conn.groupMetadata(groupChatId);
                if (metadata?.participants) {
                    for (const participant of metadata.participants) {
                        try {
                            const contactDetails = await conn.onWhatsApp(participant.jid);
                            if (contactDetails?.[0]?.lid) {
                                const participantLid = contactDetails[0].lid.split('@')[0];
                                if (participantLid === lidKey) {
                                    const entry = {
                                        jid: participant.jid,
                                        lid: lidJid,
                                        name: contactDetails[0].name || participant.jid.split('@')[0],
                                        timestamp: Date.now()
                                    };
                                    
                                    lidCache.set(lidKey, entry);
                                    jidToLidMap.set(participant.jid, contactDetails[0].lid);
                                    isDirty = true;
                                    
                                    return participant.jid;
                                }
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
        
        return lidJid;
    }
    
    // Procesar mensaje para resolver LIDs
    async function processMessageLids(message) {
        if (!message || !message.key) return message;
        
        const groupChatId = message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null;
        if (!groupChatId) return message;
        
        const processedMessage = { ...message };
        
        // Resolver participant
        if (processedMessage.key?.participant?.endsWith('@lid')) {
            processedMessage.key.participant = await resolveLidFromCache(
                processedMessage.key.participant, 
                groupChatId
            );
        }
        
        // Resolver mentions en contextInfo
        if (processedMessage.message) {
            const messageTypes = Object.keys(processedMessage.message);
            for (const msgType of messageTypes) {
                const msgContent = processedMessage.message[msgType];
                if (msgContent?.contextInfo?.mentionedJid) {
                    const resolvedMentions = [];
                    for (const jid of msgContent.contextInfo.mentionedJid) {
                        if (typeof jid === 'string' && jid.endsWith('@lid')) {
                            resolvedMentions.push(await resolveLidFromCache(jid, groupChatId));
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

    // Sistema de retry para mensajes fallidos
    async function retryFailedMessage(messageKey, retryCount = 0) {
        if (retryCount >= MAX_RETRIES) {
            console.log(`❌ Mensaje ${messageKey.id} falló después de ${MAX_RETRIES} intentos`);
            return null;
        }

        try {
            if (conn && conn.ws && conn.ws.readyState === 1) {
                // Solicitar reenvío del mensaje
                await conn.sendRetryRequest(messageKey.remoteJid, messageKey.id, messageKey.participant);
                
                // Programar siguiente retry si es necesario
                setTimeout(() => {
                    const currentRetryCount = retryQueue.get(messageKey.id) || 0;
                    if (currentRetryCount < MAX_RETRIES) {
                        retryQueue.set(messageKey.id, currentRetryCount + 1);
                        retryFailedMessage(messageKey, currentRetryCount + 1);
                    }
                }, RETRY_DELAY * (retryCount + 1));
            }
        } catch (error) {
            console.error(`❌ Error en retry del mensaje ${messageKey.id}:`, error.message);
        }
    }

    // Manejar errores de desencriptación mejorado
    function handleDecryptionError(message, error) {
        const key = message.key || message.attrs;
        const participant = key?.participant;
        const messageId = key?.id;
        
        // Registrar error para estadísticas
        if (messageId) {
            failedMessages.set(messageId, {
                key: key,
                error: error.message,
                timestamp: Date.now(),
                attempts: 0
            });
        }

        // Si es un LID, intentar resolverlo y crear placeholder
        if (participant?.endsWith('@lid')) {
            // Programar retry automático
            if (messageId && conn) {
                setTimeout(() => {
                    retryFailedMessage(key, 0);
                }, RETRY_DELAY);
            }

            const placeholderMessage = {
                key: {
                    remoteJid: key.from || key.remoteJid,
                    fromMe: false,
                    id: key.id,
                    participant: participant
                },
                messageTimestamp: parseInt(key.t || Date.now() / 1000),
                message: {
                    conversation: '🔐 Mensaje cifrado - Reintentando...'
                },
                messageStubType: proto.WebMessageInfo.StubType.CIPHERTEXT,
                status: proto.WebMessageInfo.Status.PENDING,
                pushName: key.notify || 'Usuario',
                _lidDecryptError: true,
                _retryScheduled: true
            };
            
            return placeholderMessage;
        }
        
        // Para mensajes regulares, también crear placeholder temporal
        const placeholderMessage = {
            key: {
                remoteJid: key.from || key.remoteJid,
                fromMe: false,
                id: key.id,
                participant: participant
            },
            messageTimestamp: parseInt(key.t || Date.now() / 1000),
            message: {
                conversation: '🔐 Error de descifrado'
            },
            messageStubType: proto.WebMessageInfo.StubType.CIPHERTEXT,
            status: proto.WebMessageInfo.Status.ERROR,
            pushName: key.notify || 'Usuario',
            _decryptError: true
        };

        // Programar retry para mensajes regulares también
        if (messageId && conn) {
            setTimeout(() => {
                retryFailedMessage(key, 0);
            }, RETRY_DELAY);
        }
        
        return placeholderMessage;
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
            // Si el mensaje existente es un placeholder de error y el nuevo es válido, reemplazar
            if (msg._lidDecryptError || msg._decryptError) {
                if (!message._lidDecryptError && !message._decryptError && message.message) {
                    Object.assign(msg, message);
                    // Limpiar flags de error
                    delete msg._lidDecryptError;
                    delete msg._decryptError;
                    delete msg._retryScheduled;
                    
                    // Remover de cola de retry
                    if (retryQueue.has(message.key.id)) {
                        retryQueue.delete(message.key.id);
                    }
                    if (failedMessages.has(message.key.id)) {
                        failedMessages.delete(message.key.id);
                    }
                }
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

        // Interceptar y mejorar el manejo de errores de descifrado
        const originalDecrypt = conn.ws?.socket?.decrypt;
        if (originalDecrypt && conn.ws?.socket) {
            conn.ws.socket.decrypt = function(message, ...args) {
                try {
                    return originalDecrypt.call(this, message, ...args);
                } catch (error) {
                    if (error.message?.includes('No session found to decrypt message')) {
                        console.log(`🔄 Reintentando descifrado para mensaje ${message.key?.id}`);
                        // Programar retry automático
                        if (message.key?.id) {
                            setTimeout(() => {
                                retryFailedMessage(message.key, 0);
                            }, RETRY_DELAY);
                        }
                    }
                    throw error;
                }
            };
        }

        conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    
                    try {
                        // Verificar si el mensaje tiene contenido cifrado sin sesión
                        if (msg.message?.senderKeyDistributionMessage && !msg.message?.conversation && !msg.message?.extendedTextMessage) {
                            console.log(`🔑 Mensaje con distribución de claves detectado: ${msg.key.id}`);
                            
                            // Crear placeholder temporal mientras se establece la sesión
                            const tempMessage = {
                                ...msg,
                                message: {
                                    conversation: '🔑 Estableciendo sesión de cifrado...'
                                },
                                _sessionPending: true
                            };
                            
                            upsertMessage(jid, proto.WebMessageInfo.fromObject(tempMessage), type);
                            
                            // Programar retry después de establecer sesión
                            setTimeout(async () => {
                                try {
                                    // Intentar procesar el mensaje nuevamente
                                    const processedMsg = await processMessageLids(msg);
                                    upsertMessage(jid, proto.WebMessageInfo.fromObject(processedMsg), 'append');
                                } catch (retryError) {
                                    console.log(`❌ Retry falló para ${msg.key.id}: ${retryError.message}`);
                                    const errorMsg = handleDecryptionError(msg, retryError);
                                    if (errorMsg) {
                                        upsertMessage(jid, proto.WebMessageInfo.fromObject(errorMsg), 'append');
                                    }
                                }
                            }, 3000);
                            
                            continue;
                        }

                        // Procesar LIDs antes de upsert
                        const processedMsg = await processMessageLids(msg);
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(processedMsg), type);
                        
                        // Si el mensaje se procesó correctamente, remover de failed messages
                        if (failedMessages.has(msg.key.id)) {
                            failedMessages.delete(msg.key.id);
                            retryQueue.delete(msg.key.id);
                        }
                        
                    } catch (error) {
                        if (error.message?.includes('No session found to decrypt message') || 
                            error.message?.includes('Failed to decrypt')) {
                            
                            console.log(`🔄 Error de descifrado para ${msg.key.id}, creando placeholder`);
                            const errorMsg = handleDecryptionError(msg, error);
                            if (errorMsg) {
                                upsertMessage(jid, proto.WebMessageInfo.fromObject(errorMsg), type);
                            }
                        } else {
                            // Para otros errores, usar mensaje original
                            console.error(`❌ Error procesando mensaje ${msg.key.id}:`, error.message);
                            upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
                        }
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
                        // Si es una actualización de un mensaje que falló anteriormente
                        if (message._lidDecryptError || message._decryptError || message._sessionPending) {
                            // Verificar si la actualización incluye contenido descifrado
                            if (update.message && !update._lidDecryptError && !update._decryptError) {
                                console.log(`✅ Mensaje ${key.id} descifrado exitosamente en actualización`);
                                
                                // Procesar LIDs en la actualización
                                const processedUpdate = await processMessageLids({ key, ...update });
                                Object.assign(message, processedUpdate);
                                
                                // Limpiar flags de error
                                delete message._lidDecryptError;
                                delete message._decryptError;
                                delete message._sessionPending;
                                delete message._retryScheduled;
                                
                                // Remover de colas de retry
                                if (retryQueue.has(key.id)) retryQueue.delete(key.id);
                                if (failedMessages.has(key.id)) failedMessages.delete(key.id);
                                
                                continue;
                            }
                        }
                        
                        const processedUpdate = await processMessageLids({ key, ...update });
                        Object.assign(message, processedUpdate);
                    } catch (error) {
                        console.error(`❌ Error actualizando mensaje ${key.id}:`, error.message);
                        Object.assign(message, update);
                    }
                }
            }
        });

        // Mejorar manejo de receipts para mensajes con errores
        conn.ev.on('message-receipt.update', updates => {
            for (const { key, receipt } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    updateMessageWithReceipt(message, receipt);
                    
                    // Si es un receipt de retry, intentar reprocesar
                    if (receipt.type === 'retry' && (message._lidDecryptError || message._decryptError)) {
                        setTimeout(() => {
                            retryFailedMessage(key, 0);
                        }, 1000);
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
                        
                        // Aprovechar para actualizar cache LID
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

        // Evento especial para manejar errores de PDO (mensajes sin respuesta)
        conn.ev.on('CB:call,offer', (node) => {
            // Ignorar llamadas para evitar interferencias con descifrado
        });

        // Evento para manejar reintentos de mensajes
        conn.ev.on('CB:ack', async (node) => {
            const { attrs } = node;
            if (attrs?.class === 'receipt' && attrs?.type === 'retry') {
                const messageId = attrs.id;
                if (failedMessages.has(messageId)) {
                    console.log(`🔄 Recibido retry request para mensaje ${messageId}`);
                    // El sistema ya maneja el retry automáticamente
                }
            }
        });
    }

    // Actualizar cache LID desde metadata de grupo
    async function updateLidCacheFromMetadata(metadata, groupJid) {
        if (!metadata?.participants || !conn) return;
        
        for (const participant of metadata.participants) {
            try {
                const contactDetails = await conn.onWhatsApp(participant.jid);
                if (contactDetails?.[0]?.lid) {
                    const lidKey = contactDetails[0].lid.split('@')[0];
                    
                    if (!lidCache.has(lidKey)) {
                        const entry = {
                            jid: participant.jid,
                            lid: contactDetails[0].lid,
                            name: contactDetails[0].name || participant.jid.split('@')[0],
                            timestamp: Date.now(),
                            groupJid: groupJid
                        };
                        
                        lidCache.set(lidKey, entry);
                        jidToLidMap.set(participant.jid, contactDetails[0].lid);
                        isDirty = true;
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }

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

    // Función para obtener estadísticas de errores
    function getErrorStats() {
        return {
            retryQueue: retryQueue.size,
            failedMessages: failedMessages.size,
            activeRetries: Array.from(retryQueue.entries()),
            recentFailures: Array.from(failedMessages.entries()).slice(-10)
        };
    }

    // Función para limpiar mensajes fallidos antiguos
    function cleanupFailedMessages() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        let cleaned = 0;
        
        for (const [messageId, data] of failedMessages.entries()) {
            if (data.timestamp < oneHourAgo) {
                failedMessages.delete(messageId);
                retryQueue.delete(messageId);
                cleaned++;
            }
        }
        
        return cleaned;
    }

    // Limpiar mensajes fallidos cada hora
    setInterval(cleanupFailedMessages, 60 * 60 * 1000);

    // Exponer funciones LID para uso externo
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
            return {
                total: lidCache.size,
                mappings: jidToLidMap.size,
                errors: getErrorStats()
            };
        },
        
        forceSave() {
            saveLidCache();
        },
        
        // Función para forzar retry de mensajes fallidos
        forceRetryFailed() {
            let retriedCount = 0;
            for (const [messageId, data] of failedMessages.entries()) {
                setTimeout(() => {
                    retryFailedMessage(data.key, 0);
                    retriedCount++;
                }, retriedCount * 500); // Escalonar retries
            }
            return retriedCount;
        },
        
        // Función para limpiar errores
        clearErrors() {
            const cleared = {
                retryQueue: retryQueue.size,
                failedMessages: failedMessages.size
            };
            retryQueue.clear();
            failedMessages.clear();
            return cleared;
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
        cleanupFailedMessages
    };
}

export default makeInMemoryStore();
