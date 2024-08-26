import fs from "fs"


async function handler(m, {usedPrefix}) {
    const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.mipilot_serbotcode

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
  