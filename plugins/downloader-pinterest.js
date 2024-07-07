import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
try {
if (!text) throw m.reply(`🍭 Ingresa el enlace del *Vídeo* o *Imagen* de Pinterest que deseas descargar.`)
let res = await axios.get(`https://api-starlights-team.koyeb.app/api/pindl?url=${text}`)
let { type, url: sms } = res.data
if (type === 'image') {
 await conn.sendMessage(m.chat, { image: { url: sms }, quoted: m })
} else if (type === 'video') {
await conn.sendMessage(m.chat, { video: { url: sms }, quoted: m })
} else {
throw m.reply(`Error`)
}} catch (error) {
}}
handler.tags = ['downloader']
handler.help = ['pindl <pin url>']
handler.command = /^(pindl)$/i
handler.register = true 
handler.limit = 1
export default handler
