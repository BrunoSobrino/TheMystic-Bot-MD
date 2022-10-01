let handler = async (m, { conn, text, command, usedPrefix }) => {
let pp = './Menu2.jpg'
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
else who = m.chat
let user = global.db.data.users[who]
let warntext = `*[❗] 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 𝙿𝙰𝚁𝙰 𝙰𝙳𝚅𝙴𝚁𝚃𝙸𝚁 𝙰𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} @${global.suittag}*`
if (!who) throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext)}) 
user.warn += 1
  
await conn.sendButton(m.chat,`${user.warn == 1 ? `*@${who.split`@`[0]}*` : `*@${who.split`@`[0]}*`} 𝚁𝙴𝙲𝙸𝙱𝙸𝙾 𝚄𝙽𝙰 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾!`, `*ADVERTENCIAS *${user.warn}/3*\n\n${wm}`, pp, [['📋 𝙻𝙸𝚂𝚃𝚆𝙰𝚁𝙽 📋', '#listwarn']], false, { mentions: [who] })
	
if (user.warn >= 3) {
user.warn = 0
await m.reply(`𝚃𝙴 𝙻𝙾 𝙰𝙳𝚅𝙴𝚁𝚃𝙸𝚁 𝚅𝙰𝚁𝙸𝙰𝚂 𝚅𝙴𝙲𝙴𝚂!!\n*@${who.split`@`[0]}* 𝚂𝚄𝙿𝙴𝚁𝙰𝚂𝚃𝙴 𝙻𝙰𝚂 *4* 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰𝚂 𝙰𝙷𝙾𝚁𝙰 𝚂𝙴𝚁𝙰𝚂 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾/𝙰 👽`, false, { mentions: [who] })
user.banned = true
await conn.groupParticipantsUpdate(m.chat, [who], 'remove') 
}
return !1
}
handler.help = ['addprem <@user>']
handler.tags = ['owner']
handler.command = /^(advertir|advertencia|warn|warning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
