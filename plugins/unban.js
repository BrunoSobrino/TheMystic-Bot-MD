let handler = async (m) => {
    global.db.data.chats[m.chat].isBanned = false
    m.reply('Done!')
}
handler.help = ['unban']
handler.tags = ['owner']
handler.command = /^unban$/i
handler.owner = true

export default handler
