import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `*[❗] 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 𝙳𝙴 𝚄𝚂𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command} https://getstickerpack.com/stickers/flork-memes-4-1*`
let url = text
let res = await fetch(`https://api.zacros.my.id/downloader/stickerpack?link=${url}`)
let json = await res.json()
for (let data of (json.result || json)) {
const stikers = await sticker(false, data, global.packname, global.author)
conn.sendFile(m.chat, stikers, 'sticker.webp', '', m, { asSticker: true })
//await delay(1500)
}}
handler.command = /^stickerly|stickerpack$/i
export default handler
//const delay = time => new Promise(res => setTimeout(res, time))
