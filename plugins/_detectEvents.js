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
    
    // Resolver el sender usando el sistema LID mejorado
    const realSender = await resolveLidFromCache(m?.sender, m?.chat);
    
    const idioma = global.db?.data?.users[realSender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/_detectEvents.js.json`));
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
        img = await safeOperation(() => fetch(pp).then(res => res.buffer()));
      }
    } else {
      groupName = groupMetadata.subject || "el grupo";
      pp = await safeOperation(() => conn.profilePictureUrl(m.chat, 'image').catch(() => pp), pp);
      img = await safeOperation(() => fetch(pp).then(res => res.buffer()));
    }

    const chat = global?.db?.data?.chats[m.chat];
    const groupAdmins = participants.filter((p) => p.admin);
    
    // Resolver todos los parámetros del stub usando el sistema LID
    const resolvedStubParameters = await Promise.all(
      (m.messageStubParameters || []).map(async (param) => {
        return await resolveLidFromCache(param, m.chat);
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
// FUNCIÓN DE RESOLUCIÓN LID ADAPTADA A NUEVA ESTRUCTURA
// ===============================
async function resolveLidFromCache(jid, groupChatId) {
  if (!jid || !jid.toString().endsWith('@lid')) {
    return jid?.includes('@') ? jid : `${jid}@s.whatsapp.net`;
  }
  if (!global.lidResolver) {
    console.warn('[DETECT-EVENTS] LidResolver no disponible, devolviendo JID original');
    return jid;
  }
  try {
    if (global.lidResolver.resolveLid) {
      const resolved = await global.lidResolver.resolveLid(jid, groupChatId);
      if (resolved && resolved !== jid) {
        return resolved;
      }
    }
    const lidKey = jid.split('@')[0];
    const userInfo = global.lidResolver.getUserInfo(lidKey);
    if (userInfo && userInfo.jid && !userInfo.jid.endsWith('@lid')) {
      return userInfo.jid;
    }
    const cachedUsers = global.lidResolver.getAllUsers();
    for (const user of cachedUsers) {
      if (user.lid === jid && user.jid && !user.jid.endsWith('@lid')) {
        return user.jid;
      }
    }
    if (global.lidResolver.lidCache) {
      const directResolved = global.lidResolver.lidCache.get(lidKey);
      if (directResolved && !directResolved.endsWith('@lid')) {
        return directResolved;
      }
      const legacyCacheKey = `${jid}_${groupChatId}`;
      const legacyResolved = global.lidResolver.lidCache.get(legacyCacheKey);
      if (legacyResolved && !legacyResolved.endsWith('@lid')) {
        return legacyResolved;
      }
      for (const [key, value] of global.lidResolver.lidCache.entries()) {
        if (key === lidKey && value && !value.endsWith('@lid')) {
          return value;
        }
        if (key === jid && value && !value.endsWith('@lid')) {
          return value;
        }
      }
    }
    console.warn(`[DETECT-EVENTS] No se pudo resolver LID: ${jid}`);
    return jid;
  } catch (error) {
    console.error('[DETECT-EVENTS] Error resolviendo LID:', error);
    return jid;
  }
}

// ===============================
// FUNCIÓN PARA MOSTRAR NOMBRES DE USUARIO MEJORADA
// ===============================
function getUserDisplayName(jid) {
  if (!jid) {
    return '@undefined';
  }
  if (jid.includes('@') && !jid.includes('@lid')) {
    return `@${jid.split('@')[0]}`;
  }
  if (jid.includes('@lid')) {
    try {
      const lidKey = jid.split('@')[0];
      if (global.lidResolver) {
        const userInfo = global.lidResolver.getUserInfo(lidKey);
        if (userInfo) {
          if (userInfo.name && userInfo.name !== 'Nombre pendiente' && userInfo.name !== 'Usuario no encontrado') {
            return userInfo.name;
          }
          if (userInfo.jid && !userInfo.jid.endsWith('@lid')) {
            return `@${userInfo.jid.split('@')[0]}`;
          }
        }
      }
      return `@${lidKey}`;
    } catch (error) {
      console.error('[DETECT-EVENTS] Error obteniendo nombre de usuario:', error);
      return 'Usuario no identificado';
    }
  }
  return `@${jid}`;
}

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    return resolveLidFromCache(lid, groupChatId);
}
