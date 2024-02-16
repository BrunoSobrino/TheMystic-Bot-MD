import uploadImage from '../lib/uploadImage.js'
let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw '*هذا الامر خاص بتحويل صورة لـــ pdf*\n*المرجو الاشارة للصورة التي تريد ان تحولها ل pdf ثم تكتب*\n.topdf\n'    
let img = await q.download?.()
let url = await uploadImage(img)    
let docname = text ? text : m.pushName || 'Bobiza'
conn.sendFile(m.chat, `http://api.lolhuman.xyz/api/convert/imgtopdf?apikey=GataDios&img=${url}`, docname + '.pdf', '', m, false, { asDocument: true })
}
handler.help = ["topdf"]
handler.tags = ["pdf"]
handler.command = /^(topdf)$/i
export default handler
