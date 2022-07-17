/* Created By https://github.com/ALBERTO9883 */
import fetch from 'node-fetch'
import fs from 'fs'
let handler = async (m, {text, usedPrefix, command, conn}) => {
let sfoto = fs.readFileSync('./Menu2.jpg')
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴𝙻 𝙿𝙰𝚀𝚄𝙴𝚃𝙴 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙱𝚄𝚂𝙲𝙰𝚁*`
let json = await fetch(`https://api.zacros.my.id/search/sticker?query=${text}`)
let jsons = await json.json()
  let res = jsons.result.map((v, index) => `*🪴 • 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾:* ${1 + index}\n*🌵 • 𝙽𝙾𝙼𝙱𝚁𝙴:* ${v.title}\n*🍂 • 𝚄𝚁𝙻:* ${v.url}`).join`\n\n─────────────────────\n\n`
var doc = ['pdf','zip','vnd.openxmlformats-officedocument.presentationml.presentation','vnd.openxmlformats-officedocument.spreadsheetml.sheet','vnd.openxmlformats-officedocument.wordprocessingml.document']
var document = doc[Math.floor(Math.random() * doc.length)]    
let buttonMessage= {
'document': { url: `https://github.com/BrunoSobrino/TheMystic-Bot-MD` },
'mimetype': `application/${document}`,
'fileName': `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
'fileLength': 99999999999999,
'pageCount': 200,
'contextInfo': {
'forwardingScore': 200,
'isForwarded': true,
'externalAdReply': {
'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
'mediaType': 2,
'previewType': 'pdf',
'title': `• Resultados Encontrados🔎`,
'body': wm,
'thumbnail': sfoto,
'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
'caption': res,
'footer': `• 𝚂𝙸 𝙳𝙴𝚂𝙴𝙰 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚁 𝚄𝙽\n*𝙿𝙰𝚀𝚄𝙴𝚃𝙴 𝙳𝙴 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂*\n*𝙴𝚂𝙲𝚁𝙸𝙱𝙰 ${usedPrefix}stickerpack <URL>*`,
'buttons':[
{buttonId: `${usedPrefix}menu`, buttonText: {displayText: '𝙼𝙴𝙽𝚄'}, type: 1}],
'headerType': 6 }
conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}
handler.command = ['stickersearch', 'searchsticker', 'stickerssearch', 'searchstickers']
export default handler
