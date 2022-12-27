import fetch from 'node-fetch'
let handler = async(m, { conn, usedPrefix, text, args, command }) => {
if (!text) throw `Contoh:
${usedPrefix + command} 10`
let json = await fetch(`http://www.myinstants.com/api/v1/instants/?format=json&page=${text}`)
let jsons = await json.json()
let caption = '*⎔┉━「 Search 」━┉⎔*'
for (let x of jsons.results) {
caption += `
*Name :* ${x.name}
*Sound :* ${x.sound}
`}
return m.reply(caption)
}
handler.command = ['sfx', 'ringtone2', 'tono']
export default handler
