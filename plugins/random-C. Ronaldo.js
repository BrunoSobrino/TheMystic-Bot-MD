import axios from 'axios'
let handler = async(m, { conn, usedPrefix, command }) => {
let Cristiano = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/CristianoRonaldo.json`)).data  
let Ronaldo = await Cristiano[Math.floor(Cristiano.length * Math.random())]
conn.sendButton(m.chat, "*Siiiuuuuuu*", author, Ronaldo, [['⚽ SIGUIENTE ⚽', `${usedPrefix + command}`]], m)}
handler.help = ['cristianoronaldo']
handler.tags = ['internet']
handler.command = /^(cristianoronaldo)$/i
export default handler
