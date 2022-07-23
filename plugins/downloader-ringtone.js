import fetch from 'node-fetch'
let handler = async(m, { conn, groupMetadata, usedPrefix, text, args, command }) => {
if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙱𝚄𝚂𝙲𝙰𝚁, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} Hola*`
let vn = await fetch(`https://fatiharridho.herokuapp.com/api/search/ringtone?query=${text}`)
let x = await vn.json()
conn.sendMessage(m.chat, { audio: { url: x.result[0].audio }, mimetype: 'audio/mp4' }, {quoted: m})
}
handler.command  = ['ringtone']
export default handler
