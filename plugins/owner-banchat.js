let handler = async (m) => {
global.db.data.chats[m.chat].isBanned = true
m.reply('*[❗] تم حظر هذه الدردشة بنجاح*\n\n*—◉ سوف يتفاعل الروبوت مع أي أمر حتى تقوم بإلغاء حظر هذه الدردشة*')
}
handler.help = ['banchat']
handler.tags = ['owner']
handler.command = /^حظر$/i
handler.rowner = true
export default handler
