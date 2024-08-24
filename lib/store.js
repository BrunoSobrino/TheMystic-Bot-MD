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
 */


import {readFileSync, writeFileSync, existsSync} from 'fs';

/**
 * Importing necessary functions and objects from Baileys library
 * @type {import("baileys")}
 */
const {initAuthCreds, BufferJSON, proto, jidNormalizedUser} = (await import('@whiskeysockets/baileys')).default;

/**
 * This function binds event listeners to the WhatsApp socket connection (`conn`)
 * for handling events such as chats, groups, participants, contacts, and presence updates.
 *
 * @param {import("baileys").WASocket | import("baileys").WALegacySocket} conn
 */
function bind(conn) {
  // Ensure that conn.chats exists
  if (!conn.chats) conn.chats = {};

  /**
   * Updates the contacts and stores them in `conn.chats`.
   * 
   * @param {import("baileys").Contact[]|{contacts:import("baileys").Contact[]}} contacts
   */
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

/**
 * Use a single file to persist authentication state (credentials and keys).
 *
 * @param {String} filename - The file where the authentication state will be saved.
 * @param {import('pino').Logger} logger - Optional logger to track state saving.
 * @returns {Object} Authentication state and state saving methods.
 */
function useSingleFileAuthState(filename, logger) {
  let creds; let keys = {}; let saveCount = 0;
  // Save the authentication state to a file
  const saveState = (forceSave) => {
    logger?.trace('saving auth state');
    saveCount++;
    if (forceSave || saveCount > 5) {
      writeFileSync(
          filename,
          // BufferJSON replacer utility saves buffers nicely
          JSON.stringify({creds, keys}, BufferJSON.replacer, 2),
      );
      saveCount = 0;
    }
  };

  // Load authentication state from the file if it exists
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

/**
 * Load a message by its ID and optionally by JID (if both are provided).
 *
 * @param {string} jid - The JID of the chat.
 * @param {string} id - The ID of the message.
 * @returns {Object|null} The found message or null if not found.
 */
function loadMessage(jid, id = null) {
  let message = null;
  if (jid && !id) {
    id = jid;
    /** @type {(m: import('@whiskeysockets/baileys').proto.WebMessageInfo) => Boolean} */
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
  useSingleFileAuthState,
  loadMessage,
};