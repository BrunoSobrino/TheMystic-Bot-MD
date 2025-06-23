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
    const datas = global;
    const idioma = datas?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins._detectevents;

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
        case 29:
          await safeOperation(async () => {
            let txt = `${tradutor.texto1}${tradutor.texto1_1} ${groupName}\n${tradutor.tetxo1_2} @${m.messageStubParameters[0].split`@`[0]}\n${tradutor.tetxo1_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 30:
          await safeOperation(async () => {
            let txt = `${tradutor.texto2}${tradutor.texto2_1} ${groupName}\n${tradutor.texto2_2} @${m.messageStubParameters[0].split`@`[0]}\n${tradutor.texto2_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          });
          break;

        case 27:
          await safeOperation(async () => {
            let txt = `${tradutor.texto3}${tradutor.texto3_1} ${groupName}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.texto3_2} @${m.messageStubParameters[0].split`@`[0]}\n${tradutor.texto3_3} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto3_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: img || {url: pp}, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 28:
          await safeOperation(async () => {
            let txt = `${tradutor.texto4}${tradutor.texto4_1} ${groupName}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.texto4_2} @${m.messageStubParameters[0].split`@`[0]}\n${tradutor.texto4_3} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto4_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 32:
          await safeOperation(async () => {
            const ax = m.messageStubParameters[0] === m.sender ? 'salido' : 'eliminado';
            let txt = `${tradutor.texto5} ${ax} ${tradutor.texto5_1}${tradutor.texto5_2} ${groupName}\n`;
            if (ax === 'eliminado') {
              txt += `${tradutor.texto5_3} @${m.messageStubParameters[0].split`@`[0]}\n${tradutor.texto5_4} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto5_5} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 26:
          await safeOperation(async () => {
            const accion = m.messageStubParameters[0].split`@`[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `${tradutor.texto6}${tradutor.texto6_1} ${groupName}\n${tradutor.texto6_2} ${'```' + accion + '```'}\n${tradutor.texto6_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          });
          break;

        case 21:
          await safeOperation(async () => {
            let txt = `${tradutor.texto7}${tradutor.texto7_1} ${'```' + groupName + '```'}\n${tradutor.texto7_2} @${m.sender.split`@`[0]}`;
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
