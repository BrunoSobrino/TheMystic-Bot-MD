/*---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
-----------------------------------------------------------------------------------------*/

import { randomBytes } from 'crypto'
let link = /chat.whatsapp.com/
let handler = async (m, { conn, text, groupMetadata }) => {
if (m.isBaileys && m.fromMe)
return !0
if (!m.isGroup) return !1
if (!text) throw '*_⚠ • ️Ingrese un -texto- para enviar un mensaje a todos los grupos._*'
const linkThisGroup = `${link}`
if (m.text.includes(linkThisGroup)) return conn.reply(m.chat, '❌ *_No puedes espamear enlaces a otros grupos._*', m)
let time = global.db.data.users[m.sender].msgwait + 300000
if (new Date - db.data.users[m.sender].msgwait < 300000) throw `*_⚠️ • Tienes que esperar ${msToTime(time - new Date())} para volver a enviar un mensaje._*`
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let name = await conn.getName(m.sender)
let groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map(v => v[0])
let fakegif = { key: {participant: `0@s.whatsapp.net`, ...("6289643739077-1613049930@g.us" ? { remoteJid: "6289643739077-1613049930@g.us" } : {})},message: {"videoMessage": { "title": '🐱⸽⃕NʏᴀɴCᴀᴛBᴏᴛ - MD🍁⃨፝⃕✰', "h": `Hmm`,'seconds': '99999', 'gifPlayback': 'true', 'caption': '🧿 𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝 🔮', 'jpegThumbnail': false }}}
let teks = `*🌺 • 𝙶𝚛𝚞𝚙𝚘:* ${groupMetadata.subject}\n*🍀 • 𝙳𝚎:* ${name}\n*🍁 • 𝙽𝚞́𝚖𝚎𝚛𝚘:* wa.me/${who.split`@`[0]}\n*📧 • 𝙼𝚎𝚗𝚜𝚊𝚓𝚎:* ${text}`
for (let id of groups) {
await conn.sendMessage(id, { text: teks }, { quoted: fakegif })
global.db.data.users[m.sender].msgwait = new Date * 1
}}
handler.command = /^(msg)$/i
handler.owner = true
handler.group = true
export default handler
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return minutes + " m " + seconds + " s " }
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
const randomID = length => randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length)
