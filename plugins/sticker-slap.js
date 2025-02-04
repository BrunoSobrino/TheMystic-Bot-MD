import {sticker} from '../src/libraries/sticker.js';
import fetch from 'node-fetch';


const handler = async (m, {conn, args, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.sticker_slap;

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
  }
  const textquien = `${tradutor.texto1}\n◉ ${usedPrefix + command} @${global.suittag}`;
  if (who === m.chat && m.isGroup || !who && m.isGroup) return m.reply(textquien, m.chat, {mentions: conn.parseMention(textquien)});
  try {
    let name;
    if (who === m.chat) {
      name = '𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝';
    } else {
      name = conn.getName(who);
    }
    const name2 = conn.getName(m.sender);
    const apislap = await fetch(`https://api.waifu.pics/sfw/slap`);
    const jkis = await apislap.json();
    const {url} = jkis;
    const stiker = await sticker(null, url, `${name2} le dio una bofetada a ${name}`, null);
    conn.sendFile(m.chat, stiker, null, {asSticker: true}, m, true, {contextInfo: {forwardingScore: 200, isForwarded: true}}, {quoted: m});
  } catch {
    throw tradutor.texto2;
  };
};
handler.help = ['slap'];
handler.tags = ['General'];
handler.command = /^(slap|bofetada)$/i;
export default handler;
