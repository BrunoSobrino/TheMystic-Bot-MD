/*---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
-----------------------------------------------------------------------------------------*/

import db from '../lib/database.js'
let handler  = async (m, { conn, usedPrefix, command }) => {
let fgif = { key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6289643739077-1613049930@g.us" } : {})},message: {"videoMessage": { "title":`*Aʟʙᴇʀᴛᴏ Y Asʜʟʏ♥️*`, "h": `Hmm`,'seconds': '99999', 'gifPlayback': 'true', 'caption': `🧿 𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝 🔮`, 'jpegThumbnail': false }}}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let user = db.data.users[who]
let name = await conn.getName[who]
let json = await fetch(`http://mkbot.online/api/tiktok/nsfw/nsfwtt?&apikey=8UtWbnvW`)
let jsons = await json.json()
  let res = jsons.result
conn.sendButton(m.chat, `- 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍𝚘 𝚊 𝚃𝚒𝚔𝚃𝚘𝚔 𝙶𝚘𝚕𝚍🥵 -`, `*◈•@${who.split("@s.whatsapp.net")[0]}*`, res, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif, { mentions: [who] })}
handler.help = ['lolivid']
handler.tags = ['random']
handler.command = /^(tiktokxxx)$/i
export default handler
