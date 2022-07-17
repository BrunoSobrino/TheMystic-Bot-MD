import axios from "axios"
let handler = async (m, {command, conn}) => {
let res = await axios(pickRandom(meme))
let json = res.data
let url = json.url
conn.sendButton(m.chat, `_${command}_`.trim(), author, url, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)
}
handler.help = ['meme']
handler.tags = ['random']
handler.command = /^(meme)$/i
export default handler

function pickRandom(list) {
return list[Math.floor(list.length * Math.random())]}

const meme = [
"https://meme-api.herokuapp.com/gimme/memesmexico",
"https://meme-api.herokuapp.com/gimme/mememexico",
"https://meme-api.herokuapp.com/gimme/memeslatam",
"https://meme-api.herokuapp.com/gimme/memeslatinoamerica",
"https://meme-api.herokuapp.com/gimme/latammemes",
"https://meme-api.herokuapp.com/gimme/memeslatinoamerica",
"https://meme-api.herokuapp.com/gimme/latammemes",
"https://meme-api.herokuapp.com/gimme/memesmexico",
"https://meme-api.herokuapp.com/gimme/mememexico",
"https://meme-api.herokuapp.com/gimme/memeslatam",
"https://meme-api.herokuapp.com/gimme/memesmexico",
"https://meme-api.herokuapp.com/gimme/mememexico",
"https://meme-api.herokuapp.com/gimme/memeslatam",
"https://meme-api.herokuapp.com/gimme/memeslatinoamerica",
"https://meme-api.herokuapp.com/gimme/latammemes",
"https://meme-api.herokuapp.com/gimme/memeslatinoamerica",
"https://meme-api.herokuapp.com/gimme/latammemes",
"https://meme-api.herokuapp.com/gimme/memesmexico",
"https://meme-api.herokuapp.com/gimme/mememexico",
"https://meme-api.herokuapp.com/gimme/memeslatam"
]
