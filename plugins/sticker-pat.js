import {sticker} from '../lib/sticker.js';
import fetch from 'node-fetch';
import MessageType from '@whiskeysockets/baileys';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.sticker_pat
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn}) => {
  try {
    if (m.quoted?.sender) m.mentionedJid.push(m.quoted.sender);
    if (!m.mentionedJid.length) m.mentionedJid.push(m.sender);
    const res = await fetch('https://api.waifu.pics/sfw/pat');
    const json = await res.json();
    const {url} = json;
    const stiker = await sticker(null, url, `+${m.sender.split('@')[0]} ${tradutor.texto1[0]} ${m.mentionedJid.map((user)=>(user === m.sender)? tradutor.texto1[1]: `+${user.split('@')[0]}`).join(', ')}`);
    conn.sendFile(m.chat, stiker, null, {asSticker: true});
  } catch (e) { }
};
handler.command = /^(pat|palmaditas|cariños|mimos|patt)$/i;
export default handler;
