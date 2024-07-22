import Scraper from "@SumiFX/Scraper"
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('🔍 `¿Que quieres buscar?`')
try {
let { dl_url } = await Scraper.pinterest(text)
await conn.sendFile(m.chat, dl_url, 'thumbnail.jpg', `🍁 *Aquí Tienes*`, m)
} catch {
}}
handler.help = ['pinterest <texto>']
handler.tags = ['downloader']
handler.command = ['pinterest']
export default handler
