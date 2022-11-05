import fs from 'fs'
let handler = async (m, { conn, args }) => {
let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
conn.sendMessage(m.chat, { text: link }, { quoted: m, detectLink: true })
}
handler.help = ['linkgroup']
handler.tags = ['group']
handler.command = /^link(gro?up)?$/i
handler.group = true
handler.botAdmin = true
export default handler
