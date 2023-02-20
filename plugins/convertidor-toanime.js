import uploadImage from '../lib/uploadImage.js'
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ""
if (!/image/g.test(mime)) throw '*[❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙾 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽*'
m.reply('*[❗] 𝙲𝙾𝙽𝚅𝙸𝙴𝚁𝚃𝙸𝙴𝙽𝙳𝙾 𝙸𝙼𝙰𝙶𝙴𝙽 𝙰 𝙳𝙸𝚂𝙴𝙽̃𝙾 𝙰𝙽𝙸𝙼𝙴, 𝚂𝙴𝙰 𝙿𝙰𝙲𝙸𝙴𝙽𝚃𝙴 𝙴𝙽 𝙻𝙾 𝚀𝚄𝙴 𝙴𝙽𝚅𝙸𝙾 𝙴𝙻 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾*')    
let data = await q.download?.()
let image = await uploadImage(data)
try {
let anime = `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${image}`
await conn.sendFile(m.chat, anime, 'error.jpg', null, m)
} catch (i) {
try {
let anime2 = `https://api.zahwazein.xyz/photoeditor/jadianime?url=${image}&apikey=${keysxxx}`
await conn.sendFile(m.chat, anime2, 'error.jpg', null, m) 
} catch (a) {    
try{    
let anime3 = `https://api.caliph.biz.id/api/animeai?img=${image}&apikey=caliphkey`
await conn.sendFile(m.chat, anime3, 'error.jpg', null, m) 
} catch (e) {
throw '*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝚅𝙴𝚁𝙸𝙵𝙸𝚀𝚄𝙴 𝚀𝚄𝙴 𝙴𝙽 𝙻𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚂𝙴𝙰 𝚅𝙸𝚂𝙸𝙱𝙻𝙴 𝙴𝙻 𝚁𝙾𝚂𝚃𝚁𝙾 𝙳𝙴 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰*'
}}}}
handler.help = ["toanime"]
handler.tags = ["tools"]
handler.command = /^(jadianime|toanime)$/i
export default handler
