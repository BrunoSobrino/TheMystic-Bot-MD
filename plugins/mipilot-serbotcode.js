import fs from "fs"
import _translate from "./_translate.js"
const tradutor = _translate.plugins.mipilot_serbotcode
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

async function handler(m, {usedPrefix}) {
    const user = m.sender.split("@")[0]
    if (fs.existsSync("./jadibts/" + user + "/creds.json")) {
        let token = Buffer.from(fs.readFileSync("./jadibts/" + user + "/creds.json"), "utf-8").toString("base64")
        await m.reply(tradutor.texto1)
        await m.reply(token)
    } else {
        await m.reply(`${tradutor.texto2[0]} ${usedPrefix}jadibot ${tradutor.texto2[1]}`)
    }
  }
  handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
  handler.tags = ['jadibot'];
  handler.private = true
  export default handler;
  