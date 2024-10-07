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

/* ---------------------------------------------------------- */

// Version Skid, backup
/*import {readFileSync, writeFileSync, existsSync} from 'fs';
const {initAuthCreds, BufferJSON, proto, jidNormalizedUser} = (await import('baileys')).default;
function bind(conn) {
  if (!conn.chats) conn.chats = {};
  function updateNameToDb(contacts) {
    if (!contacts) return;
    try {
      contacts = contacts.contacts || contacts;
      for (const contact of contacts) {
        const id = conn.decodeJid(contact.id);
        if (!id || id === 'status@broadcast') continue;
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = {...contact, id};
        conn.chats[id] = {
          ...chats,
          ...({
            ...contact, id, ...(id.endsWith('@g.us') ?
                            {subject: contact.subject || contact.name || chats.subject || ''} :
                            {name: contact.notify || contact.name || chats.name || chats.notify || ''}),
          } || {}),
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
  conn.ev.on('contacts.upsert', updateNameToDb);
  conn.ev.on('groups.update', updateNameToDb);
  conn.ev.on('contacts.update', updateNameToDb);
  conn.ev.on('chats.update', updateNameToDb);
  conn.ev.on('group-participants.update', async function updateParticipantsToDb({id, participants, action}) {
    // TODO: Handle group metadata and save them to cache
    if (!id) return;
    id = conn.decodeJid(id);
    if (id === 'status@broadcast') return;
    if (!(id in conn.chats)) conn.chats[id] = {id};
    const chats = conn.chats[id];
    chats.isChats = true;
    const groupMetadata = await conn.groupMetadata(id).catch((_) => null);
    if (!groupMetadata) return;
    chats.subject = groupMetadata.subject;
    chats.metadata = groupMetadata;
  });

  conn.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
    try {
      // TODO: Handle group metadata and save them to cache
      for (const update of groupsUpdates) {
        const id = conn.decodeJid(update.id);
        if (!id || id === 'status@broadcast') continue;
        const isGroup = id.endsWith('@g.us');
        if (!isGroup) continue;
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = {id};
        chats.isChats = true;
        const metadata = await conn.groupMetadata(id).catch((_) => null);
        if (metadata) chats.metadata = metadata;
        if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject;
      }
    } catch (e) {
      console.error(e);
    }
  });
}

const KEY_MAP = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory',
};
function useSingleFileAuthState(filename, logger) {
  let creds; let keys = {}; let saveCount = 0;
  const saveState = (forceSave) => {
    logger?.trace('saving auth state');
    saveCount++;
    if (forceSave || saveCount > 5) {
      writeFileSync(
          filename,
          JSON.stringify({creds, keys}, BufferJSON.replacer, 2),
      );
      saveCount = 0;
    }
  };
  if (existsSync(filename)) {
    const result = JSON.parse(
        readFileSync(filename, {encoding: 'utf-8'}),
        BufferJSON.reviver,
    );
    creds = result.creds;
    keys = result.keys;
  } else {
    creds = initAuthCreds();
    keys = {};
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce(
              (dict, id) => {
                let value = keys[key]?.[id];
                if (value) {
                  if (type === 'app-state-sync-key') {
                    value = proto.AppStateSyncKeyData.fromObject(value);
                  }
                  dict[id] = value;
                }
                return dict;
              }, {},
          );
        },
        set: (data) => {
          for (const _key in data) {
            const key = KEY_MAP[_key];
            keys[key] = keys[key] || {};
            Object.assign(keys[key], data[_key]);
          }
          saveState();
        },
      },
    },
    saveState,
  };
}
function loadMessage(jid, id = null) {
  let message = null;
  if (jid && !id) {
    id = jid;
    const filter = (m) => m.key?.id == id;
    const messages = {};
    const messageFind = Object.entries(messages)
        .find(([, msgs]) => {
          return msgs.find(filter);
        });
    message = messageFind?.[1]?.find(filter);
  } else {
    jid = jid?.decodeJid?.();
    const messages = {};
    if (!(jid in messages)) return null;
    message = messages[jid].find((m) => m.key.id == id);
  }
  return message ? message : null;
}
export default {
  bind,
  loadMessage,
};*/
