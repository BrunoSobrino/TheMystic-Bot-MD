import fs from "fs"


async function handler(m, {conn, usedPrefix}) {
   const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.mipilot_stopbot
  

   if (conn.user.jid == global.conn.user.jid) return m.reply(tradutor.texto1)
   m.reply(tradutor.texto2)
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler; 