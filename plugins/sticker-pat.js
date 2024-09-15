import {sticker} from '../src/libraries/sticker.js';
import fetch from 'node-fetch';
import MessageType from "baileys";


const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.sticker_pat

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
