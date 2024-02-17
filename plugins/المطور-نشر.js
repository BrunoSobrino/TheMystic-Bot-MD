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
let fakegif = { key: {participant: `0@s.whatsapp.net`, ...("201554824764-201554824764@g.us" ? { remoteJid: "201554824764-201554824764@g.us" } : {})},message: {"videoMessage": { "title": '𝔐𝔦𝔨𝔲 𝔅𝔒𝔗', "h": `Hmm`,'seconds': '99999', 'gifPlayback': 'true', 'caption': '𝑁𝐴𝑇𝑺𝑈 𝔅𝔒𝔗', 'jpegThumbnail': false }}}
let teks = `*🌺 • الجروب:* ${groupMetadata.subject}\n*❄️ • من:* ${name}\n*👨‍💻 • رقم المطور:* wa.me/${who.split`@`[0]}\n*💌 • الرساله:* ${text}`
for (let id of groups) {
await conn.sendMessage(id, { text: teks }, { quoted: fakegif })
global.db.data.users[m.sender].msgwait = new Date * 1
}}
handler.command = /^(اعلان)$/i
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