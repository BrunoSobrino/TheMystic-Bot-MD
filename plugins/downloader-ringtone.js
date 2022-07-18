import fetch from 'node-fetch'
let handler = async(m, { conn, groupMetadata, usedPrefix, text, args, command }) => {
if (!text) throw `Ejemplo:
${usedPrefix + command} pocoyo`
let vn = await fetch(`https://fatiharridho.herokuapp.com/api/search/ringtone?query=${text}`)
let x = await vn.json()
conn.sendMessage(m.chat, { audio: { url: x.result[0].audio }, mimetype: 'audio/mp4' }, {quoted: m})
}
handler.command  = ['ringtone']
export default handler
