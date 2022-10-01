let handler = async (m, { conn, text, command, usedPrefix }) => {
let pp = './src/warn.jpg'
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
else who = m.chat
let user = global.db.data.users[who]
let bot = global.db.data.settings[conn.user.jid] || {}
let warntext = `*[❗] 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} @${global.suittag}*`
if (!who) throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext)}) 
user.warn -= 1
await conn.sendButton(m.chat,`${user.warn == 1 ? `*@${who.split`@`[0]}*` : `♻️ *@${who.split`@`[0]}*`} 𝚂𝙴 𝙻𝙴 𝚀𝚄𝙸𝚃𝙾 𝚄𝙽𝙰 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 `, `*ADVERTENCIAS:*\n⚠️ *Antes: ${user.warn + 1}/3*\n⚠️ *Ahora: ${user.warn}/3*\n\n${wm}`, pp, [['📋 𝙻𝙸𝚂𝚃𝚆𝙰𝚁𝙽 📋', '#listwarn']], m, { mentions: [who] })}
handler.command = /^(unwarn|delwarn|deladvertir|deladvertencia|delwarning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
