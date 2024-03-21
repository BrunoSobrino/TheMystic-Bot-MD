import {sticker} from '../lib/sticker.js';
import fetch from 'node-fetch';
import MessageType from '@whiskeysockets/baileys';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.sticker_kiss
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text}) => {
  try {
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender ? m.quoted.sender : m.fromMe ? conn.user.jid : m.sender;
    if (!who) throw tradutor.texto1;
    const res = await fetch('https://nekos.life/api/kiss');
    const json = await res.json();
    const {url} = json;
    const name_1 = conn.getName(m.sender)
    const name_2 = conn.getName(who)
    const stiker = await sticker(null, url, `${name_1} le dio besos a ${name_2}`);
    conn.sendFile(m.chat, stiker, null, null, m, false, {asSticker: true});
  } catch { }
};
handler.command = /^(kiss|skiss|kis|besos|beso)$/i;
handler.group = true;
export default handler;
