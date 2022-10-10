import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'
let handler = async (m, { conn, text, usedPrefix, command }) => {
let q = m.quoted ? m.quoted : m
let img = await q.download?.()
let url = await uploadImage(img)
let anu = await fetch(`https://api.lolhuman.xyz/api/read-qr?apikey=85faf717d0545d14074659ad&img=${url}`)
let json = await anu.json()
m.reply(`*El Texto del Codigo QR Es:* ${json.result}`)}
handler.command = /^(readqr)$/i
export default handler
