let handler = async (m, { conn }) => {
  await conn.removeProfilePicture(conn.user.jid)
  m.reply('تم بنجاح حذف صورة البروفايل الخاص بالبوت.')
}

handler.menuowner = ['delppbot']
handler.tagsowner = ['owner']
handler.command = /^(delppbot)$/i

handler.rowner = true

export default handler
