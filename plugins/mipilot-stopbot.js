import fs from "fs"
import _translate from "./_translate.js"
const tradutor = _translate.plugins.mipilot_stopbot
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

async function handler(m, {conn, usedPrefix}) {
   if (conn.user.jid == global.conn.user.jid) return m.reply(tradutor.texto1)
   m.reply(tradutor.texto2)
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler; 
