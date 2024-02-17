let handler = async (m, {conn, usedPrefix}) => {
	
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let user = global.db.data.users[who]
    if (!(who in global.db.data.users)) throw `✳️ المستخدم غير موجود في قاعده بيناتي`
    conn.reply(m.chat, `
*┌●━──━𓊆البنك𓊇━──━●*
*╎𝑁▣「📌الاسم」:* _@${who.split('@')[0]}_
*╎𝑁▣「💎الماس」:* _${user.diamond}_
*╎𝑁▣「👨🏻‍💼الرتبة」:* _${user.role}_
*╎𝑁▣「🍷الجرعات」:* : _${user.potion}_
*╎𝑁▣「🪙حديد」:* _${user.iron}_
*╎𝑁▣「💵المال」:* _${user.money}_
*╎𝑁▣خبرة🎊」*: _الإجمالي」
${user.exp}_
*└●━──𓊆⍣⃝𝑁𝐴𝑇𝑺𝑈𓊇──━●*
`, m, { mentions: [who] })
}
handler.help = ['balance']
handler.tags = ['econ']
handler.command = ['bal', 'البنك', 'diamond', 'balance'] 

export default handler