//import db from '../lib/database.js'

let handler = async (m, { conn, text }) => {
  let who
  if (m.isGroup) who = m.mentionedJid[0]
  else who = m.chat
  if (!who) throw '✳️ Tag the user'
  let txt = text.replace('@' + who.split`@`[0], '').trim()
  if (!txt) throw '✳️ Enter the amount of *XP* you want to add'
  if (isNaN(txt)) throw ' 🔢 only numbers'
  let xp = parseInt(txt)
  let exp = xp
  
  if (exp < 1) throw '*「العدد الاخير 1」*'
  let users = global.db.data.users
  users[who].exp += xp

  await m.reply(`≡ *「اكس بي」*
*┌●━──━𓊆اكس بي𓊇━──━●*
*╎𖣐➽ المجموع:* ${xp}
*└●━──𓊆⍣⃝𝑁𝐴𝑇𝑺𝑈𓊇──━●*`)
 conn.fakeReply(m.chat, `▢ هل استقبلت \n\n *+${xp} خبرة*`, who, m.text)
}

handler.help = ['addxp <@user>']
handler.tags = ['econ']
handler.command = ['ضيف_اكس_بي'] 
handler.rowner = true

export default handler