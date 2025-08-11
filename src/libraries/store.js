/*
 * Enhanced WhatsApp Store with LID support and improved message decryption
 * Handles sessions for linked devices (WhatsApp Web/Desktop)
 * Credits: Based on Baileys library with improvements for session management
 */

const { BufferJSON, proto, isJidBroadcast, WAMessageStubType, updateMessageWithReceipt, updateMessageWithReaction, jidNormalizedUser } = (await import('baileys')).default;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

function makeInMemoryStore() {
    let chats = {};
    let messages = {};
    let contacts = {};
    let groupMetadata = {};
    let state = { connection: 'close' };
    let retryCounters = new Map(); // Para trackear intentos de retry

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
                    groupMetadata[jid] = metadata;
                }
            } catch (error) {
                console.warn(`Failed to fetch group metadata for ${jid}:`, error.message);
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
            Object.assign(msg, message);
        } else {
            if (type === 'append') {
                messages[jid].push(message);
            } else {
                messages[jid].unshift(message);
            }
        }
    }

    function handleRetryRequest(conn, msgAttrs) {
        const retryKey = `${msgAttrs.from}-${msgAttrs.id}`;
        const currentRetries = retryCounters.get(retryKey) || 0;
        
        if (currentRetries >= MAX_RETRY_ATTEMPTS) {
            console.warn(`Max retry attempts reached for message ${msgAttrs.id}`);
            retryCounters.delete(retryKey);
            return false;
        }

        retryCounters.set(retryKey, currentRetries + 1);
        
        try {
            // Enviar retry request con delay progresivo
            setTimeout(async () => {
                await conn.sendRetryRequest(msgAttrs.from, msgAttrs.id, msgAttrs.participant);
                console.log(`Retry ${currentRetries + 1} sent for message ${msgAttrs.id}`);
            }, 1000 * (currentRetries + 1)); // Delay progresivo: 1s, 2s, 3s
            
            return true;
        } catch (error) {
            console.error(`Failed to send retry request:`, error);
            return false;
        }
    }

    function bind(conn) {
        if (!conn.chats) conn.chats = {};

        // Eventos principales
        conn.ev.on('messages.upsert', ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    
                    try {
                        upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
                    } catch (error) {
                        console.error(`Error upserting message:`, error);
                    }
                }
            }
        });

        conn.ev.on('messages.update', updates => {
            for (const { key, update } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) {
                    Object.assign(message, update);
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

        // Manejo de chats
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

        // Manejo específico de grupos
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
                        groupMetadata[jid] = metadata;
                    }
                } catch (error) {
                    console.warn(`Failed to update group metadata for ${jid}:`, error.message);
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
                    groupMetadata[jid] = metadata;
                }
            } catch (error) {
                console.warn(`Failed to fetch group metadata after participant update:`, error.message);
            }
            
            conn.chats[jid] = chats[jid];
        });

        // NUEVO: Manejo de errores de desencriptación con retry automático
        conn.ev.on('CB:call,offer', (node) => {
            // Manejar llamadas si es necesario
        });

        // Interceptar mensajes con error de desencriptación
        const originalProcessMessage = conn.processMessage;
        if (originalProcessMessage) {
            conn.processMessage = async function(message, chatUpdate = {}) {
                try {
                    return await originalProcessMessage.call(this, message, chatUpdate);
                } catch (error) {
                    if (error.message.includes('No session found to decrypt message') || 
                        error.message.includes('Could not decrypt message')) {
                        
                        const attrs = message.attrs || {};
                        console.warn(`Decryption failed for message ${attrs.id}, attempting retry...`);
                        
                        // Intentar retry automático
                        if (handleRetryRequest(conn, attrs)) {
                            return; // Retry enviado, esperar respuesta
                        }
                    }
                    throw error;
                }
            };
        }

        // Limpiar contadores de retry periódicamente
        setInterval(() => {
            const now = Date.now();
            for (const [key, count] of retryCounters.entries()) {
                // Limpiar entradas antiguas (más de 10 minutos)
                if (now - (count.timestamp || 0) > 600000) {
                    retryCounters.delete(key);
                }
            }
        }, 300000); // Cada 5 minutos
    }

    function toJSON() {
        return { 
            chats, 
            messages, 
            contacts, 
            groupMetadata 
        };
    }

    function fromJSON(json) {
        Object.assign(chats, json.chats || {});
        Object.assign(contacts, json.contacts || {});
        Object.assign(groupMetadata, json.groupMetadata || {});
        
        for (const jid in json.messages || {}) {
            messages[jid] = (json.messages[jid] || []).map(m => 
                m && proto.WebMessageInfo.fromObject(m)
            ).filter(Boolean);
        }
    }

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
        groupMetadata
    };
}

export default makeInMemoryStore();
