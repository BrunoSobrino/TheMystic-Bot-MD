import { generateWAMessageFromContent } from '@adiwajshing/baileys'

let handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  if (!(isOwner || isAdmin)) throw dfail('admin', m, conn)
  let users = participants.map(u => conn.decodeJid(u.id))
  let q = m.quoted ? m.quoted : m
  let c = m.quoted ? await m.getQuotedObj() : m.msg
  let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c }}, { quoted: null, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })
  // console.log(msg)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}
handler.help = handler.alias = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag)$/i

handler.group = true

export default handler
