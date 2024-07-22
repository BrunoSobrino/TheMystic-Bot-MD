import Scraper from "@SumiFX/Scraper"
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('[ℹ️] *¿Que quieres buscar?*')
try {
let { dl_url } = await Scraper.pinterest(text)
await conn.sendFile(m.chat, dl_url, 'thumbnail.jpg', `🔍 ${text}`, m)
} catch {
}}
handler.help = ['pinterest <texto>']
handler.tags = ['downloader']
handler.command = ['pinterest']
export default handler
