//import db from '../lib/database.js'

import { createHash } from 'crypto'
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  let name2 = conn.getName(m.sender)
  if (user.registered === true) throw `لقد قمت بالتسجيل بالفعل\n\nهل تريد إعادة التسجيل؟\n\n 📌 استخدم هذا الأمر لإزالة السجل الخاص بك\n*${usedPrefix}الغاء-تسجيل* <الرقم التسلسلي>`
  if (!Reg.test(text)) throw `⚠️ التنسيق غير صحيح\n\nاستخدم هذا الأمر: *${usedPrefix + command} الاسم.16*\n📌مثال: *${usedPrefix + command}* ${name2}𝑁𝐴𝑇𝑺𝑈.16`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw '*「لا يمكن أن يكون الاسم فارغًا🍷❗」*'
  if (!age) throw '*「لا يمكن أن يكون العمر فارغًا🍷❗」*'
  if (name.length >= 45) throw '*「اسم طويل جدا🍷❗」*' 
  age = parseInt(age)
  if (age > 100) throw '「👴🏻واو الجد يريد أن يلعب دور الروبوت🍷❗」'
  if (age < 5) throw '*「هناك  طفل يريد ان يلعب في البوت 🍷❗」*'
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  let sn = createHash('md5').update(m.sender).digest('hex')
  m.reply(`
*┌●━──━𓊆تسجيل𓊇━──━●*
*╎𖣐➽「الاسم👨‍💻」:* ${name}
*╎𖣐➽「العمر👨🏻‍💼」:* ${age}
*╎𖣐➽「رقمك السري❗」:* ${sn}
*└●━──𓊆⍣⃝𝑁𝐴𝑇𝑺𝑈𓊇──━●*

 *${usedPrefix}مساعدة* لرؤية القائمة
`.trim())
}
handler.help = ['reg'].map(v => v + ' <name.age>')
handler.tags = ['rg']

handler.command = ['تسجيل', 'reg', 'ريج', 'سجلني'] 

export default handler