import { youtubedl, youtubeSearch, youtubedlv2, youtubedlv3 } from '@bochilteam/scraper'  
  
  let handler = async (m, { conn, text, args, isPrems, isOwner, usedPrefix, command }) => {  
  let q, v, yt, dl_url, ttl, size, lolhuman, lolh, n, n2, n3, n4, cap, qu, currentQuality     
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙻𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙼𝙰𝚂 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴/𝚃𝙸𝚃𝚄𝙻𝙾 𝙳𝙴 𝚄𝙽𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽*\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*
*.play Good Feeling - Flo Rida*` 
 try {  
  var vid = (await youtubeSearch(text)).video[0]  
  var { title, description, thumbnail, videoId, durationH, durationS, viewH, publishedTime } = vid  
  var url = 'https://www.youtube.com/watch?v=' + videoId  
  let vide = `https://yt.btch.bz/download?URL=${url}&videoName=video`  
  let web = `https://yt.btch.bz/downloadAudio?URL=${url}&videoName=video`  
  var tmb = thumbnail  
  let lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=BrunoSobrino_2&query=${title}`)     
  let lolh = await lolhuman.json()  
  let n = lolh.result.title || 'error'  
  var captionvid = `❏ 📌 *TITULO:*  
${title}  
❏ 📋 *DESCRIPCIÓN*:
${description}  
❏ 📅 *PUBLICADO*: 
${publishedTime}  
❏ ⏱️ *DURACION*:
${durationH}  
❏ 👀 *VISTAS*: 
${viewH}
❏ 🧷 *URL*: 
${url}`    
  
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
  m.reply(`*[⏱️]EL AUDIO PUEDE TARDAR EN  ENVIARSE, HASTA 10 MINUTOS,  PORFAVOR TENGA PACIENCIA SON LAS APIS*`) 
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
  await conn.sendMessage(m.chat, { video: { url: lolh.result.video.link }, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `${wm}\nTITULO\n ${title}` }, { quoted: m })  
  }  
  } catch (e) {  
  conn.reply(m.chat, `*[❗] ERROR INTENTALO DE NUEVO.*`, m, {  
  contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, description: null,   
  title: 'The Mystic - Bot',  
  body: '..',           
  previewType: 0, thumbnail: fs.readFileSync("./Menu2.jpg"),  
  sourceUrl: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`}}})  
  
  let res = await fetch(`https://api.lolhuman.xyz/api/ytplay?apikey=GataDios&query=${title}`)   
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
