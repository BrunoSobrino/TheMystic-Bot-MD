import fs from "fs"
async function handler(m, {conn, usedPrefix}) {
    if (conn.user.jid == global.conn.user.jid) return m.reply(`*No puedes apagar el bot principal.*`)
    conn.fstop = true
    m.reply(`*El bot se apagara en 5 segundos...*`)
    conn.ws.close()
  }
  handler.command = handler.help = ['stop', 'byebot'];
  handler.tags = ['jadibot'];
  handler.owner = true
  export default handler;
  