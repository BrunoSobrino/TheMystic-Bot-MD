let handler = async (m, { conn, args, groupMetadata}) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat
    if (!who) throw `*يرجى منشن الشخص!*`
    if (!(who in global.db.data.users)) throw `*المستخدم غير موجود في قاعدة البيانات*`
    let warn = global.db.data.users[who].warn
    if (warn < 5) {
        global.db.data.users[who].warn += 1
        m.reply(`⚠️ تم إضافة تحذير
        
▢ التحذير : *+1*
▢ عدد التحذيرات الحالي: *${warn + 1}*`)
    } else if (warn == 5) {
        m.reply(`*تم طرد المستخدم بسبب تجاوز عدد التحذيرات المسموح به*`)
        conn.groupRemove(m.chat, [who])
        delete global.db.data.users[who]
    }
}

handler.help = ['addwarn @user']
handler.tags = ['group']
handler.command = ['تحذير','انذار'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
