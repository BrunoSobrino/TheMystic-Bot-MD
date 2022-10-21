/*---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
-----------------------------------------------------------------------------------------*/

import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {
try {    
    
if (command == 'consejo') {
let res = await fetch("https://zenzapis.xyz/randomtext/motivasi?apikey=hdiiofficial")
//let res = await fetch("https://supra-api.herokuapp.com/api/conselho?apikey=supraz")
let json = await res.json()
let frase = json.result.message
let frase1 = await translate(frase, { to: 'es', autoCorrect: true })
await m.reply(`*┏━━━━━━━━━━━━━━━━┓*\n*┠❧  ${frase1.text}*\n*┗━━━━━━━━━━━━━━━━┚*`)}

if (command == 'fraseromantica') {
let res = await fetch("https://supra-api.herokuapp.com/api/romanticafrase?apikey=supraz")
let json = await res.json()
let { frase } = json
let frase1 = await translate(frase, { to: 'es', autoCorrect: true }).catch(_ => null)
m.reply(`*╭─◆────◈⚘◈─────◆─╮*\n*❥  ${frase1.text}*\n*╰─◆────◈⚘◈─────◆─╯*`)}

if (command == 'historiaromantica') {
let res = await fetch("https://api-xcoders.site/api/random/cerpen/cinta?apikey=xcoders")
let json = await res.json()
let { story, title, author_name } = json.result
let storytime = await translate(story, { to: 'es', autoCorrect: true }).catch(_ => null)
let titletime = await translate(title, { to: 'es', autoCorrect: true }).catch(_ => null)
conn.reply(m.chat, `᭥🫐᭢ Título: ${titletime.text}
᭥🍃᭢ Autor: ${author_name}
────────────────
${storytime.text}`, m)}
    
} catch {    
await m.reply(`*[❗] 𝙾𝙲𝚄𝚁𝚁𝙸𝙾 𝚄𝙽 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚂𝙸𝙱𝙻𝙴𝙼𝙴𝙽𝚃𝙴 𝙻𝙰 𝙿𝙰𝙶𝙸𝙽𝙰 (𝙰𝙿𝙸) 𝙳𝙴 𝙰𝚈𝚄𝙳𝙰 𝙴𝚂𝚃𝙴 𝙲𝙰𝙸𝙳𝙰 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝙻𝙼𝙴𝙽𝚃𝙴, 𝙸𝙽𝚃𝙴𝙽𝚃𝙴𝙻𝙾 𝙼𝙰𝚂 𝚃𝙰𝚁𝙳𝙴*`)    
}}
handler.tags = ['frases']
handler.command = handler.help = ['consejo', 'fraseromantica', 'historiaromantica']
export default handler
