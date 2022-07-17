import axiostal from "axios"
import fetch from 'node-fetch'
let handler = async(m, { conn, text, xteamkey }) => {
if (!text) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝙴𝙽𝙻𝙰𝙲𝙴 / 𝚄𝚁𝙻 𝙴𝙻 𝙲𝚄𝙰𝙻 𝙳𝙴𝚂𝙴𝙰 𝙰𝙲𝙾𝚁𝚃𝙰𝚁*'
let json = await (await fetch(`https://api.xteam.xyz/shorturl/tinyurl?url=${text}&apikey=cb15ed422c71a2fb`)).json()
if (!json.status) throw json
let hasil = `*𝙻𝙸𝙽𝙺 𝙰𝙲𝙾𝚁𝚃𝙰𝙳𝙾 𝙲𝙾𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴!!*\n\n*𝙻𝙸𝙽𝙺 𝙰𝙽𝚃𝙴𝚁𝙸𝙾𝚁:*\n${text}\n*𝙻𝙸𝙽𝙺 𝙰𝙲𝙾𝚁𝚃𝙰𝙳𝙾:*\n*${json.result}*`.trim()   
m.reply(hasil)
}
handler.help = ['tinyurl','acortar'].map(v => v + ' <link>')
handler.tags = ['tools']
handler.command = /^(tinyurl|short|acortar|corto)$/i
handler.fail = null
export default handler
