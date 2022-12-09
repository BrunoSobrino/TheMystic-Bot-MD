import translate from '@vitalets/google-translate-api'
import { Anime } from "@shineiichijo/marika"
const client = new Anime();
let handler = async(m, { conn, text, usedPrefix }) => {
if (!text) return m.reply(`[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴𝙻 𝙰𝙻𝙶𝚄𝙽 𝙰𝙽𝙸𝙼𝙴 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙱𝚄𝚂𝙲𝙰𝚁*`)
let anime = await client.searchAnime(text)
let result = anime.data[0];
let AnimeInfo = `*ANIME SEARCH*

🎀 • *Title:* ${result.title}
🎋 • *Format:* ${result.type}
📈 • *Status:* ${result.status.toUpperCase().replace(/\_/g, " ")}
🍥 • *Total episodes:* ${result.episodes}
🎈 • *Duration: ${result.duration}*
✨ • *Based On:* ${result.source.toUpperCase()}
💫 • *Premiered:* ${result.aired.from}
🎗 • *Ended On:* ${result.aired.to}
🎐 • *Popularity:* ${result.popularity}
🎏 • *Favorites:* ${result.favorites}
🎇 • *Rating:* ${result.rating}
🏅 • *Rank:* ${result.rank}
♦ • *Trailer:* ${result.trailer.url}
🌐 • *URL:* ${result.url}
🎆 • *Background:* ${result.background}
❄ • *Ringkasan:* ${result.synopsis}`
conn.sendFile(m.chat, result.images.jpg.image_url, 'error.jpg', AnimeInfo, m)
}
handler.command = /^(anime|animeinfo)$/i
export default handler 









/*import fetch from 'node-fetch'
import cheerio from 'cheerio'
let handler = async (m, { conn, text }) => {
if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴𝙻 𝙰𝙻𝙶𝚄𝙽 𝙰𝙽𝙸𝙼𝙴 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙱𝚄𝚂𝙲𝙰𝚁*`
try {
let res = await fetch(global.API('https://api.jikan.moe', '/v4/search/anime', { q: text }))
if (!res.ok) throw await res.text()
let json = await res.json()
let { title, members, synopsis, episodes, url, rated, score, image_url, type, start_date, end_date, mal_id } = json.results[0]
let res2 = await fetch(`https://myanimelist.net/anime/${mal_id}`)
if (!res2.ok) throw await res2.text()
let html = await res2.text()
const tld = 'cn'
let resultes = await translate(`${synopsis}`, { to: 'es', autoCorrect: true })
let animeingfo = `✨ *Titulo:* ${title}
🎆 *Episodios:* ${episodes}
💬 *Transmitido en:* ${type}
💌 *Rating:* ${rated}
❤️ *Score:* ${score}
👥 *Miembros:* ${members}
💚 *Sinopsis:* ${resultes.text}
🌐 *URL*: ${url}`
conn.sendFile(m.chat, image_url, '', animeingfo, m)
} catch {    
let res = await fetch(global.API('https://api.jikan.moe', '/v4/search/anime', { q: text }))
if (!res.ok) throw await res.text()
let json = await res.json()
let { title, members, synopsis, episodes, url, rated, score, image_url, type, start_date, end_date, mal_id } = json.results[0]
let res2 = await fetch(`https://myanimelist.net/anime/${mal_id}`)
if (!res2.ok) throw await res2.text()
let html = await res2.text()
let animeingfo = `✨ *Titulo:* ${title}
🎆 *Episodios:* ${episodes}
💬 *Transmitido en:* ${type}
💌 *Rating:* ${rated}
❤️ *Score:* ${score}
👥 *Miembros:* ${members}
💚 *Sinopsis:* ${synopsis}
🌐 *URL*: ${url}`
conn.sendFile(m.chat, image_url, '', animeingfo, m)
}}
handler.help = ['animeinfo <anime>']
handler.tags = ['internet']
handler.command = /^(animeinfo)$/i
export default handler*/
