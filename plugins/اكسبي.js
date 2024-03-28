//import db from '../lib/database.js'

let handler = async (m, { conn, text }) => {
  let who
  if (m.isGroup) who = m.mentionedJid[0]
  else who = m.chat
  if (!who) throw '✳️ منشن المستخدم'
  let txt = text.replace('@' + who.split`@`[0], '').trim()
  if (!txt) throw '✳️ ضيف المبلغ الي عايز تحوله'
  if (isNaN(txt)) throw ' 🔢 ارقام اوعي تحط رموز يا حب'
  let xp = parseInt(txt)
  let exp = xp

  if (exp < 1) throw '✳️ الحد الأدنى  *1*'
  let users = global.db.data.users
  users[who].exp += xp

  await m.reply(`≡ *اضافه اكسبي*
┌──────────────
▢  *إجمالي:* ${xp}
└──────────────`)
 conn.fakeReply(m.chat, `▢ لقد حصلت علي \n\n *+${xp} اكسبي*`, who, m.text)
}

handler.help = ['addxp <@user>']
handler.tags = ['econ']
handler.command = ['ضيف_اكس_بي'] 
handler.rowner = true

export default handler
