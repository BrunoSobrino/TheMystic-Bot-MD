import axios from 'axios'
let handler = async(m, { conn, usedPrefix, command }) => {
let Cristiano = (await axios.get(`https://raw.githubusercontent.com/FG98F/team-fg/main/nsfw/xvid.json`)).data  
/*let res = await axios("https://meme-api.herokuapp.com/gimme/Cristianoronaldo")
let json = res.data
let url = json.url*/
let Ronaldo = Cristiano[Math.floor(Cristiano.length * Math.random())]
conn.sendButton(m.chat, "*Siiiuuuuuu*", author, Ronaldo, [['⚽ SIGUIENTE ⚽', `${usedPrefix + command}`]], m)}
handler.help = ['cristianoronaldo']
handler.tags = ['internet']
handler.command = /^(cristianoronaldo)$/i
export default handler
