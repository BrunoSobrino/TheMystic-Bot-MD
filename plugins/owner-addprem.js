let handler = async (m, { conn, text, usedPrefix, command }) => {
  let who
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  else who = m.chat
  let textpremERROR = `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 @𝚝𝚊𝚐 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝙰𝙻𝙶𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁 𝙰 𝙻𝙾𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ ${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*◉ ${usedPrefix + command} 1 <responder a mensaje>*`    
  if (!who || !m.quoted) return m.reply(textpremERROR, null, { mentions: conn.parseMention(textpremERROR) })

  let user = global.db.data.users[who] 
  let txt = text.replace('@' + who.split`@`[0], '').trim()
  let name = await conn.getName(who)

  var hora1 = 60 * 60 * 1000 * txt // 1 hora
  var dia1 = 24 * hora1 * txt // 1 día
  var semana1 = 7 * dia1 * txt // 1 semana
  var mes1 = 30 * dia1 * txt // 1 mes
  var now = Date.now()

  if (command == 'addprem' || command == 'userpremium') {
    if (now < user.premiumTime) user.premiumTime += hora1
    else user.premiumTime = now + hora1
    user.premium = true
    let timeLeft = (user.premiumTime - now) / 1000 // tiempo restante en segundos
    let textprem1 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\nTiempo: ${txt} hora(s)\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeLeft} segundos*`
    m.reply(textprem1, null, { mentions: conn.parseMention(textprem1) })}
    
  if (command == 'addprem2' || command == 'userpremium2') {
    if (now < user.premiumTime) user.premiumTime += dia1
    else user.premiumTime = now + dia1
    user.premium = true
    let timeLeft = (user.premiumTime - now) / 1000 / 60 / 60 // tiempo restante en horas
    let textprem2 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} día(s)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeLeft} horas*`
    m.reply(textprem2, null, { mentions: conn.parseMention(textprem2) })}
  
  if (command == 'addprem3' || command == 'userpremium3') {
    if (now < user.premiumTime) user.premiumTime += semana1
    else user.premiumTime = now + semana1
    user.premium3 = true
    let textprem3 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} semana(s)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${getDurationInWeeks(user.premiumTime - now)}*`
    m.reply(textprem3, null, { mentions: conn.parseMention(textprem3) })}
  
  if (command == 'addprem4' || command == 'userpremium4') {
    if (now < user.premiumTime) user.premiumTime += mes1
    else user.premiumTime = now + mes1
    user.premium = true
    let textprem4 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} mes(es)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${getDurationInMonths(user.premiumTime - now)}*`
    m.reply(textprem4, null, { mentions: conn.parseMention(textprem4) })}
  }
}
handler.help = ['addprem [@user] <days>']
handler.tags = ['owner']
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'] 
handler.group = true
handler.rowner = true
export default handler

async function getDurationInWeeks(durationInMs) {
  const weeks = Math.floor(durationInMs / (7 * 24 * 60 * 60 * 1000));
  const days = Math.floor((durationInMs % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  return `${weeks} semana(s) y ${days} día(s)`;
}

async function getDurationInMonths(durationInMs) {
  const months = Math.floor(durationInMs / (30 * 24 * 60 * 60 * 1000));
  const days = Math.floor((durationInMs % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  return `${months} mes(es) y ${days} día(s)`;
}


/*let handler = async (m, { conn, text, usedPrefix, command }) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
else who = m.chat
let textpremERROR = `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 @𝚝𝚊𝚐 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝙰𝙻𝙶𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁 𝙰 𝙻𝙾𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ ${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*◉ ${usedPrefix + command} 1 <responder a mensaje>*`    
if (!who || !m.quoted) return m.reply(textpremERROR, null, { mentions: conn.parseMention(textpremERROR) })
let user = global.db.data.users[who]
let txt = text.replace('@' + who.split`@`[0], '').trim()
let name = await '@' + who.split`@`[0]

var now = new Date()
var hora1 = 3600000 * parseInt(txt) // 1h
var dia1 = 86400000 * parseInt(txt) // 1d
var semana1 = 604800000 * parseInt(txt) // 1s
var mes1 = 2629800000 * parseInt(txt) // 1m

  
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
export default handler*/
