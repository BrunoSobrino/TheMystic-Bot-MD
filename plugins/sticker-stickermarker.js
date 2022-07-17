import uploadImage from '../lib/uploadImage.js'
import { sticker } from '../lib/sticker.js'
import MessageType from '@adiwajshing/baileys'
const effects = ['jail', 'gay', 'glass', 'wasted' ,'triggered', 'lolice', 'simpcard', 'horny']

let handler = async (m, { conn, usedPrefix, text }) => {
let effect = text.trim().toLowerCase()
if (!effects.includes(effect)) throw `
*_✳️ USO CORRECTO DEL COMANDO ✳️_*
*👉 Use:* ${usedPrefix}stickermaker (efecto) 
- Y responda a una imagen
*✅ Ejemplo:* ${usedPrefix}stickermaker jail
*List Effect:*
${effects.map(effect => `_> ${effect}_`).join('\n')}
`.trim()
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw '*_🔰 No se encontro la imagen_*\n\n*_✅ Responda a una imagen_*'
if (!/image\/(jpe?g|png)/.test(mime)) throw `*_⚠️ Formato no admitido_*\n\n*_👉🏻 Responda a una imagen_*`
let img = await q.download()
let url = await uploadImage(img)
let apiUrl = global.API('https://some-random-api.ml/canvas/', encodeURIComponent(effect), {
avatar: url
})
try {
let stiker = await sticker(null, apiUrl, global.packname, global.author)
conn.sendFile(m.chat, stiker, null, { asSticker: true })
} catch (e) {
m.reply('*_⚠️ Ocurrió un error al hacer la conversión a sticker_*\n\n*_✳️ Enviando imagen en su lugar..._*')
await conn.sendFile(m.chat, apiUrl, 'image.png', null, m)
}}
handler.help = ['stickmaker (caption|reply media)']
handler.tags = ['General']
handler.command = /^(stickmaker|stickermaker|stickermarker|cs)$/i
export default handler
