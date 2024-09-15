// Creditos del codigo a @Gatito-kw //

/* GitHub: https://github.com/Gatito-kw */

/* Bot: https://github.com/Gatito-kw/nekobot-md */

import {WAMessageStubType} from "baileys";
import fetch from 'node-fetch';

 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

export async function before(m, {conn, participants}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins._detectevents

  if (!m.messageStubType || !m.isGroup) return !0;
  const groupName = (await conn.groupMetadata(m.chat)).subject;
  const groupAdmins = participants.filter((p) => p.admin);
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || 'https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/avatar_contact.png';
  const img = await (await fetch(pp)).buffer();
  const chat = global.db.data.chats[m.chat];
  const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)];
  const mentionsContentM = [m.sender, m.messageStubParameters[0]];
  const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};

  if (chat.detect2 && m.messageStubType == 29) {
    let txt1 = tradutor.texto1;
    txt1 += `${tradutor.texto1_1} ${groupName}\n`;
    txt1 += `${tradutor.tetxo1_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
    txt1 += `${tradutor.tetxo1_3} @${m.sender.split`@`[0]}`;
    await conn.sendMessage(m.chat, {image: img, caption: txt1, mentions: mentionsString}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 30) {
    let txt2 = tradutor.texto2;
    txt2 += `${tradutor.texto2_1} ${groupName}\n`;
    txt2 += `${tradutor.texto2_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
    txt2 += `${tradutor.texto2_3} @${m.sender.split`@`[0]}`;
    await conn.sendMessage(m.chat, {image: img, caption: txt2, mentions: mentionsString}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 27) {
    let txt3 = tradutor.texto3;
    txt3 += `${tradutor.texto3_1} ${groupName}\n`;
    if (!m.sender.endsWith('@g.us')) {
      txt3 += `${tradutor.texto3_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
      txt3 += `${tradutor.texto3_3} @${m.sender.split`@`[0]}`;
    } else {
      txt3 += `${tradutor.texto3_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
    }
    await conn.sendMessage(m.chat, {image: img, caption: txt3, mentions: mentionsContentM}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 28) {
    let txt4 = tradutor.texto4;
    txt4 += `${tradutor.texto4_1} ${groupName}\n`;
    if (!m.sender.endsWith('@g.us')) {
      txt4 += `${tradutor.texto4_2} @${m.messageStubParameters[0].split`@`[0]}\n`;
      txt4 += `${tradutor.texto4_3} @${m.sender.split`@`[0]}`;
    } else {
      txt4 += `${tradutor.texto4_4} @${m.messageStubParameters[0].split`@`[0]}\n`;
    }
    await conn.sendMessage(m.chat, {image: {url: pp}, caption: txt4, mentions: mentionsContentM}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 32) {
    let ax;
    if (m.messageStubParameters[0] === m.sender) {
      ax = 'salido';
    } else {
      ax = 'eliminado';
    }
    let txt5 = `${texto5} ${ax} ${tradutor.texto5_1}`;
    txt5 += `${tradutor.texto5_2} ${groupName}\n`;
    if (ax === 'eliminado') {
      txt5 += `${tradutor.texto5_3} @${m.messageStubParameters[0].split`@`[0]}\n`;
      txt5 += `${tradutor.texto5_4} @${m.sender.split`@`[0]}`;
    } else {
      txt5 += `${tradutor.texto5_5} @${m.messageStubParameters[0].split`@`[0]}\n`;
    }
    await conn.sendMessage(m.chat, {image: {url: pp}, caption: txt5, mentions: mentionsContentM}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 26) {
    let accion;
    if (m.messageStubParameters[0].split`@`[0] === 'on') {
      accion = 'cerrado';
    } else {
      accion = 'abierto';
    }
    let txt6 = tradutor.texto6;
    txt6 += `${tradutor.texto6_1} ${groupName}\n`;
    txt6 += `${tradutor.texto6_2} ${'```' + accion + '```'}\n`;
    txt6 += `${tradutor.texto6_3} @${m.sender.split`@`[0]}`;
    await conn.sendMessage(m.chat, {image: {url: pp}, caption: txt6, mentions: mentionsContentM}, {quoted: fkontak2});
  }

  if (chat.detect2 && m.messageStubType == 21) {
    let txt7 = tradutor.texto7;
    txt7 += `${tradutor.texto7_1} ${'```' + groupName + '```'}\n`;
    txt7 += `${tradutor.texto7_2} @${m.sender.split`@`[0]}`;
    await conn.sendMessage(m.chat, {image: {url: pp}, caption: txt7, mentions: mentionsContentM}, {quoted: fkontak2});
  }
} /* Cierre del comando */
