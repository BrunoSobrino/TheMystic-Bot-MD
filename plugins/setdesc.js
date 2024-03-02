var handler = async (m, { conn, text, isROwner, isOwner }) => {

if (text) {
await conn.groupUpdateDescription(m.chat, text)
conn.reply(m.chat, `✅ *تم تحديث الوصف بنجاح*`, m,  )
} else return conn.reply(m.chat, ' *أدخل وصفًا جديدًا للمجموعة*\n\n*.setdesc* مرحبا بك في المجموعة يا صديقي', m, )

}
handler.help = ['setdesc']
handler.tags = ['owner']
handler.command = /^setdesc$/i

handler.botAdmin = true
handler.group = true
handler.admin = true

export default handler
