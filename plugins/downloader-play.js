import { youtubedl, youtubeSearch, youtubedlv2, youtubedlv3 } from '@bochilteam/scraper'
let handler = async (m, { conn, text, args, isPrems, isOwner, usedPrefix, command }) => {
let q, v, yt, dl_url, ttl, size, lolhuman, lolh, n, n2, n3, n4, cap, qu, currentQuality   
if (!text) throw ` *[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙻𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙼𝙰𝚂 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴/𝚃𝙸𝚃𝚄𝙻𝙾 𝙳𝙴 𝚄𝙽𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽* \n\n *—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:* \n *${usedPrefix + command} Farruko beba* \n\n\n*[❗𝐈𝐍𝐅𝐎❗]MISSING SONG NAME PLEASE ENTER COMMAND PLUS SONG NAME* \n\n *—◉ AN EXAMPLE* \n *${usedPrefix + command} Farruko beba* `
try {
await m.reply(` *_⏳ESPERA MIENTRAS LE MANDAMOS SU PEDIDO⏳* \n\n *_⏳WAIT WHILE WE SEND YOUR ORDER_⏳* `)
await m.reply(`⌛ _Cargando..._\n▰▰▰▱▱▱▱▱▱`)
var vid = (await youtubeSearch(text)).video[0]
var { title, description, thumbnail, videoId, durationH, durationS, viewH, publishedTime } = vid
var url = 'https://www.youtube.com/watch?v=' + videoId
let vide = `https://yt.btch.bz/download?URL=${url}&videoName=video`
let web = `https://yt.btch.bz/downloadAudio?URL=${url}&videoName=video`
var tmb = thumbnail
let lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=${lolkeysapi}&query=${title}`)   
let lolh = await lolhuman.json()
let n = lolh.result.title || 'error'
var captionvid = `༴⃟🌹๋ོ࣭ꦿ⁩PLAY-YouTube--⦿
----------------------------------------------------------------------------------------------------------
⇄    ◁   ㅤ  ❚❚ㅤ   ▷ㅤ    ↻
➯➤͜͡🎶📌*name:* *${title}*
➯➤📆 *Published:* *${description}*
➯➤⌚ *Duration:* *${durationH}*
➯➤👀 *Views:* *${viewH}*
➯➤🔗 *Link:* *${url}*
▢⫷᭄©𝙷𝙰𝙳𝙴𝚂-𝙱𝙾𝚃-𝙾𝙼𝙴𝙶𝙰﹏✍
----------------------------------------------------------------------------------------------------------`    
if (command == 'audio') {	
var pesan = await conn.sendMessage(m.chat, {
text: captionvid,
contextInfo: {
externalAdReply: {
title: title,
body: packname,
thumbnailUrl: tmb,
sourceUrl: web,
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}})
await conn.sendMessage(m.chat, { audio: { url: lolh.result.audio.link }, mimetype: 'audio/mpeg', contextInfo: {
externalAdReply: {
title: title,
body: "",
thumbnailUrl: tmb,
sourceUrl: web,
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })   
}
if (command == 'video') {
var pesan = await conn.sendMessage(m.chat, {
text: captionvid,
contextInfo: {
externalAdReply: {
title: title,
body: packname,
thumbnailUrl: tmb ,
sourceUrl: web,
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}})   
await conn.sendMessage(m.chat, { video: { url: lolh.result.video.link }, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `${wm}\n${title}` }, { quoted: m })
}
} catch (e) {
conn.reply(m.chat, ` *[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾* \n\n\n *[❗]ERROR PLEASE TRY AGAIN*`, m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, 
title: 'hades',
body: 'Super Bot WhatsApp',         
previewType: 0, thumbnail: fs.readFileSync("./views/Me.jpg"),
sourceUrl: `https://github.com/OFC-YOVANI/HADES-BOT-OMEGA.git`}}})
let res = await fetch("https://violetics.pw/api/media/youtube-play?apikey=beta&query="+text) 
let json = await res.json()
conn.sendFile(m.chat, json.result.url, 'error.mp4', `${wm}`, m)
}}
handler.command = ['audio', 'video']
handler.exp = 0
handler.limit = 4
handler.register = true
export default handler
async function cut(url) {
url = encodeURIComponent(url)
let res = await fetch(`https://api.botcahx.live/api/linkshort/bitly?link=${url}&apikey=${btc}`)
if (!res.ok) throw false
return await res.text()
}
async function delay(ms) {
await new Promise(resolve => setTimeout(resolve, ms))
}
