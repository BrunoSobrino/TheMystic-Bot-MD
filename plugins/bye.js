let handler = async (m, { conn, text, isROwner, isOwner }) => {
    if (text) {
    global.db.data.chats[m.chat].sBye = text
    m.reply('*وداعًا، تم إعداد الرسالة بشكل صحيح لهذه المجموعة*')
    } else throw `*أدخل رسالة الوداع التي تريد إضافتها, \nExample:*\n*- @user (mention)*\n*- لقد غادر المجموعة*`
    }
    handler.help = ['setbye <text>']
    handler.tags = ['group']
    handler.command = ['setbye'] 
    handler.admin = true
    export default handler
