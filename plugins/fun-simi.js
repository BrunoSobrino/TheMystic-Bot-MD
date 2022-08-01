import fetch from 'node-fetch'
import translate from 'translate-google-api'
let handler = async (m, { text, usedPrefix, command }) => {
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾 𝙿𝙰𝚁𝙰 𝙷𝙰𝙱𝙻𝙰𝚁 𝙲𝙾𝙽 𝚂𝙸𝙼𝚂𝙸𝙼𝙸 𝙾 𝙴𝙻 𝙱𝙾𝚃*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} Hola bot*`
try {
let res = await fetch(`https://violetics.pw/api/utility/simsimi?apikey=beta&text=${text}`)
let json = await res.json()
let trad = json.result
const tld = 'cn'
let result = await translate(`${trad}`, { tld, to: 'es', })
m.reply(result)
} catch {
let res = await fetch(`https://violetics.pw/api/utility/simsimi?apikey=beta&text=${text}`)
let json = await res.json()
let trad = json.result
m.reply(trad)
}}
handler.help = ['simi', 'bot'].map(v => v + ' <teks>')
handler.tags = ['fun']
handler.command = /^((sim)?simi|bot|alexa|cortana)$/i
export default handler
