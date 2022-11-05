import fs from 'fs'
let handler = async (m, { conn, args }) => {
let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
conn.sendMessage(m.chat, {text: link, "contextInfo": {
 mimetype: "image/jpeg",
 text: 'lol',
 "forwardingScore": 1000000000,
 isForwarded: true,
 sendEphemeral: true,
 "externalAdReply": {
 "title": 'lol2',
 "body": 'lol3',
 "previewType": "PHOTO",
 "thumbnailUrl": imagen4,
 "thumbnail": imagen4,
 "sourceUrl": `https://github.com/BrunoSobrino/TheMystic-Bot-MD`
 }}}, { quoted: m, detectLink: true })
  
  
  
}
handler.help = ['linkgroup']
handler.tags = ['group']
handler.command = /^link(gro?up)?$/i
handler.group = true
handler.botAdmin = true
export default handler
