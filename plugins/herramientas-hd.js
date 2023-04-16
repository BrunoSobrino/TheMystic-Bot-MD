import fetch from "node-fetch";
import uploadImage from "../lib/uploadImage.js";
let handler = async (m, { conn, usedPrefix, command }) => {
conn.unblur_high = conn.unblur_high ? conn.unblur_high : {}
if (m.sender in conn.unblur_high) throw "*[❗] 𝙰𝚄𝙽 𝙽𝙾 𝚂𝙴 𝙷𝙰 𝙴𝙽𝚅𝙸𝙰𝙳𝙾 𝚃𝚄 𝙿𝙴𝙳𝙸𝙳𝙾 𝙰𝙽𝚃𝙴𝚁𝙸𝙾𝚁, 𝙿𝙰𝚁𝙰 𝙽𝙾 𝚂𝙰𝚃𝚄𝚁𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙴𝚂𝙿𝙴𝚁𝙰 𝙷𝙰𝚂𝚃𝙰 𝚀𝚄𝙴 𝚂𝙴𝙰 𝙴𝙽𝚅𝙸𝙰𝙳𝙾*"
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ""
if (!mime) throw `*[❗] 𝙴𝙽𝚅𝙸𝙴 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙲𝙾𝙽 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`
if (!/image\/(jpe?g|png)/.test(mime)) throw `*[❗] 𝙴𝙻 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙳𝙴𝙻 𝙰𝚁𝙲𝙷𝙸𝚅𝙾 (${mime}) 𝙽𝙾 𝙴𝚂 𝙲𝙾𝙼𝙿𝙰𝚁𝚃𝙸𝙱𝙻𝙴, 𝙴𝙽𝚅𝙸𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽𝙰 𝙵𝙾𝚃𝙾*`
else conn.unblur_high[m.sender] = true
m.reply('*[❗] 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝙽𝙳𝙾 𝙸𝙼𝙰𝙶𝙴𝙽, 𝙴𝚂𝚃𝙾 𝙿𝚄𝙴𝙳𝙴 𝙳𝙴𝙼𝙾𝚁𝙰𝚁 𝚄𝙽𝙾𝚂 𝙼𝙸𝙽𝚄𝚃𝙾𝚂.. 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚂𝙴𝙰 𝙿𝙰𝙲𝙸𝙴𝙽𝚃𝙴*')
let img = await q.download?.()
let upld = await uploadImage(img)
let img2
try {
img2 = await fetch(`https://api.itsrose.site/image/unblur?url=${upld}&apikey=${global.itsrose}`)
let image = await img2.arrayBuffer()
conn.sendFile(m.chat, image, null, '', m)
} catch {
m.reply("*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙴 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*");
} finally {
delete conn.unblur_high[m.sender]
}}
handler.help = ["remini", "hd", "enhance"]
handler.tags = ["ai", "tools"]
handler.command = ["remini", "hd", "enhance"]
export default handler
