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
// FUNCIÓN DE RESOLUCIÓN LID ADAPTADA A NUEVA ESTRUCTURA (conn.lid)
// ===============================
async function resolveLidFromCache(jid, groupChatId, conn) {
  if (!jid || !jid.toString().endsWith('@lid')) {
    return jid?.includes('@') ? jid : `${jid}@s.whatsapp.net`;
  }
  
  if (!conn?.lid) {
    console.warn('[DETECT-EVENTS] conn.lid no disponible, devolviendo JID original');
    return jid;
  }

  try {
    // Método principal: usar resolveLid de conn.lid
    if (conn.lid.resolveLid) {
      const resolved = await conn.lid.resolveLid(jid, groupChatId);
      if (resolved && resolved !== jid) {
        return resolved;
      }
    }

    // Método alternativo: buscar en caché por LID
    const lidKey = jid.split('@')[0];
    const userInfo = conn.lid.getUserInfo(lidKey);
    if (userInfo && userInfo.jid && !userInfo.jid.endsWith('@lid')) {
      return userInfo.jid;
    }

    // Búsqueda en todos los usuarios del caché
    const cachedUsers = conn.lid.getAllUsers();
    for (const user of cachedUsers) {
      if (user.lid === jid && user.jid && !user.jid.endsWith('@lid')) {
        return user.jid;
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
// FUNCIÓN PARA MOSTRAR NOMBRES DE USUARIO MEJORADA (conn.lid)
// ===============================
function getUserDisplayName(jid, conn) {
  if (!jid) {
    return '@undefined';
  }

  // Si es un JID normal (no LID)
  if (jid.includes('@') && !jid.includes('@lid')) {
    return `@${jid.split('@')[0]}`;
  }

  // Si es un LID, intentar obtener información del caché
  if (jid.includes('@lid')) {
    try {
      const lidKey = jid.split('@')[0];
      
      if (conn?.lid) {
        const userInfo = conn.lid.getUserInfo(lidKey);
        if (userInfo) {
          // Priorizar nombre real si está disponible y es válido
          if (userInfo.name && 
              userInfo.name !== 'Nombre pendiente' && 
              userInfo.name !== 'Usuario no encontrado' &&
              userInfo.name !== 'Error al resolver') {
            return userInfo.name;
          }
          
          // Si no hay nombre válido, usar el JID resuelto
          if (userInfo.jid && !userInfo.jid.endsWith('@lid')) {
            return `@${userInfo.jid.split('@')[0]}`;
          }
        }
      }
      
      // Fallback: mostrar el número LID
      return `@${lidKey}`;

    } catch (error) {
      console.error('[DETECT-EVENTS] Error obteniendo nombre de usuario:', error);
      return 'Usuario no identificado';
    }
  }

  // Fallback para cualquier otro caso
  return `@${jid}`;
}

// ===============================
// FUNCIÓN DE RESOLUCIÓN SIMPLIFICADA (conn.lid)
// ===============================
async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
  return await resolveLidFromCache(lid, groupChatId, conn);
}

// ===============================
// FUNCIÓN AUXILIAR: VERIFICAR SI UN JID ES LID
// ===============================
function isLidJid(jid) {
  return jid && typeof jid === 'string' && jid.endsWith('@lid');
}

// ===============================
// FUNCIÓN AUXILIAR: OBTENER INFORMACIÓN COMPLETA DE USUARIO
// ===============================
function getUserCompleteInfo(jid, conn) {
  if (!conn?.lid || !jid) {
    return null;
  }

  try {
    // Si es un LID, buscar por LID
    if (isLidJid(jid)) {
      const lidKey = jid.split('@')[0];
      return conn.lid.getUserInfo(lidKey);
    }
    
    // Si es un JID normal, buscar por JID
    return conn.lid.getUserInfoByJid(jid);

  } catch (error) {
    console.error('[DETECT-EVENTS] Error obteniendo información completa:', error);
    return null;
  }
}

// ===============================
// FUNCIÓN AUXILIAR: ENCONTRAR LID POR JID
// ===============================
function findLidByJid(jid, conn) {
  if (!conn?.lid || !jid || isLidJid(jid)) {
    return null;
  }

  try {
    return conn.lid.findLidByJid(jid);
  } catch (error) {
    console.error('[DETECT-EVENTS] Error encontrando LID:', error);
    return null;
  }
}

// ===============================
// FUNCIÓN DE PROCESAMIENTO BATCH PARA MÚLTIPLES LIDS
// ===============================
async function resolveMultipleLids(lids, conn, groupChatId) {
  if (!Array.isArray(lids) || !conn?.lid) {
    return lids;
  }

  const resolved = [];
  
  for (const lid of lids) {
    try {
      if (isLidJid(lid)) {
        const resolvedJid = await resolveLidFromCache(lid, groupChatId, conn);
        resolved.push(resolvedJid);
      } else {
        resolved.push(lid);
      }
    } catch (error) {
      console.error(`[DETECT-EVENTS] Error resolviendo LID ${lid}:`, error);
      resolved.push(lid); // Mantener original si falla
    }
  }

  return resolved;
}

// ===============================
// FUNCIÓN PARA FORMATEAR MENCIONES EN TEXTO
// ===============================
function formatMentionsInText(text, conn) {
  if (!text || !conn?.lid) {
    return text;
  }

  try {
    // Buscar patrones de LID en el texto (@numeroLID)
    const lidPattern = /@(\d{8,20})/g;
    
    return text.replace(lidPattern, (match, lidNumber) => {
      const userInfo = conn.lid.getUserInfo(lidNumber);
      
      if (userInfo && userInfo.name && 
          userInfo.name !== 'Nombre pendiente' && 
          userInfo.name !== 'Usuario no encontrado') {
        return `@${userInfo.name}`;
      }
      
      // Si no hay nombre, intentar usar el JID resuelto
      if (userInfo && userInfo.jid && !userInfo.jid.endsWith('@lid')) {
        return `@${userInfo.jid.split('@')[0]}`;
      }
      
      // Fallback: mantener el número original
      return match;
    });

  } catch (error) {
    console.error('[DETECT-EVENTS] Error formateando menciones:', error);
    return text;
  }
}

// ===============================
// FUNCIÓN PARA VALIDAR ESTADO DEL CACHE LID
// ===============================
function validateLidCacheStatus(conn) {
  if (!conn?.lid) {
    return {
      available: false,
      message: 'conn.lid no está disponible'
    };
  }

  try {
    const stats = conn.lid.getStats();
    
    return {
      available: true,
      stats: stats,
      healthy: stats.total > 0 && stats.fileExists,
      message: `Caché disponible: ${stats.total} entradas`
    };

  } catch (error) {
    return {
      available: false,
      error: error.message,
      message: 'Error verificando estado del caché'
    };
  }
}
