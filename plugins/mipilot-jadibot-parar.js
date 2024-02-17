let handler  = async (m, { conn }) => {
    if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, 'لماذا لا تذهب مباشرة برقم البوت؟', m)
    else {
      await conn.reply(m.chat, 'باي باي بوت :\')', m)
      conn.ws.close()
    }
  }
  handler.help = ['berhenti','stop']
  handler.tags = ['General']
  handler.command = /^(توقف|stop)$/i
  handler.owner = true
  handler.mods = false
  handler.premium = false
  handler.group = false
  handler.private = false
  
  handler.admin = false
  handler.botAdmin = false
  
  handler.fail = null
  
  export default handler