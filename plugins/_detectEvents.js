// Creditos del codigo a @Gatito-kw //
/* GitHub: https://github.com/Gatito-kw */
/* Bot: https://github.com/Gatito-kw/nekobot-md */

import { WAMessageStubType } from "baileys";
import fetch from 'node-fetch';
import fs from 'fs';

const groupMetadataCache = new Map();

export async function before(m, { conn, participants }) {
  if (!m?.messageStubType || !m?.isGroup || m?.messageStubType == 2) return;
  
  const safeOperation = async (operation, fallback = null) => {
    try {
      return await operation();
    } catch (error) {
      console.error('[DETECT-EVENTS] Error en operación:', error);
      return fallback;
    }
  };

  try {
    if (m.messageStubType === 'GROUP_PARTICIPANT_REMOVE') {
      m.messageStubType = 28;
    } else if (m.messageStubType === 'GROUP_PARTICIPANT_LEAVE') {
      m.messageStubType = 32;
    }

    // Solo importan los eventos que este plugin anuncia; el resto (por
    // ejemplo GROUP_CREATE al meter al bot a un grupo) no hace nada.
    const HANDLED_STUBS = new Set([21, 26, 27, 28, 29, 30, 32]);
    if (!HANDLED_STUBS.has(m.messageStubType)) return true;
    if (!global?.db?.data?.chats[m.chat]?.detect2) return true;
    
    // Resolver el sender usando el sistema LID mejorado
    const realSender = await resolveLidFromCache(m?.sender, conn);
    
    const idioma = global.db?.data?.users[realSender]?.language || global.defaultLenguaje;
    let _translate;
    try {
        _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/_detectEvents.js.json`));
    } catch {
        // El archivo por idioma no existe en todos los idiomas: usar el de español.
        _translate = JSON.parse(fs.readFileSync(`./src/languages/es/_detectEvents.js.json`));
    }
    const tradutor = _translate._detectevents;

    let groupName = "el grupo";
    let groupMetadata = groupMetadataCache.get(m.chat);
    let pp = 'https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/avatar_contact.png';
    let img = null;

    if (!groupMetadata) {
      groupMetadata = await safeOperation(() => conn.groupMetadata(m.chat));
      if (groupMetadata) {
        groupMetadataCache.set(m.chat, groupMetadata);
        groupName = groupMetadata.subject || "el grupo";
        pp = await safeOperation(() => conn.profilePictureUrl(m.chat, 'image').catch(() => pp), pp);
        img = await safeOperation(() => fetch(pp).then(async (res) => Buffer.from(await res.arrayBuffer())));
      }
    } else {
      groupName = groupMetadata.subject || "el grupo";
      pp = await safeOperation(() => conn.profilePictureUrl(m.chat, 'image').catch(() => pp), pp);
      img = await safeOperation(() => fetch(pp).then(async (res) => Buffer.from(await res.arrayBuffer())));
    }

    const chat = global?.db?.data?.chats[m.chat];
    const groupAdmins = participants.filter((p) => p.admin);
    
    // Resolver todos los parámetros del stub usando el sistema LID
    const resolvedStubParameters = await Promise.all(
      (m.messageStubParameters || []).map(async (param) => {
        return await resolveLidFromCache(param, conn);
      })
    );
    
    const mentionsString = [realSender, ...resolvedStubParameters, ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [realSender, ...resolvedStubParameters];
    const fkontak2 = {'key': {'participants': '0@s.whatsapp.net','remoteJid': 'status@broadcast','fromMe': false,'id': 'Halo'},'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${realSender.split('@')[0]}:${realSender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}},'participant': '0@s.whatsapp.net'};

    if (chat?.detect2) {
      switch (m.messageStubType) {
        case 29:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.promote.header}\n\n${tradutor.promote.group.replace('@group', groupName)}\n${tradutor.promote.new_admin.replace('@user', userDisplay)}\n${tradutor.promote.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 30:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.demote.header}\n\n${tradutor.demote.group.replace('@group', groupName)}\n${tradutor.demote.removed_admin.replace('@user', userDisplay)}\n${tradutor.demote.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 27:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.member_add.header}\n\n${tradutor.member_add.group.replace('@group', groupName)}\n`;
            if (!realSender.endsWith('@g.us')) {
              txt += `${tradutor.member_add.added_user.replace('@user', userDisplay)}\n${tradutor.member_add.added_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            } else {
              txt += `${tradutor.member_add.self_added.replace('@user', userDisplay)}`;
            }
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 28:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.member_remove.header}\n\n${tradutor.member_remove.group.replace('@group', groupName)}\n`;
            const isSelfRemoval = resolvedStubParameters[0] === realSender;
            if (!realSender.endsWith('@g.us')) {
              if (isSelfRemoval) {
                txt += `${tradutor.member_remove.self_removed.replace('@user', userDisplay)}`;
              } else {
                txt += `${tradutor.member_remove.removed_user.replace('@user', userDisplay)}\n${tradutor.member_remove.removed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
              }
            } else {
              txt += `${tradutor.member_remove.self_removed.replace('@user', userDisplay)}`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 32:
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.member_remove.header}\n\n${tradutor.member_remove.group.replace('@group', groupName)}\n`;
            txt += `${tradutor.member_remove.self_removed.replace('@user', userDisplay)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: [resolvedStubParameters[0]] }, { quoted: fkontak2 });
          });
          break;

        case 26:
          await safeOperation(async () => {
            const accion = resolvedStubParameters[0]?.split('@')[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `${tradutor.group_settings.header}\n\n${tradutor.group_settings.group.replace('@group', groupName)}\n${tradutor.group_settings.action.replace('@action', '```' + accion + '```')}\n${tradutor.group_settings.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 21:
          await safeOperation(async () => {
            let txt = `${tradutor.group_name.header}\n\n${tradutor.group_name.new_name.replace('@name', '```' + groupName + '```')}\n${tradutor.group_name.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;
      }
    }
    return true;
  } catch (error) {
    console.error('Error en _detectEvents:', error);
    return true;
  }
}

// ===============================
// RESOLUCIÓN LID CON EL MECANISMO REAL DE BAILEYS 7 (conn.resolveUser)
// ===============================
async function resolveLidFromCache(jid, conn) {
  if (!jid) return jid;
  // Baileys 7: en grupos con LID el parámetro del stub puede venir
  // como JSON ('{"id":"...@lid","phoneNumber":"...@s.whatsapp.net"}')
  // o como objeto: sacar primero el número real.
  if (typeof jid === 'string' && jid.trim().startsWith('{')) {
    try {
      const obj = JSON.parse(jid);
      jid = obj?.phoneNumber || obj?.id || jid;
    } catch {}
  }
  if (typeof jid === 'object') {
    jid = jid?.phoneNumber || jid?.id || '';
    if (!jid) return jid;
  }
  if (!jid.toString().endsWith('@lid')) {
    return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
  }

  try {
    // resolveUser usa el lidMapping interno de Baileys (signalRepository) y
    // devuelve { jid, lid }: el número real cuando el mapeo ya se conoce.
    const resolved = conn?.resolveUser?.(jid) || {};
    if (resolved.jid && !resolved.jid.endsWith('@lid')) {
      return resolved.jid;
    }
  } catch (error) {
    console.error('[DETECT-EVENTS] Error resolviendo LID:', error);
  }

  // Sin mapeo conocido se devuelve el LID tal cual (no se inventa un número).
  return jid;
}

// ===============================
// NOMBRE A MOSTRAR PARA MENCIONES
// ===============================
function getUserDisplayName(jid) {
  if (!jid) {
    return '@undefined';
  }
  return `@${String(jid).split('@')[0]}`;
}
