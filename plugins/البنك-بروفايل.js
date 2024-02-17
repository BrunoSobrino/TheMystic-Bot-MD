import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import { canLevelUp, xpRange } from '../lib/levelling.js'
//import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix, command}) => {

let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
if (!(who in global.db.data.users)) throw `✳️ المستخدم غير موجود في قاعده بيناتي`
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './𝑁𝐴𝑇𝑺𝑈.jpg')
let user = global.db.data.users[who]
let { name, exp, diamond, lastclaim, registered, regTime, age, level, role, warn } = global.db.data.users[who]
let { min, xp, max } = xpRange(user.level, global.multiplier)
let username = conn.getName(who)
let math = max - xp
let prem = global.prems.includes(who.split`@`[0])
let sn = createHash('md5').update(who).digest('hex')

let str = `*❖ ── ✦ ──『𝑁𝐴𝑇𝑺𝑈』── ✦ ── ❖*
*⤶❏ الاسم 👤:* ${username} ${registered ? '\n   • ' + name + ' ': ''}   
*⤶❏ المنشن 📧 : @${who.replace(/@.+/, '')}*
*⤶❏ الرقم ☎️ : ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}*
*⤶❏ الرابط 🖇️ : wa.me/${who.split`@`[0]}${registered ? '\n⤶❏ *🎈العمر*: ' + age + ' *years' : ''}*
*⤶❏ الجواهر 💎 : ${diamond}*
*⤶❏ المستوى 📊 : ${level}*
*⤶❏ الاكس بي 📈* : المجموع ${exp} (${user.exp - min} / ${xp})\n${math <= 0 ? `*${usedPrefix}levelup*` : `فاضل لك *${math}اكس بي للصعود الى لفل اخر*`}
*⤶❏ التصنيف 🧮 : ${role}*
*⤶❏ التسجيل 📄 : ${registered ? 'يب': 'لا'}*
*⤶❏ بريميام 🌩️ : ${prem ? 'يب' : 'لا'}*
*❖ ── ✦ ──『𝑁𝐴𝑇𝑺𝑈』── ✦ ── ❖*`
    conn.sendFile(m.chat, pp, 'perfil.jpg', str, m, false, { mentions: [who] })


}
handler.help = ['perfil']
handler.tags = ['group']
handler.command = ['profile', 'بروفايل'] 

export default handler
