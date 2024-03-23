/* Codigo copiado de GataBot-MD */

import { sticker } from '../lib/sticker.js';
import axios from 'axios';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.sticker_qc
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, args, usedPrefix, command}) => {
let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ");
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text;
    } else throw tradutor.texto1;
   if (!text) return m.reply(tradutor.texto2);
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender; 
    const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
    const mishi = text.replace(mentionRegex, '');
   if (mishi.length > 30) return m.reply(tradutor.texto3);
    const pp = await conn.profilePictureUrl(who).catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    const nombre = await conn.getName(who)
    const obj = {"type": "quote", "format": "png", "backgroundColor": "#000000", "width": 512, "height": 768, "scale": 2, "messages": [{"entities": [], "avatar": true, "from": {"id": 1, "name": `${who?.name || nombre}`, "photo": {url: `${pp}`}}, "text": mishi, "replyMessage": {}}]};
    const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {headers: {'Content-Type': 'application/json'}});
    const buffer = Buffer.from(json.data.result.image, 'base64');
   let stiker = await sticker(buffer, false, global.packname, global.author);
   if (stiker) return conn.sendFile(m.chat, stiker, 'error.webp', '', m);
}
handler.help = ['qc'];
handler.tags = ['sticker'];
handler.command = /^(qc)$/i;
export default handler;
