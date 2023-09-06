import fs from "fs"
async function handler(m, {usedPrefix}) {
    const user = m.sender.split("@")[0]
    if (fs.existsSync("./jadibts/" + user + "/creds.json")) {
        let token = Buffer.from(fs.readFileSync("./jadibts/" + user + "/creds.json"), "utf-8").toString("base64")
        await m.reply(`El token te permite iniciar sesion en otros bots, recomendamos no compartirlo con nadie.\n\n*Tu token es:*`)
        await m.reply(token)
    } else {
        await m.reply(`*No tienes ningun token activo, usa ${usedPrefix}jadibot para crear uno.*`)
    }
  }
  handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
  handler.tags = ['jadibot'];
  handler.private = true
  export default handler;
  