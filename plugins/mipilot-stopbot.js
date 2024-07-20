/*import fs from "fs"


async function handler(m, {conn, usedPrefix}) {
   const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.mipilot_stopbot
  

   if (conn.user.jid == global.conn.user.jid) return m.reply(tradutor.texto1)
   m.reply(tradutor.texto2)
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler; */

let handler = async (m, { conn }) => {
if (global.conn.user.jid === conn.user.jid) {
} else {
await conn.reply(m.chat, `🍟 Bot Desactivado`, m, )
conn.ws.close()
}}

handler.help = ['stop']
handler.tags = ['jadibot']
handler.command = ['stop', 'stopbot', 'stopbebot']
handler.owner = true

export default handler
