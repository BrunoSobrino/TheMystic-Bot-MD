import translate from 'translate-google-api'
import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {

if (command == 'consejo') {
let res = await fetch("https://supra-api.herokuapp.com/api/conselho?apikey=supraz")
let json = await res.json()
let { frase } = json
const tld = 'cn'
let frase1 = await translate(`${frase}`, { tld, to: 'es' })
m.reply(`*┏━━━━━━━━━━━━━━━━┓*\n*┠❧  ${frase1}*\n*┗━━━━━━━━━━━━━━━━┚*`)}

if (command == 'fraseromantica') {
let res = await fetch("https://supra-api.herokuapp.com/api/romanticafrase?apikey=supraz")
let json = await res.json()
let { frase } = json
const tld = 'cn'
let frase1 = await translate(`${frase}`, { tld, to: 'es' })
m.reply(`*╭─◆────◈⚘◈─────◆─╮*\n*❥  ${frase1}*\n*╰─◆────◈⚘◈─────◆─╯*`)}
}
handler.tags = ['frases']
handler.command = handler.help = ['consejo', 'fraseromantica']
export default handler
