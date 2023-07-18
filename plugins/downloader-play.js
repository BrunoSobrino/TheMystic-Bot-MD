import { youtubedl, youtubeSearch, youtubedlv2, youtubedlv3 } from '@bochilteam/scraper'

let handler = async (m, { conn, text, args, isPrems, isOwner, usedPrefix, command }) => {
let q, v, yt, dl_url, ttl, size, lolhuman, lolh, n, n2, n3, n4, cap, qu, currentQuality   
if (!text) throw `${lenguajeGB['smsAvisoMG']()}𝙀𝙎𝘾𝙍𝙄𝘽𝘼 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀 𝙊 𝙏𝙄𝙏𝙐𝙇𝙊\n𝙀𝙅𝙀𝙈𝙋𝙇𝙊\n*${usedPrefix + command} Billie Eilish - Bellyache*\n\n𝙒𝙍𝙄𝙏𝙀 𝙏𝙃𝙀 𝙉𝘼𝙈𝙀 𝙊𝙍 𝙏𝙄𝙏𝙇𝙀\n𝙀𝙓𝘼𝙈𝙋𝙇𝙀\n*${usedPrefix + command} Billie Eilish - Bellyache*`
try {
var vid = (await youtubeSearch(text)).video[0]
var { title, description, thumbnail, videoId, durationH, durationS, viewH, publishedTime } = vid
var url = 'https://www.youtube.com/watch?v=' + videoId
let vide = `https://yt.btch.bz/download?URL=${url}&videoName=video`
let web = `https://yt.btch.bz/downloadAudio?URL=${url}&videoName=video`
var tmb = thumbnail
let lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=${lolkeysapi}&query=${title}`)   
let lolh = await lolhuman.json()
let n = lolh.result.title || 'error'
var captionvid = `*𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*

ও 𝙏𝙄𝙏𝙐𝙇𝙊 | 𝙏𝙄𝙏𝙇𝙀
» ${title}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝘾𝙄𝙊𝙉 | 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉
» ${description}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও 𝙋𝙐𝘽𝙇𝙄𝘾𝘼𝘿𝙊 | 𝙋𝙐𝘽𝙇𝙄𝙎𝙃𝙀𝘿
» ${publishedTime}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও 𝘿𝙐𝙍𝘼𝘾𝙄𝙊𝙉 | 𝘿𝙐𝙍𝘼𝙏𝙄𝙊𝙉
» ${durationH}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও 𝙑𝙄𝙎𝙏𝘼𝙎 | 𝙑𝙄𝙀𝙒𝙎
» ${viewH}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও 𝙐𝙍𝙇
» ${url}

*𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*`  
   
if (command == 'play') {	
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
}}} , { quoted: m })
   
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
if (command == 'play2') {
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
}}} , { quoted: m })
await conn.sendMessage(m.chat, { video: { url: lolh.result.video.link }, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `╭━❰  ${wm}  ❱━⬣\n┃ 💜 𝙏𝙄𝙏𝙐𝙇𝙊 | 𝙏𝙄𝙏𝙇𝙀\n┃ ${title}\n╰━━━━━❰ *𓃠 ${vs}* ❱━━━━⬣` }, { quoted: m })
}
} catch (e) {
conn.reply(m.chat, `*ERROR/FALLO SE INTENTADA DESCARGA SUS VIDEO POR EL OTRO SERVER, AGUARDE UN MOMENTO POR FAVOR*`, m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, 
title: '𝙂𝙖𝙩𝙖𝘽𝙤𝙩-𝙈𝘿 | 𝙂𝙖𝙩𝙖 𝘿𝙞𝙤𝙨',
body: 'Super Bot WhatsApp',         
previewType: 0, thumbnail: fs.readFileSync("./media/menus/Menu3.jpg"),
sourceUrl: `https://github.com/GataNina-Li/GataBot-MD`}}})
  
let res = await fetch("https://violetics.pw/api/media/youtube-play?apikey=beta&query="+text) 
let json = await res.json()
conn.sendFile(m.chat, json.result.url, 'error.mp4', `${wm}`, m)
}}
handler.command = ['play', 'play2']
handler.exp = 0
handler.limit = 1
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
