import fetch from 'node-fetch'
let handler = async(m, { conn, usedPrefix, text, args, command }) => {
if (!text) throw `Contoh:
${usedPrefix + command} 10`
let aa = await fetch(`http://www.myinstants.com/api/v1/instants/?format=json&page=${text}`)
let jsons = await aa.json()
console.log(jsons)
//conn.sendMessage(m.chat, { document: { url: n2 }, caption: cap2, mimetype: 'audio/mpeg', fileName: `${n}.mp3`}, {quoted: m})
/*let caption = '*⎔┉━「 Search 」━┉⎔*'
for (let x of jsons.results) {
caption += `
*Name :* ${x.name}
*Sound :* ${x.sound}
`}*/
}
handler.command = ['sfx', 'ringtone2', 'tono']
export default handler
