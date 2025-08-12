/*
 * Enhanced WhatsApp Store with specialized LID decryption handling
 * Soluciona errores específicos de mensajes desde WhatsApp Web/Desktop
 * Con logs de debug mejorados para identificar fallos de desencriptación
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
    
    // Estadísticas de errores mejoradas
    let errorStats = {
        lidDecryptionErrors: 0,
        webDesktopErrors: 0,
        sessionErrors: 0,
        ciphertextErrors: 0,
        successfulRetries: 0,
        totalRetries: 0,
        errorsByType: {}
    };
    
    // Función de log centralizada
    function debugLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '📱',
            'warn': '⚠️',
            'error': '❌',
            'success': '✅',
            'debug': '🔍',
            'retry': '🔄'
        }[level] || '📝';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        if (data) {
            console.log('   Data:', JSON.stringify(data, null, 2));
        }
    }
    
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
                debugLog('info', `Cache LID cargado: ${lidCache.size} entradas`);
            }
        } catch (error) {
            debugLog('error', 'Error cargando cache LID', { error: error.message });
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
            debugLog('error', 'Error guardando cache LID', { error: error.message });
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
        debugLog('debug', `Resolviendo LID: ${lidJid}`, { lidKey, groupChatId });
        
        // Verificar cache primero
        if (lidCache.has(lidKey)) {
            const cached = lidCache.get(lidKey);
            if (cached.jid && !cached.jid.endsWith('@lid')) {
                debugLog('success', `LID encontrado en cache: ${lidJid} -> ${cached.jid}`);
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
                                
                                debugLog('success', `LID resuelto desde metadata: ${lidJid} -> ${participant.jid}`);
                                return participant.jid;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            } catch (e) {
                debugLog('warn', `Error obteniendo metadata para resolver LID: ${e.message}`);
            }
        }
        
        debugLog('warn', `No se pudo resolver LID: ${lidJid}`);
        return lidJid; // Fallback
    }

    // Detectar si un mensaje es de WhatsApp Web/Desktop con logs
    function isWebDesktopMessage(messageNode) {
        if (!messageNode || !messageNode.attrs) return false;
        
        const attrs = messageNode.attrs;
        const isWebDesktop = (
            attrs.addressing_mode === 'lid' && 
            attrs.participant?.includes('@lid') &&
            attrs.participant_pn && 
            attrs.participant_pn.includes('@s.whatsapp.net')
        );
        
        if (isWebDesktop) {
            debugLog('info', 'Mensaje detectado como Web/Desktop', {
                messageId: attrs.id,
                addressingMode: attrs.addressing_mode,
                participant: attrs.participant,
                participantPn: attrs.participant_pn,
                notify: attrs.notify
            });
        }
        
        return isWebDesktop;
    }

    // Extraer JID real desde participant_pn con logs
    function extractRealJid(messageAttrs) {
        debugLog('debug', 'Extrayendo JID real', {
            participant: messageAttrs.participant,
            participantPn: messageAttrs.participant_pn,
            addressingMode: messageAttrs.addressing_mode
        });
        
        if (messageAttrs.participant_pn) {
            debugLog('success', `JID real extraído desde participant_pn: ${messageAttrs.participant_pn}`);
            return messageAttrs.participant_pn;
        }
        
        // Fallback: intentar extraer desde participant LID
        if (messageAttrs.participant?.endsWith('@lid')) {
            const lidPart = messageAttrs.participant.split('@')[0];
            // Intentar construir JID desde LID
            if (lidPart.includes(':')) {
                const numberPart = lidPart.split(':')[0];
                const constructedJid = `${numberPart}@s.whatsapp.net`;
                debugLog('warn', `JID construido desde LID: ${messageAttrs.participant} -> ${constructedJid}`);
                return constructedJid;
            }
        }
        
        debugLog('warn', `No se pudo extraer JID real, usando participant original: ${messageAttrs.participant}`);
        return messageAttrs.participant;
    }

    // Manejar errores de desencriptación con logs detallados
    function handleDecryptionError(error, messageKey, messageNode) {
        const errorType = error.name || error.type || 'Unknown';
        const errorMessage = error.message || 'Sin mensaje de error';
        
        debugLog('error', `Error de desencriptación detectado`, {
            errorType,
            errorMessage,
            messageId: messageKey.id,
            participant: messageKey.participant,
            remoteJid: messageKey.remoteJid,
            stack: error.stack?.split('\n')[0]
        });
        
        // Incrementar estadísticas por tipo de error
        if (!errorStats.errorsByType[errorType]) {
            errorStats.errorsByType[errorType] = 0;
        }
        errorStats.errorsByType[errorType]++;
        
        // Clasificar errores específicos
        if (errorMessage.includes('No matching sessions found')) {
            errorStats.sessionErrors++;
            debugLog('warn', 'Error específico: No matching sessions found - posible problema de sincronización de sesiones');
        } else if (errorMessage.includes('CIPHERTEXT')) {
            errorStats.ciphertextErrors++;
            debugLog('warn', 'Error específico: CIPHERTEXT - mensaje encriptado no pudo ser descifrado');
        } else if (errorType === 'SessionError') {
            errorStats.sessionErrors++;
            debugLog('warn', 'Error específico: SessionError - problema con la sesión de Signal Protocol');
        }
        
        return {
            errorType,
            errorMessage,
            canRetry: errorType === 'SessionError' || errorMessage.includes('No matching sessions found'),
            shouldRequestResend: true
        };
    }

    // Crear mensaje placeholder mejorado
    function createPlaceholderMessage(messageNode, isRetry = false, errorInfo = null) {
        if (!messageNode || !messageNode.attrs) return null;

        const attrs = messageNode.attrs;
        const messageId = attrs.id;
        const groupJid = attrs.from;
        const lidParticipant = attrs.participant;
        const realJid = extractRealJid(attrs);
        
        debugLog('info', `Creando mensaje placeholder${isRetry ? ' (retry)' : ''}`, {
            messageId,
            groupJid,
            lidParticipant,
            realJid,
            errorInfo
        });

        // Crear estructura de mensaje compatible
        const messageKey = {
            remoteJid: groupJid,
            fromMe: false,
            id: messageId,
            participant: realJid
        };

        let placeholderText = '🌐 Mensaje desde Web/Desktop';
        if (isRetry) {
            const retryCount = pendingDecryption.get(messageId)?.retryCount || 0;
            placeholderText = `🔄 Reintentando descifrar mensaje (${retryCount}/${MAX_RETRIES})`;
        }
        if (errorInfo) {
            placeholderText += ` - Error: ${errorInfo.errorType}`;
        }

        const placeholderMessage = {
            key: messageKey,
            messageTimestamp: parseInt(attrs.t || Date.now() / 1000),
            pushName: attrs.notify || 'Usuario Web',
            message: {
                conversation: placeholderText
            },
            messageStubType: proto.WebMessageInfo.StubType.CIPHERTEXT,
            status: proto.WebMessageInfo.Status.PENDING,
            _isWebDesktopPlaceholder: true,
            _originalNode: messageNode,
            _realJid: realJid,
            _retryCount: isRetry ? (pendingDecryption.get(messageId)?.retryCount || 0) + 1 : 0,
            _errorInfo: errorInfo
        };

        return placeholderMessage;
    }

    // Sistema de retry mejorado con logs
    async function retryMessageDecryption(messageId, originalNode, retryCount = 0) {
        if (retryCount >= MAX_RETRIES) {
            debugLog('error', `Mensaje falló después de ${MAX_RETRIES} intentos`, {
                messageId,
                totalRetries: retryCount
            });
            
            errorStats.lidDecryptionErrors++;
            
            // Crear mensaje de error final
            const errorMessage = createPlaceholderMessage(originalNode, true, {
                errorType: 'MaxRetriesExceeded',
                errorMessage: 'No se pudo descifrar después de múltiples intentos'
            });
            
            if (errorMessage) {
                errorMessage.message.conversation = '❌ Mensaje Web/Desktop no disponible';
                errorMessage.status = proto.WebMessageInfo.Status.ERROR;
                errorMessage._finalError = true;
            }
            
            pendingDecryption.delete(messageId);
            failedLidMessages.set(messageId, {
                timestamp: Date.now(),
                retries: retryCount,
                lastError: 'MaxRetriesExceeded'
            });
            
            return errorMessage;
        }

        errorStats.totalRetries++;
        debugLog('retry', `Intento ${retryCount + 1}/${MAX_RETRIES} para mensaje ${messageId}`);

        // Actualizar contador en pendingDecryption
        const pending = pendingDecryption.get(messageId) || {};
        pending.retryCount = retryCount + 1;
        pending.lastRetry = Date.now();
        pending.originalNode = originalNode;
        pendingDecryption.set(messageId, pending);

        // Programar siguiente retry
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        setTimeout(async () => {
            try {
                // Intentar obtener el mensaje real desde la conexión
                if (conn && conn.ws && conn.ws.readyState === 1) {
                    
                    debugLog('debug', `Enviando retry request para mensaje ${messageId}`);
                    
                    // Solicitar reenvío específico para mensajes LID
                    try {
                        const groupJid = originalNode.attrs.from;
                        const participantJid = extractRealJid(originalNode.attrs);
                        
                        if (groupJid && participantJid) {
                            await conn.sendRetryRequest(groupJid, messageId, participantJid);
                            debugLog('success', `Retry request enviado exitosamente`, {
                                messageId,
                                groupJid,
                                participantJid
                            });
                        }
                    } catch (retryError) {
                        debugLog('error', `Error enviando retry request`, {
                            messageId,
                            error: retryError.message
                        });
                    }
                    
                    // Programar siguiente intento
                    setTimeout(() => {
                        retryMessageDecryption(messageId, originalNode, retryCount + 1);
                    }, delay);
                } else {
                    debugLog('warn', 'Conexión no disponible para retry', {
                        messageId,
                        wsReadyState: conn?.ws?.readyState
                    });
                }
            } catch (error) {
                debugLog('error', `Error en retry para mensaje ${messageId}`, {
                    error: error.message,
                    retryCount
                });
                retryMessageDecryption(messageId, originalNode, retryCount + 1);
            }
        }, delay);

        // Retornar mensaje de retry actualizado
        return createPlaceholderMessage(originalNode, true);
    }
    
    // Procesar mensaje para resolver LIDs (función original mejorada)
    async function processMessageLids(message) {
        if (!message || !message.key) return message;
        
        const groupChatId = message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null;
        if (!groupChatId) return message;
        
        debugLog('debug', 'Procesando LIDs en mensaje', {
            messageId: message.key.id,
            groupChatId,
            participant: message.key.participant
        });
        
        const processedMessage = { ...message };
        
        // Resolver participant
        if (processedMessage.key?.participant?.endsWith('@lid')) {
            const resolved = await resolveLidFromCache(processedMessage.key.participant, groupChatId);
            if (resolved !== processedMessage.key.participant) {
                processedMessage.key.participant = resolved;
                debugLog('success', `Participant LID resuelto: ${message.key.participant} -> ${resolved}`);
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
                debugLog('warn', `Error obteniendo metadata de grupo: ${error.message}`);
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
        
        const existingMsg = loadMessage(jid, message.key.id);
        if (existingMsg) {
            // Si el mensaje existente es un placeholder y el nuevo es válido, reemplazar
            if ((existingMsg._isWebDesktopPlaceholder || existingMsg._errorInfo) && 
                !message._isWebDesktopPlaceholder && 
                message.message && 
                !message._finalError) {
                
                debugLog('success', `Reemplazando placeholder con mensaje real`, {
                    messageId: message.key.id,
                    wasPlaceholder: !!existingMsg._isWebDesktopPlaceholder,
                    hasContent: !!message.message
                });
                
                Object.assign(existingMsg, message);
                
                // Limpiar flags de placeholder/error
                delete existingMsg._isWebDesktopPlaceholder;
                delete existingMsg._errorInfo;
                delete existingMsg._retryCount;
                delete existingMsg._originalNode;
                
                // Remover de colas de retry
                pendingDecryption.delete(message.key.id);
                errorStats.successfulRetries++;
            } else {
                Object.assign(existingMsg, message);
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

        debugLog('info', 'Store vinculado a conexión');

        // INTERCEPTAR ERRORES DE MANEJO DE MENSAJES DIRECTAMENTE
        const originalEmitError = conn.ev.emit.bind(conn.ev);
        conn.ev.emit = function(event, ...args) {
            if (event === 'connection.update' && args[0]?.lastDisconnect?.error?.message?.includes('error in handling message')) {
                debugLog('warn', 'Error de manejo de mensaje interceptado', {
                    error: args[0].lastDisconnect.error.message
                });
                return;
            }
            return originalEmitError(event, ...args);
        };

        // HOOK PRINCIPAL: Interceptar procesamiento de mensajes con logs detallados
        if (conn.ws && typeof conn.ws.on === 'function') {
            const originalOn = conn.ws.on.bind(conn.ws);
            conn.ws.on = function(event, handler) {
                if (event === 'message') {
                    const wrappedHandler = async function(data) {
                        try {
                            return await handler(data);
                        } catch (error) {
                            debugLog('error', 'Error en handler de mensaje WebSocket', {
                                messageId: data?.attrs?.id,
                                addressingMode: data?.attrs?.addressing_mode,
                                participant: data?.attrs?.participant,
                                errorMessage: error.message,
                                errorType: error.name || error.type
                            });
                            
                            // Manejar errores específicos de mensajes Web/Desktop
                            if (error.message?.includes('error in handling message') && 
                                data?.attrs?.addressing_mode === 'lid') {
                                
                                debugLog('warn', 'Mensaje Web/Desktop con error de manejo detectado', {
                                    messageId: data.attrs.id,
                                    participant: data.attrs.participant,
                                    participantPn: data.attrs.participant_pn
                                });
                                
                                errorStats.webDesktopErrors++;
                                
                                const errorInfo = handleDecryptionError(error, {
                                    id: data.attrs.id,
                                    participant: data.attrs.participant,
                                    remoteJid: data.attrs.from
                                }, data);
                                
                                // Crear y almacenar placeholder
                                const placeholder = createPlaceholderMessage(data, false, errorInfo);
                                if (placeholder) {
                                    const jid = data.attrs.from;
                                    upsertMessage(jid, proto.WebMessageInfo.fromObject(placeholder), 'append');
                                    
                                    // Iniciar proceso de retry si es apropiado
                                    if (errorInfo.canRetry) {
                                        setTimeout(() => {
                                            retryMessageDecryption(data.attrs.id, data, 0);
                                        }, 1000);
                                    }
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

        // Interceptar errores de desencriptación directamente
        if (conn.decryptMessage) {
            const originalDecryptMessage = conn.decryptMessage.bind(conn);
            conn.decryptMessage = async function(node) {
                try {
                    return await originalDecryptMessage(node);
                } catch (error) {
                    debugLog('error', 'Error en decryptMessage', {
                        messageId: node?.attrs?.id,
                        participant: node?.attrs?.participant,
                        errorType: error.name || error.type,
                        errorMessage: error.message
                    });
                    
                    // Manejar el error pero permitir el procesamiento posterior
                    const errorInfo = handleDecryptionError(error, {
                        id: node?.attrs?.id,
                        participant: node?.attrs?.participant,
                        remoteJid: node?.attrs?.from
                    }, node);
                    
                    // Si es un mensaje web/desktop, crear placeholder
                    if (isWebDesktopMessage(node)) {
                        const placeholder = createPlaceholderMessage(node, false, errorInfo);
                        if (placeholder && errorInfo.canRetry) {
                            setTimeout(() => {
                                retryMessageDecryption(node.attrs.id, node, 0);
                            }, 1000);
                        }
                        return placeholder;
                    }
                    
                    throw error;
                }
            };
        }

        conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                debugLog('debug', `Procesando ${newMessages.length} mensajes nuevos (${type})`);
                
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    
                    try {
                        // Verificar si es un mensaje exitosamente descifrado después de retry
                        if (pendingDecryption.has(msg.key.id)) {
                            debugLog('success', `Mensaje descifrado exitosamente después de retry`, {
                                messageId: msg.key.id
                            });
                            pendingDecryption.delete(msg.key.id);
                            errorStats.successfulRetries++;
                        }
                        
                        // Procesar LIDs normalmente
                        const processedMsg = await processMessageLids(msg);
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(processedMsg), type);
                        
                    } catch (error) {
                        debugLog('error', `Error en upsert de mensaje`, {
                            messageId: msg.key.id,
                            error: error.message
                        });
                        // Usar mensaje original como fallback
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
                    }
                }
            }
        });

        conn.ev.on('messages.update', async updates => {
            debugLog('debug', `Actualizando ${updates.length} mensajes`);
            
            for (const { key, update } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    try {
                        // Si es una actualización de un mensaje placeholder pendiente
                        if ((message._isWebDesktopPlaceholder || pendingDecryption.has(key.id)) && update.message) {
                            debugLog('success', `Actualización de placeholder recibida`, {
                                messageId: key.id,
                                hasMessage: !!update.message
                            });
                            
                            const processedUpdate = await processMessageLids({ key, ...update });
                            Object.assign(message, processedUpdate);
                            
                            // Limpiar flags y colas
                            delete message._isWebDesktopPlaceholder;
                            delete message._retryCount;
                            delete message._originalNode;
                            delete message._errorInfo;
                            pendingDecryption.delete(key.id);
                            errorStats.successfulRetries++;
                        } else {
                            const processedUpdate = await processMessageLids({ key, ...update });
                            Object.assign(message, processedUpdate);
                        }
                    } catch (error) {
                        debugLog('error', `Error actualizando mensaje`, {
                            messageId: key.id,
                            error: error.message
                        });
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
                    
                    // Log receipts de retry para debugging
                    if (receipt.type === 'retry') {
                        debugLog('debug', `Retry receipt recibido`, {
                            messageId: key.id,
                            isPending: pendingDecryption.has(key.id)
                        });
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

        // Resto de eventos sin cambios pero con logs básicos...
        conn.ev.on('chats.set', ({ chats: newChats }) => {
            debugLog('debug', `Configurando ${newChats.length} chats`);
            for (const chat of newChats) {
                const jid = chat.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], chat);
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('contacts.set', ({ contacts: newContacts }) => {
            debugLog('debug', `Configurando ${newContacts.length} contactos`);
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
                    debugLog('warn', `Error actualizando metadata de grupo: ${error.message}`);
                }
                
                conn.chats[jid] = chats[jid];
            }
        });

        conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
            if (!id) return;
            const jid = id.decodeJid();
            if (!isJidGroup(jid)) return;
            
            debugLog('debug', `Actualización de participantes en grupo`, {
                groupJid: jid,
                action,
                participants: participants.length
            });
            
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
                debugLog('warn', `Error obteniendo metadata tras actualización de participantes: ${error.message}`);
            }
            
            conn.chats[jid] = chats[jid];
        });
    }

    // Actualizar cache LID desde metadata de grupo
    async function updateLidCacheFromMetadata(metadata, groupJid) {
        if (!metadata?.participants || !conn) return;
        
        debugLog('debug', `Actualizando cache LID desde metadata de grupo`, {
            groupJid,
            participantsCount: metadata.participants.length
        });
        
        let updated = 0;
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
                    updated++;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (updated > 0) {
            debugLog('success', `Cache LID actualizado con ${updated} nuevas entradas desde metadata`);
        }
    }

    // Función para obtener estadísticas completas
    function getErrorStats() {
        return {
            ...errorStats,
            pendingDecryption: pendingDecryption.size,
            cacheSize: lidCache.size,
            jidMappings: jidToLidMap.size,
            failedMessages: failedLidMessages.size,
            pendingMessages: Array.from(pendingDecryption.entries()).map(([id, data]) => ({
                id,
                retryCount: data.retryCount,
                lastRetry: data.lastRetry
            })),
            failedMessagesList: Array.from(failedLidMessages.entries()).map(([id, data]) => ({
                id,
                timestamp: data.timestamp,
                retries: data.retries,
                lastError: data.lastError
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
        
        // También limpiar mensajes fallidos muy antiguos (más de 24 horas)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        for (const [messageId, data] of failedLidMessages.entries()) {
            if (data.timestamp < oneDayAgo) {
                failedLidMessages.delete(messageId);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            debugLog('info', `Limpieza automática: ${cleaned} mensajes antiguos eliminados`);
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
        debugLog('info', 'Cargando datos desde JSON');
        Object.assign(chats, json.chats || {});
        Object.assign(contacts, json.contacts || {});
        
        let messagesLoaded = 0;
        for (const jid in json.messages || {}) {
            messages[jid] = (json.messages[jid] || []).map(m => 
                m && proto.WebMessageInfo.fromObject(m)
            ).filter(Boolean);
            messagesLoaded += messages[jid].length;
        }
        
        debugLog('success', `Datos cargados: ${Object.keys(chats).length} chats, ${messagesLoaded} mensajes, ${Object.keys(contacts).length} contactos`);
    }

    const lidResolver = {
        async resolve(lidJid, groupChatId) {
            return await resolveLidFromCache(lidJid, groupChatId);
        },
        
        add(lidKey, jid, name = null) {
            if (lidCache.has(lidKey)) return false;
            
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
            
            debugLog('success', `LID agregado manualmente: ${lidKey} -> ${jid}`);
            return true;
        },
        
        get cache() {
            return lidCache;
        },
        
        getStats() {
            return getErrorStats();
        },
        
        forceSave() {
            saveLidCache();
            debugLog('info', 'Cache LID guardado manualmente');
        },
        
        // Función para forzar retry de mensajes pendientes
        forceRetryPending() {
            let retriedCount = 0;
            debugLog('info', `Forzando retry de ${pendingDecryption.size} mensajes pendientes`);
            
            for (const [messageId, data] of pendingDecryption.entries()) {
                if (data.originalNode) {
                    setTimeout(() => {
                        retryMessageDecryption(messageId, data.originalNode, 0);
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
                failedMessages: failedLidMessages.size,
                errorStats: { ...errorStats }
            };
            
            pendingDecryption.clear();
            failedLidMessages.clear();
            errorStats = {
                lidDecryptionErrors: 0,
                webDesktopErrors: 0,
                sessionErrors: 0,
                ciphertextErrors: 0,
                successfulRetries: 0,
                totalRetries: 0,
                errorsByType: {}
            };
            
            debugLog('info', 'Errores y mensajes pendientes limpiados', cleared);
            return cleared;
        },
        
        // Función para mostrar estado actual
        getStatus() {
            const status = {
                lidCache: lidCache.size,
                jidMappings: jidToLidMap.size,
                pendingDecryption: pendingDecryption.size,
                failedMessages: failedLidMessages.size,
                errorStats,
                isDirty,
                cacheFile: cacheFile
            };
            
            debugLog('info', 'Estado actual del store', status);
            return status;
        },

        // Nueva función para diagnosticar problemas específicos
        diagnose() {
            debugLog('info', '=== DIAGNÓSTICO DEL STORE ===');
            debugLog('info', `Cache LID: ${lidCache.size} entradas`);
            debugLog('info', `JID Mappings: ${jidToLidMap.size} mappings`);
            debugLog('info', `Mensajes pendientes: ${pendingDecryption.size}`);
            debugLog('info', `Mensajes fallidos: ${failedLidMessages.size}`);
            debugLog('info', 'Errores por tipo:', errorStats.errorsByType);
            debugLog('info', `Total de retries: ${errorStats.totalRetries}`);
            debugLog('info', `Retries exitosos: ${errorStats.successfulRetries}`);
            debugLog('info', `Errores de sesión: ${errorStats.sessionErrors}`);
            debugLog('info', `Errores de Web/Desktop: ${errorStats.webDesktopErrors}`);
            
            if (pendingDecryption.size > 0) {
                debugLog('warn', 'Mensajes pendientes de desencriptación:');
                for (const [id, data] of pendingDecryption.entries()) {
                    debugLog('warn', `  - ${id}: ${data.retryCount} reintentos, último: ${new Date(data.lastRetry)}`);
                }
            }
            
            return getErrorStats();
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
        cleanupPendingMessages
    };
}

export default makeInMemoryStore();
