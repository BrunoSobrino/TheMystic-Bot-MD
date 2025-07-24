// Creditos del codigo a @Gatito-kw //
/* GitHub: https://github.com/Gatito-kw */
/* Bot: https://github.com/Gatito-kw/nekobot-md */

import { WAMessageStubType } from "baileys";
import fetch from 'node-fetch';
import fs from 'fs';

const groupMetadataCache = new Map();

export async function before(m, { conn, participants }) {
  if (!m?.messageStubType || !m?.isGroup) return true;
  console.log(m.sender)
  
  const safeOperation = async (operation, fallback = null) => {
    try {
      return await operation();
    } catch (error) {
      return fallback;
    }
  };

  try {     
    const idioma = global.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
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
    const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [m.sender, m.messageStubParameters[0]];
    const fkontak2 = {'key': {'participants': '0@s.whatsapp.net','remoteJid': 'status@broadcast','fromMe': false,'id': 'Halo'},'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}},'participant': '0@s.whatsapp.net'};

    if (chat?.detect2) {
      switch (m.messageStubType) {
        case 29: // Promote
          await safeOperation(async () => {
            let txt = `${tradutor.promote.header}\n\n${tradutor.promote.group.replace('@group', groupName)}\n${tradutor.promote.new_admin.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}\n${tradutor.promote.executed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 30: // Demote
          await safeOperation(async () => {
            let txt = `${tradutor.demote.header}\n\n${tradutor.demote.group.replace('@group', groupName)}\n${tradutor.demote.removed_admin.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}\n${tradutor.demote.executed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 27: // Member add
          await safeOperation(async () => {
            let txt = `${tradutor.member_add.header}\n\n${tradutor.member_add.group.replace('@group', groupName)}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.member_add.added_user.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}\n${tradutor.member_add.added_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            } else {
              txt += `${tradutor.member_add.self_added.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}`;
            }
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 28: // Member remove
          await safeOperation(async () => {
            let txt = `${tradutor.member_remove.header}\n\n${tradutor.member_remove.group.replace('@group', groupName)}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.member_remove.removed_user.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}\n${tradutor.member_remove.removed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            } else {
              txt += `${tradutor.member_remove.self_removed.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 32: // Member leave or remove
          await safeOperation(async () => {
            const ax = m.messageStubParameters[0] === m.sender ? 'self_removed' : 'removed_user';
            let txt = `${tradutor.member_remove.header}\n\n${tradutor.member_remove.group.replace('@group', groupName)}\n`;
            if (ax === 'removed_user') {
              txt += `${tradutor.member_remove.removed_user.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}\n${tradutor.member_remove.removed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            } else {
              txt += `${tradutor.member_remove.self_removed.replace('@user', `@${m.messageStubParameters[0].split('@')[0]}`)}`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 26: // Group settings change
          await safeOperation(async () => {
            const accion = m.messageStubParameters[0].split('@')[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `${tradutor.group_settings.header}\n\n${tradutor.group_settings.group.replace('@group', groupName)}\n${tradutor.group_settings.action.replace('@action', '```' + accion + '```')}\n${tradutor.group_settings.executed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 21: // Group name change
          await safeOperation(async () => {
            let txt = `${tradutor.group_name.header}\n\n${tradutor.group_name.new_name.replace('@name', '```' + groupName + '```')}\n${tradutor.group_name.executed_by.replace('@user', `@${m.sender.split('@')[0]}`)}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;
      }
    }
    return true;
  } catch (error) {
    return true;
  }
}
