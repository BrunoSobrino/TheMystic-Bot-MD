import fetch from 'node-fetch'
let handler = async(m, { conn, usedPrefix, text, args, command }) => {
if (!text) throw `Contoh:
${usedPrefix + command} 10`
let aa = await fetch(`https://www.myinstants.com/api/v1/instants/${text}/?format=json`)
let jsons = await aa.json()
conn.sendMessage(m.chat, { audio: { url: jsons.sound }, caption: null, mimetype: 'audio/mp4', fileName: `error.mp3`}, {quoted: m})
/*let caption = '*⎔┉━「 Search 」━┉⎔*'
for (let x of jsons.results) {
caption += `
*Name :* ${x.name}
*Sound :* ${x.sound}
`}*/
}
handler.command = ['sfx', 'ringtone2', 'tono']
export default handler
