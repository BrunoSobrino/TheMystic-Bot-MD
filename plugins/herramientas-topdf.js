import uploadImage from '../lib/uploadImage.js'
let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw '*[❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 / 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽*'    
let img = await q.download?.()
let url = await uploadImage(img)    
let docname = text ? text : m.pushName || 'documento'
conn.sendFile(m.chat, `http://api.lolhuman.xyz/api/convert/imgtopdf?apikey=${lolkeysapi}&img=${url}`, docname + '.pdf', '', m, false, { asDocument: true })
}
handler.command = /^topdf$/i
export default handler
