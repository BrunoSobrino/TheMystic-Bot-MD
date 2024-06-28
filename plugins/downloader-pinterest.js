import Scraper from "@SumiFX/Scraper"
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('👑 Ingresa un texto para realizar la búsqueda.')
try {
//m.react(rwait)
let { dl_url } = await Scraper.pinterest(text)
await conn.sendFile(m.chat, dl_url, 'thumbnail.jpg', null, m)
m.react(done)
} catch {
}}
handler.help = ['pinterest <texto>']
handler.tags = ['internet']
handler.command = ['pinterest']
handler.limit = 1
handler.register = true
export default handler
