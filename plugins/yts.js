import yts from 'yt-search'
import fs from  'fs'
let handler = async (m, {conn, text }) => {
  if (!text) throw ' هذا الامر خاص بالبحث في اليوتوب وأخذ رابط الفيديو \n مثلا :\n *.yts*   noureddine ouafy whatsapp bot'
  await conn.reply(m.chat, global.wait, m)
  let results = await yts(text)
  let tes = results.all
  let teks = results.all.map(v => {
    switch (v.type) {
      case  'video' : return `
° *_${v.title}_*
↳ 🫐 *_L :_* ${v.url}
↳ 🕒 *_D :_* ${v.timestamp}
↳ 📥 *_S :_* ${v.ago}
↳ 👁 *_V :_* ${v.views}`}}).filter(v => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n' )
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg' , teks, m)
}
handler.help = [ 'yts' ] 
handler.tags = [ 'search']
handler.command = [ 'yts' ,  'ytss' ] 
export default handler
