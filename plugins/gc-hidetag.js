import { generateWAMessageFromContent } from '@adiwajshing/baileys'
let handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
let users = participants.map(u => conn.decodeJid(u.id))
let q = m.quoted ? m.quoted : m || m.text || m.sender
let c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender
let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c }}, { quoted: m, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notificar)$/i
handler.group = true
handler.admin = true
export default handler
