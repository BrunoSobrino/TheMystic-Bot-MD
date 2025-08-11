/*
 * Enhanced WhatsApp Store with integrated LID resolver and decryption handling
 * Handles everything from store.js including lidsresolve.json cache
 */

import fs from 'fs';
import path from 'path';
const { BufferJSON, proto, isJidBroadcast, WAMessageStubType, updateMessageWithReceipt, updateMessageWithReaction, jidNormalizedUser } = (await import('baileys')).default;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;

function makeInMemoryStore() {
    let chats = {};
    let messages = {};
    let contacts = {};
    let state = { connection: 'close' };
    
    // LID Cache integrado
    const cacheFile = path.join(process.cwd(), 'lidsresolve.json');
    let lidCache = new Map();
    let jidToLidMap = new Map();
    let isDirty = false;
    let conn = null; // Referencia a la conexión
    
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
                                    // Guardar en cache
                                    const entry = {
                                        jid: participant.jid,
                                        lid: lidJid,
                                        name: contactDetails[0].name || participant.jid.split('@')[0],
                                        timestamp: Date.now()
                                    };
                                    
                                    lidCache.set(lidKey, entry);
                                    jidToLidMap.set(participant.jid, lidJid);
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
        
        return lidJid; // Fallback
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
        
        delete message.message?.messageContextInfo;
        delete message.message?.senderKeyDistributionMessage;
        
        const msg = loadMessage(jid, message.key.id);
        if (msg) {
            Object.assign(msg, message);
        } else {
            if (type === 'append') {
                messages[jid].push(message);
            } else {
                messages[jid].unshift(message);
            }
        }
    }

    function bind(connection) {
        conn = connection; // Guardar referencia
        if (!conn.chats) conn.chats = {};
        
        // Cargar cache LID
        loadLidCache();

        conn.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    
                    try {
                        // Procesar LIDs antes de upsert
                        const processedMsg = await processMessageLids(msg);
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(processedMsg), type);
                    } catch (error) {
                        // Si falla el procesamiento LID, usar mensaje original
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
                    // Procesar LIDs en updates también
                    try {
                        const processedUpdate = await processMessageLids({ key, ...update });
                        Object.assign(message, processedUpdate);
                    } catch (error) {
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
                    
                    // Actualizar cache LID con nuevos participantes
                    await updateLidCacheFromMetadata(metadata, jid);
                }
            } catch (error) {
                // Silencioso
            }
            
            conn.chats[jid] = chats[jid];
        });

        // Interceptar procesamiento de mensajes para manejar errores de desencriptación
        const originalProcessMessage = conn.processMessage?.bind(conn);
        if (originalProcessMessage) {
            conn.processMessage = async function(message, chatUpdate = {}) {
                try {
                    return await originalProcessMessage(message, chatUpdate);
                } catch (error) {
                    if (error.message?.includes('No session found to decrypt message')) {
                        return handleDecryptionError(message, error);
                    }
                    throw error;
                }
            };
        }
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
                // Silencioso
            }
        }
    }

    // Manejar errores de desencriptación
    function handleDecryptionError(message, error) {
        const key = message.key || message.attrs;
        const participant = key?.participant;
        
        // Si es un LID, crear mensaje placeholder silencioso
        if (participant?.endsWith('@lid')) {
            const placeholderMessage = {
                key: {
                    remoteJid: key.from || key.remoteJid,
                    fromMe: false,
                    id: key.id,
                    participant: participant
                },
                messageTimestamp: parseInt(key.t || Date.now() / 1000),
                message: {
                    conversation: '🔐'
                },
                messageStubType: proto.WebMessageInfo.StubType.CIPHERTEXT,
                status: proto.WebMessageInfo.Status.SERVER_ACK,
                pushName: key.notify || 'Usuario',
                _lidDecryptError: true
            };
            
            return placeholderMessage;
        }
        
        throw error;
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

    // Exponer funciones LID para uso externo si se necesita
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
                mappings: jidToLidMap.size
            };
        },
        
        forceSave() {
            saveLidCache();
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
        lidResolver
    };
}

export default makeInMemoryStore();
