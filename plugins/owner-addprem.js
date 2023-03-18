let handler = async (m, { conn, text, usedPrefix, command }) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
else who = m.chat

let user = global.db.data.users[who]
if (!who) throw `*MENCIONA O REPONDA AL MENSAJE DE LA APERSONA QUE SERÁ PREMIUM*\n\n*${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*${usedPrefix + command} 1*`
let txt = text.replace('@' + who.split`@`[0], '').trim()
let name = await '@' + who.split`@`[0]

var hora1 = 3600000 * txt //1h
var dia1 = 86400000 * txt //1d
var semana1 = 604800000 * txt //1s
var mes1 = 2629800000 * txt //1m
var now = new Date() * 1

if (!txt && !m.quoted) throw `*FALTA EL TIEMPO PREMIUM*`
if (txt == 0 || txt == null) throw `*DEBE INGRESAR EL TIEMPO PREMIUM*\n\n*${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*${usedPrefix + command} 1*`
if (isNaN(txt)) return m.reply(`*SOLO NÚMERO*\n\n*${usedPrefix + command} @${m.sender.split`@`[0]} 1*`)
  
if (command == 'addprem' || command == 'userpremium') {
if (now < user.premiumTime) user.premiumTime += hora1
else user.premiumTime = now + hora1
user.premium = true
m.reply(`*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${hora1 } hora(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`)}
    
if (command == 'addprem2' || command == 'userpremium2') {
if (now < user.premiumTime) user.premiumTime += dia1
else user.premiumTime = now + dia1
user.premium = true
m.reply(`*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${dia1} Día(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`)}

  
if (command == 'addprem3' || command == 'userpremium3') {
if (now < user.premiumTime) user.premiumTime += semana1
else user.premiumTime = now + semana1
user.premium = true
m.reply(`*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${semana1} Semana(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴 ${user.premiumTime - now} seg*`)}

  
if (command == 'addprem4' || command == 'userpremium4') {
if (now < user.premiumTime) user.premiumTime += mes1
else user.premiumTime = now + mes1
user.premium = true
m.reply(`*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${mes1} Mes(es)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`)}
}
handler.help = ['addprem [@user] <days>']
handler.tags = ['owner']
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'] 
handler.group = true
handler.rowner = true
export default handler

/*let handler = async (m, { conn, text }) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
else who = m.chat
if (!who) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 @𝚝𝚊𝚐 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁 𝙰 𝙻𝙾𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*`
let user = global.db.data.users[who]
//if (user.premium = true) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝙶𝚁𝙴𝚂𝙰𝙳𝙾 𝚈𝙰 𝙴𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*'
user.premium = true
let textprem = `*[❗𝐈𝐍𝐅𝐎❗] @${who.split`@`[0]} 𝙰𝙷𝙾𝚁𝙰 𝙴𝚂 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼, 𝙽𝙾 𝚃𝙴𝙽𝙳𝚁𝙰 𝙻𝙸𝙼𝙸𝚃𝙴𝚂 𝙰𝙻 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙱𝙾𝚃*`
m.reply(textprem, null, { mentions: conn.parseMention(textprem) })
}
handler.help = ['addprem <@user>']
handler.tags = ['owner']
handler.command = /^(add|\+)prem$/i
handler.group = true
handler.rowner = true
export default handler*/
