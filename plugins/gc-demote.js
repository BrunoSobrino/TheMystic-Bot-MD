let handler = async (m, { conn,usedPrefix, text }) => {
if(isNaN(text) && !text.match(/@/g)){
	
}else if(isNaN(text)) {
var number = text.split`@`[1]
}else if(!isNaN(text)) {
var number = text
}
	
if(!text && !m.quoted) return conn.reply(m.chat, `*[❗] الاستخدام المناسب*\n\n*┯┷*\n*┠≽ ${usedPrefix}تخفيض @منشن*\n*┠≽ ${usedPrefix}تخفيض -> الرد على رسالة*\n*┷┯*`, m)
if(number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, `*[ ⚠️ ] الرقم الذي تم إدخاله غير صحيح ، الرجاء إدخال الرقم الصحيح*`, m)
  
try {
if(text) {
var user = number + '@s.whatsapp.net'
} else if(m.quoted.sender) {
var user = m.quoted.sender
} else if(m.mentionedJid) {
var user = number + '@s.whatsapp.net'
} 
} catch (e) {
} finally {
conn.groupParticipantsUpdate(m.chat, [user], 'demote')
conn.reply(m.chat, `*[ ✅ ] تم تنزيله من الاشراف*`, m)
}}
handler.help = ['*201554824764xxx*','*@اسم المستخدم*','*محادثة المستجيب*'].map(v => 'demote ' + v)
handler.tags = ['group']
handler.command = /^(خفض|إزالة المشرف|ازالة المشرف|تخفيض|تنزيل)$/i
handler.group = true
handler.owner = true
handler.botAdmin = true
handler.fail = null
export default handler
