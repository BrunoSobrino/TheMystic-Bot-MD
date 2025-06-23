// Creditos del codigo a @Gatito-kw //
/* GitHub: https://github.com/Gatito-kw */
/* Bot: https://github.com/Gatito-kw/nekobot-md */

// Credits: @Gatito-kw
// Enhanced with robust error handling and rate limit protection

import { WAMessageStubType } from "baileys";
import fetch from 'node-fetch';
import fs from 'fs';

export async function before(m, { conn, participants }) {
  if (!m?.messageStubType || !m?.isGroup) return true;

  const MAX_RETRIES = 2;
  const RETRY_DELAY = 5000; 
  const BASE_AVATAR = 'https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/avatar_contact.png';

  const executeWithRetry = async (operation, operationName) => {
    let retries = 0;
    while (retries <= MAX_RETRIES) {
      try {
        return await operation();
      } catch (error) {
        retries++;
        console.error(`[${operationName}] Attempt ${retries} failed:`, error);
        
        if (error.data === 429 && retries <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        throw error;
      }
    }
  }; 

  try {
    const datas = global;
    const idioma = datas?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins._detectevents;

    const groupMetadata = await executeWithRetry(async () => {
      return await conn.groupMetadata(m.chat);
    }, "Fetch Group Metadata");

    const groupName = groupMetadata.subject;
    const groupAdmins = participants.filter((p) => p.admin);
    
    const pp = await executeWithRetry(async () => {
      return await conn.profilePictureUrl(m.chat, 'image').catch(() => BASE_AVATAR);
    }, "Fetch Profile Picture");

    const img = await executeWithRetry(async () => {
      return await (await fetch(pp)).buffer();
    }, "Fetch Image Buffer");

    const chat = global?.db?.data?.chats[m.chat];
    const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [m.sender, m.messageStubParameters[0]];
    
    const fkontak2 = {'key': {'participants': '0@s.whatsapp.net','remoteJid': 'status@broadcast','fromMe': false,'id': 'Halo'},'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}},'participant': '0@s.whatsapp.net'};

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (chat?.detect2) {
      switch (m.messageStubType) {
        case 29: // Participant added
          await executeWithRetry(async () => {
            let txt = `${tradutor.texto1}${tradutor.texto1_1} ${groupName}\n`;
            txt += `${tradutor.tetxo1_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
            txt += `${tradutor.tetxo1_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: img, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          }, "Handle Add Participant");
          break;

        case 30: // Participant removed
          await executeWithRetry(async () => {
            let txt = `${tradutor.texto2}${tradutor.texto2_1} ${groupName}\n`;
            txt += `${tradutor.texto2_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
            txt += `${tradutor.texto2_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: img, caption: txt, mentions: mentionsString }, { quoted: fkontak2 });
          }, "Handle Remove Participant");
          break;

        case 27: // Admin promoted
          await executeWithRetry(async () => {
            let txt = `${tradutor.texto3}${tradutor.texto3_1} ${groupName}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.texto3_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
              txt += `${tradutor.texto3_3} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto3_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: img, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          }, "Handle Promote Admin");
          break;

        case 28: // Admin demoted
          await executeWithRetry(async () => {
            let txt = `${tradutor.texto4}${tradutor.texto4_1} ${groupName}\n`;
            if (!m.sender.endsWith('@g.us')) {
              txt += `${tradutor.texto4_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
              txt += `${tradutor.texto4_3} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto4_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          }, "Handle Demote Admin");
          break;

        case 32: // Participant left or was removed
          await executeWithRetry(async () => {
            const ax = m.messageStubParameters[0] === m.sender ? 'salido' : 'eliminado';
            let txt = `${tradutor.texto5} ${ax} ${tradutor.texto5_1}`;
            txt += `${tradutor.texto5_2} ${groupName}\n`;
            if (ax === 'eliminado') {
              txt += `${tradutor.texto5_3} @${m.messageStubParameters[0].split`@`[0]}\n`;
              txt += `${tradutor.texto5_4} @${m.sender.split`@`[0]}`;
            } else {
              txt += `${tradutor.texto5_5} @${m.messageStubParameters[0].split`@`[0]}\n`;
            }
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          }, "Handle Leave/Kick");
          break;

        case 26: // Group settings changed
          await executeWithRetry(async () => {
            const accion = m.messageStubParameters[0].split`@`[0] === 'on' ? 'cerrado' : 'abierto';
            let txt = `${tradutor.texto6}${tradutor.texto6_1} ${groupName}\n`;
            txt += `${tradutor.texto6_2} ${'```' + accion + '```'}\n`;
            txt += `${tradutor.texto6_3} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          }, "Handle Group Settings");
          break;

        case 21: // Group subject changed
          await executeWithRetry(async () => {
            let txt = `${tradutor.texto7}${tradutor.texto7_1} ${'```' + groupName + '```'}\n`;
            txt += `${tradutor.texto7_2} @${m.sender.split`@`[0]}`;
            await conn.sendMessage(m.chat, { image: { url: pp }, caption: txt, mentions: mentionsContentM }, { quoted: fkontak2 });
          }, "Handle Group Name Change");
          break;
      }
    }
    return true;
  } catch (error) {
    return true; 
}
