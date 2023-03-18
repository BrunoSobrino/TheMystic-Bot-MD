let handler = async (m, { conn, text, usedPrefix, command }) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
else who = m.chat
let user = global.db.data.users[who]
let txt = text.replace('@' + who.split`@`[0], '').trim()
let name = await '@' + who.split`@`[0]

if (!who || !txt || !m.quoted) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 @𝚝𝚊𝚐 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝙰𝙻𝙶𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁 𝙰 𝙻𝙾𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ ${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*◉ ${usedPrefix + command} 1 <responder a mensaje>*`

var hora1 = 3600000 * txt //1h
var dia1 = 86400000 * txt //1d
var semana1 = 604800000 * txt //1s
var mes1 = 2629800000 * txt //1m
var now = new Date() * 1
  
if (command == 'addprem' || command == 'userpremium') {
if (now < user.premiumTime) user.premiumTime += hora1
else user.premiumTime = now + hora1
user.premium = true
let textprem1 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${hora1 } hora(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`
m.reply(textprem1, null, { mentions: conn.parseMention(textprem1) })}
    
if (command == 'addprem2' || command == 'userpremium2') {
if (now < user.premiumTime) user.premiumTime += dia1
else user.premiumTime = now + dia1
user.premium = true
let textprem2 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${dia1} Día(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`
m.reply(textprem2, null, { mentions: conn.parseMention(textprem2) })}

  
if (command == 'addprem3' || command == 'userpremium3') {
if (now < user.premiumTime) user.premiumTime += semana1
else user.premiumTime = now + semana1
user.premium3 = true
let textprem3 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${semana1} Semana(s)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴 ${user.premiumTime - now} seg*`
m.reply(textprem3, null, { mentions: conn.parseMention(textprem3) })}

  
if (command == 'addprem4' || command == 'userpremium4') {
if (now < user.premiumTime) user.premiumTime += mes1
else user.premiumTime = now + mes1
user.premium = true
let textprem4 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*

*✨ 𝙽𝙾𝙼𝙱𝚁𝙴: ${name}*
*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${mes1} Mes(es)*
*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${user.premiumTime - now} seg*`
m.reply(textprem4, null, { mentions: conn.parseMention(textprem4) })}
}
handler.help = ['addprem [@user] <days>']
handler.tags = ['owner']
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'] 
handler.group = true
handler.rowner = true
export default handler
