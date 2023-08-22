import {sticker} from '../lib/sticker.js';
import fetch from 'node-fetch';
import MessageType from '@whiskeysockets/baileys';
const handler = async (m, {conn, text}) => {
  try {
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender);
    if (!m.mentionedJid.length) m.mentionedJid.push(text);
    const res = await fetch('https://nekos.life/api/kiss');
    const json = await res.json();
    const {url} = json;
    const name_1 = conn.getName(m.sender)
    const name_2 = conn.getName(m.mentionedJid[0])
    const stiker = await sticker(null, url, `${name_1} le dio besos a ${name_2 ? name_2 : 'alguien'}`);
    conn.sendFile(m.chat, stiker, null, null, m, false, {asSticker: true});
  } catch { }
};
handler.command = /^(kiss|skiss|kis|besos|beso)$/i;
export default handler;
