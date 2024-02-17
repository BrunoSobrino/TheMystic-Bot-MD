/* ---------------------------------------------------------------------------------------
  🍀 • By 𝑁𝐴𝑇𝑺𝑈
-----------------------------------------------------------------------------------------*/

import {randomBytes} from 'crypto';
const link = /chat.whatsapp.com/;
const handler = async (m, {conn, text, groupMetadata}) => {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  if (!text) throw '*_⚠ • ️نسيت النص ي سيدي._*';
  const linkThisGroup = `${link}`;
  if (m.text.includes(linkThisGroup)) return conn.reply(m.chat, '❌ *مفيش جروبات في القائمه._*', m);
  const time = global.db.data.users[m.sender].msgwait + 300000;
  if (new Date - db.data.users[m.sender].msgwait < 300000) throw `*_⚠️ • Tienes que esperar ${msToTime(time - new Date())} para volver a enviar un mensaje._*`;
  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  const name = await conn.getName(m.sender);
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map((v) => v[0]);
  const fakegif = {key: {participant: `0@s.whatsapp.net`, ...('6289643739077-1613049930@g.us' ? {remoteJid: '6289643739077-1613049930@g.us'} : {})}, message: {'videoMessage': {'title': '𝑁𝐴𝑇𝑺𝑈Bᴏᴛ - MD🍁⃨፝⃕✰', 'h': `Hmm`, 'seconds': '99999', 'gifPlayback': 'true', 'caption': '💵 𝑁𝐴𝑇𝑺𝑈 𝐁𝐎𝐓 👑', 'jpegThumbnail': false}}};
  const teks = `*🎴 • من جروب:* ${groupMetadata.subject}\n*♦️ • المطور:* ${name}\n*🎟️ • الرقم:* wa.me/${who.split`@`[0]}\n*📧 • الرساله:* ${text}`;
  for (const id of groups) {
    await conn.sendMessage(id, {text: teks}, {quoted: fakegif});
    global.db.data.users[m.sender].msgwait = new Date * 1;
  }
};
handler.command = /^(نشر|اذاعه)$/i;
handler.owner = true;
handler.group = true;
export default handler;
function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' m ' + seconds + ' s ';
}
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const randomID = (length) => randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length);