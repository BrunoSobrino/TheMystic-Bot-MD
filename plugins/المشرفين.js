let handler = async (m, { conn, participants, groupMetadata, args }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './Menu.jpg'
const groupAdmins = participants.filter(p => p.admin)
const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
let pesan = args.join` `
let oi = `*الرساله:* ${pesan}`
let text = `*━「* قائمه المشرفين *」━*

${oi}

*الادمن:*
${listAdmin}

*[ ⚠ ️] هذا الامر للحالات الطارئه فقط!!*`.trim()
conn.sendFile(m.chat, pp, 'Menu.jpg', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}
handler.help = ['admins <texto>']
handler.tags = ['group']
handler.command = /^(admins|مشرفين|الادمنز|المشرفين|الادمن)$/i
handler.group = true
export default handler
