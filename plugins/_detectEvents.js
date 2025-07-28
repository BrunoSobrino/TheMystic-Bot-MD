// Creditos del codigo a @Gatito-kw //
/* GitHub: https://github.com/Gatito-kw */
/* Bot: https://github.com/Gatito-kw/nekobot-md */

import { WAMessageStubType } from "baileys";
import fetch from 'node-fetch';
import fs from 'fs';

const groupMetadataCache = new Map();

export async function before(m, { conn, participants }) {
  if (!m?.messageStubType || !m?.isGroup) return true;
  
  const safeOperation = async (operation, fallback = null) => {
    try {
      return await operation();
    } catch (error) {
      return fallback;
    }
  };

  try {     
   console.log('=== DEBUG _detectEvents ===');
   console.log('Original sender:', m?.sender);
   console.log('Chat ID:', m?.chat);
   console.log('MessageStubType:', m.messageStubType);
   console.log('MessageStubParameters:', m.messageStubParameters);
   
   const realSender = await resolveLidFromCache(m?.sender, m?.chat);
   console.log('Resolved sender:', realSender);
    
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
    
    const resolvedStubParameters = (m.messageStubParameters || []).map((param, index) => {
      console.log(`=== Resolving parameter ${index} ===`);
      console.log('Original param:', param);
      const resolved = resolveLidFromCache(param, m.chat);
      console.log('Resolved param:', resolved);
      console.log('========================');
      return resolved;
    });
    
    const mentionsString = [realSender, ...resolvedStubParameters, ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [realSender, ...resolvedStubParameters];
    const fkontak2 = {'key': {'participants': '0@s.whatsapp.net','remoteJid': 'status@broadcast','fromMe': false,'id': 'Halo'},'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${realSender.split('@')[0]}:${realSender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}},'participant': '0@s.whatsapp.net'};

    if (chat?.detect2) {
      switch (m.messageStubType) {
        case 29: // Promote
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.promote.header}\n\n${tradutor.promote.group.replace('@group', groupName)}\n${tradutor.promote.new_admin.replace('@user', userDisplay)}\n${tradutor.promote.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 30: // Demote
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            let txt = `${tradutor.demote.header}\n\n${tradutor.demote.group.replace('@group', groupName)}\n${tradutor.demote.removed_admin.replace('@user', userDisplay)}\n${tradutor.demote.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 27: // Member add
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

        case 28: // Member remove
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

        case 32: // Member leave or remove
          await safeOperation(async () => {
            const userDisplay = getUserDisplayName(resolvedStubParameters[0]);
            const isSelfRemoval = resolvedStubParameters[0] === realSender;
            let txt = `${tradutor.member_remove.header}\n\n${tradutor.member_remove.group.replace('@group', groupName)}\n`;
            if (isSelfRemoval) {
              txt += `${tradutor.member_remove.self_removed.replace('@user', userDisplay)}`;
            } else {
              txt += `${tradutor.member_remove.removed_user.replace('@user', userDisplay)}\n${tradutor.member_remove.removed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 26: // Group settings change
          await safeOperation(async () => {
            const accion = resolvedStubParameters[0]?.split('@')[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `${tradutor.group_settings.header}\n\n${tradutor.group_settings.group.replace('@group', groupName)}\n${tradutor.group_settings.action.replace('@action', '```' + accion + '```')}\n${tradutor.group_settings.executed_by.replace('@user', `@${realSender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 21: // Group name change
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

function resolveLidFromCache(jid, groupChatId) {
  console.log('=== resolveLidFromCache DEBUG ===');
  console.log('Input jid:', jid);
  console.log('GroupChatId:', groupChatId);
  
  if (!jid || !jid.toString().endsWith('@lid')) {
    const result = jid?.includes('@') ? jid : `${jid}@s.whatsapp.net`;
    console.log('Not a LID, returning:', result);
    return result;
  }
  
  if (!global.lidResolver?.lidCache) {
    console.warn('LidResolver no está inicializado');
    return jid;
  }
  
  const cacheKey = `${jid}_${groupChatId}`;
  console.log('Cache key:', cacheKey);
  
  const resolvedJid = global.lidResolver.lidCache.get(cacheKey);
  console.log('Found in cache:', resolvedJid);
  
  if (resolvedJid && !resolvedJid.endsWith('@lid')) {
    console.log('Returning resolved JID:', resolvedJid);
    return resolvedJid;
  }
  
  // Si el LID se resolvió a sí mismo, intentar buscar un JID real con el mismo número
  if (resolvedJid && resolvedJid.endsWith('@lid')) {
    const lidNumber = jid.split('@')[0];
    const possibleJid = `${lidNumber}@s.whatsapp.net`;
    console.log('LID resolved to itself, trying possible JID:', possibleJid);
    
    // Verificar si existe el JID directo en algún lugar del cache
    for (const [key, value] of global.lidResolver.lidCache.entries()) {
      if (value === possibleJid) {
        console.log('Found matching JID in cache:', possibleJid);
        return possibleJid;
      }
    }
    
    // Si no se encuentra, usar el número como JID
    console.log('Using LID number as JID:', possibleJid);
    return possibleJid;
  }
  
  console.warn(`LID no encontrado en cache: ${jid}`);
  console.log('Returning original LID:', jid);
  return jid;
}

function getUserDisplayName(jid) {
  console.log('=== getUserDisplayName DEBUG ===');
  console.log('Input jid:', jid);
  
  if (!jid) {
    console.log('No JID provided, returning @undefined');
    return '@undefined';
  }
  
  if (jid.includes('@') && !jid.includes('@lid')) {
    const result = `@${jid.split('@')[0]}`;
    console.log('Valid JID, returning:', result);
    return result;
  }
  
  if (jid.includes('@lid')) {
    console.log('Still a LID, returning Usuario eliminado');
    return 'Usuario eliminado';
  }
  
  const result = `@${jid}`;
  console.log('Fallback, returning:', result);
  return result;
}

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    return resolveLidFromCache(lid, groupChatId);
}
