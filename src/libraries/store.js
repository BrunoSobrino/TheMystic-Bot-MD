/*
 * This code is adapted and modified from the original source provided by the user.
 * The code integrates functionalities from the Baileys WhatsApp Web API library, 
 * specifically the @whiskeysockets/baileys version, to handle events, manage chats, 
 * groups, contacts, and presence updates for WhatsApp clients. 
 * 
 * Credits:
 * Original code provided by @Skidy89 on GitHub (Baileys WhatsApp API).
 * See: https://github.com/Skidy89/baileys
 *
 * Fix:
 * chats.set, contacts.set does exist in newer versions of Baileys
 * see more https://github.com/Skidy89/baileys?tab=readme-ov-
 *
 * Contribution:
 * Ciphertext error fix and additional improvements by @BrunoSobrino
 * See: https://github.com/BrunoSobrino
 */
const { BufferJSON, proto, isJidBroadcast, WAMessageStubType, updateMessageWithReceipt, updateMessageWithReaction, jidNormalizedUser } = (await import('baileys')).default;

const TIME_TO_DATA_STALE = 5 * 60 * 1000;

function makeInMemoryStore() {
    let chats = {};
    let messages = {};
    let state = { connection: 'close' };

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

    async function fetchGroupMetadata(jid, groupMetadata) {
        jid = jid?.decodeJid?.();
        if (!isJidGroup(jid)) return;
        if (!(jid in chats)) return (chats[jid] = { id: jid });
        const isRequiredToUpdate = !chats[jid].metadata || Date.now() - (chats[jid].lastfetch || 0) > TIME_TO_DATA_STALE;
        if (isRequiredToUpdate) {
            const metadata = await groupMetadata?.(jid);
            if (metadata) Object.assign(chats[jid], { subject: metadata.subject, lastfetch: Date.now(), metadata });
        }
        return chats[jid].metadata;
    }

    function upsertMessage(jid, message, type = 'append') {
        jid = jid?.decodeJid?.();
        if (!(jid in messages)) messages[jid] = [];
        delete message.message?.messageContextInfo;
        delete message.message?.senderKeyDistributionMessage;
        const msg = loadMessage(jid, message.key.id);
        if (msg) Object.assign(msg, message);
        else type === 'append' ? messages[jid].push(message) : messages[jid].unshift(message);
    }

    function bind(conn) {
        if (!conn.chats) conn.chats = {};

        conn.ev.on('messages.upsert', ({ messages: newMessages, type }) => {
            if (['append', 'notify'].includes(type)) {
                for (const msg of newMessages) {
                    const jid = msg.key.remoteJid?.decodeJid?.();
                    if (!jid || isJidBroadcast(jid)) continue;
                    upsertMessage(jid, proto.WebMessageInfo.fromObject(msg), type);
                }
            }
        });

        conn.ev.on('messages.update', updates => {
            for (const { key, update } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) Object.assign(message, update);
            }
        });

        conn.ev.on('message-receipt.update', updates => {
            for (const { key, receipt } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) updateMessageWithReceipt(message, receipt);
            }
        });

        conn.ev.on('messages.reaction', updates => {
            for (const { key, reaction } of updates) {
                const jid = key.remoteJid?.decodeJid?.();
                const message = loadMessage(jid, key.id);
                if (message) updateMessageWithReaction(message, reaction);
            }
        });

        conn.ev.on('chats.set', ({ chats: newChats }) => {
            for (const chat of newChats) {
                const jid = chat.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], chat);
            }
        });

        conn.ev.on('contacts.set', ({ contacts: newContacts }) => {
            for (const contact of newContacts) {
                const jid = contact.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], contact);
            }
        });

        conn.ev.on('chats.upsert', newChats => {
            for (const chat of newChats) {
                const jid = chat.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], chat);
            }
        });

        conn.ev.on('chats.update', updates => {
            for (const update of updates) {
                const jid = update.id.decodeJid();
                if (!(jid in chats)) chats[jid] = { id: jid };
                Object.assign(chats[jid], update);
            }
        });

        conn.ev.on('presence.update', ({ id, presences: updates }) => {
            const jid = id.decodeJid();
            if (!(jid in chats)) chats[jid] = { id: jid };
            Object.assign(chats[jid], { presences: { ...chats[jid].presences, ...updates } });
        });

        conn.ev.on('message-reaction.update', updates => {
            for (const update of updates) {
                const message = loadMessage(update.key.remoteJid, update.key.id);
                if (message) {
                    message.reactions = message.reactions || [];
                    message.reactions.push(update.reaction);
                }
            }
        });
    }

    function toJSON() {
        return { chats, messages };
    }

    function fromJSON(json) {
        Object.assign(chats, json.chats);
        for (const jid in json.messages) {
            messages[jid] = json.messages[jid].map(m => m && proto.WebMessageInfo.fromObject(m));
        }
    }

    return { bind, loadMessage, toJSON, fromJSON, upsertMessage };
}

export default makeInMemoryStore();
