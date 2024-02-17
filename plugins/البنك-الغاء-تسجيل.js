//import db from '../lib/database.js'

import { createHash } from 'crypto'
let handler = async function (m, { conn, args, usedPrefix}) {
  if (!args[0]) throw `*أدخل الرقم التسلسلي*\nتحقق من الرقم التسلسلي الخاص بك باستخدام الأمر ...\n\n*${usedPrefix}الغاء-تسجيل (رقمك التسلسلي)*`
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')
  if (args[0] !== sn) throw '⚠️ *Incorrect serial number*'
  user.registered = false
  m.reply(`✅ تم حذف التسجيل`)
}
handler.help = ['unreg <Num Serie>'] 
handler.tags = ['rg']

handler.command = ['الغاء-تسجيل'] 
handler.register = true

export default handler