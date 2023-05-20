import yts from 'yt-search';
import fs from 'fs';
let handler = async (m, { conn, text }) => {
if (!text) throw '⚠️ *_¿Qué quieres que busque en YouTube?_*';
let vids_ = { 
from: m.sender, 
urls: [] 
}
if (!global.videoList) {
global.videoList = [];
}
if (global.videoList[0]?.from == m.sender) {
delete global.videoList;
}
let results = await yts(text);
let teks = results.all.map((v, i) => {
let link = v.url;
vids_.urls.push(link);
return `[${i + 1}] ${v.title}
↳ 🫐 *_Link :_* ${v.url}
↳ 🕒 *_Duración :_* ${v.timestamp}
↳ 📥 *_Subido :_* ${v.ago}
↳ 👁 *_Vistas :_* ${v.views}`}).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n')
conn.sendFile(m.chat, results.all[0].thumbnail, 'yts.jpeg', teks, m)
global.videoList.push(vids_);
}
handler.help = ['ytsearch *<texto>*'];
handler.tags = ['search'];
handler.command = ['ytsearch', 'yts'];
export default handler;


/*import yts from 'yt-search'
import fs from 'fs'

let handler = async (m, {conn, text }) => {
  if (!text) throw '⚠️ *_Que quieres que busque en YouTube?_*'
  await conn.reply(m.chat, global.wait, m)
  let results = await yts(text)
  let tes = results.all
  console.log(tes)
  let teks = results.all.map(v => {
    switch (v.type) {
      case 'video': return `
° *_${v.title}_*
↳ 🫐 *_Link :_* ${v.url}
↳ 🕒 *_Duración :_* ${v.timestamp}
↳ 📥 *_Subido :_* ${v.ago}
↳ 👁 *_Vistas :_* ${v.views}`}}).filter(v => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n')
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m)
}
handler.help = ['ytsearch *<texto>*'] 
handler.tags = ['search']
handler.command = ['ytsearch', 'yts'] 
export default handler*/
