import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} luisitocomunica*`
await m.reply(global.wait)
const res2 = await igstory(args[0])
console.log(res2)
//let res3 = await axios.head(res2.url)
//let mime = res3.headers['content-type']
//if (/image/.test(mime)) await conn.sendFile(m.chat, res2.url, 'error.jpg', null, m)
//if (/video/.test(mime)) await conn.sendFile(m.chat, res2.url, 'error.mp4', null, m)
//} catch {
//throw `*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*`
}//}}
handler.help = ['instagramstory'].map(v => v + ' <username>')
handler.tags = ['downloader']
handler.command = /^((igs|instagrams)(tory)?(dl)?(downloa?d(er)?)?)$/i
export default handler

/*import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} luisitocomunica*`
await m.reply(global.wait)
try {
const res = await fetch(`https://api.lolhuman.xyz/api/igstory/${args[0]}?apikey=${lolkeysapi}`)
var anu = await res.json()
var anuku = anu.result
for (var i of anuku) {
let res = await axios.head(i)
let mime = res.headers['content-type']
if (/image/.test(mime)) await conn.sendFile(m.chat, i, 'error.jpg', null, m)
if (/video/.test(mime)) await conn.sendFile(m.chat, i, 'error.mp4', null, m)}
} catch {
try {
const res2 = await igstory(args[0])
let res3 = await axios.head(url)
let mime = res3.headers['content-type']
//for ( const { downloadUrl, url, preview, type, fileType } of res2 )
if (/image/.test(mime)) await conn.sendFile(m.chat, res2.url, 'error.jpg', null, m)
if (/video/.test(mime)) await conn.sendFile(m.chat, res2.url, 'error.mp4', null, m)
//conn.sendMedia(m.chat, url, null, { mentions: [m.sender], jpegThumbnail: await(await fetch(preview)).buffer(), caption: `🚀 *Link:* ${await(await axios.get(`https://tinyurl.com/api-create.php?url=${url}`)).data}`})
} catch {
throw `*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*`
}}}
handler.help = ['instagramstory'].map(v => v + ' <username>')
handler.tags = ['downloader']
handler.command = /^((igs|instagrams)(tory)?(dl)?(downloa?d(er)?)?)$/i
export default handler*/

async function igstory(username) {
  username = username.replace(/https:\/\/instagram.com\//g, '')
  let { data } = await axios.get(`https://www.instadownloader.org/data.php?username=${username}&t=${new Date * 1}`)
  const $ = cheerio.load(data)
  let results = []
  $('body > center').each(function (i, el) {
    results.push({
      url: $(el).find('a.download-btn').attr('href'),
      type: $(el).find('video').html() ? 'video' : 'image'
    })
  })
  return results
}

/*let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} luisitocomunica*`
await m.reply(global.wait)    
const res = await fetch(`https://api.lolhuman.xyz/api/igstory/${args[0]}?apikey=${lolkeysapi}`)
var anu = await res.json()
var anuku = anu.result
if (anuku == '') return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*')  
for (var i of anuku) {
let res = await axios.head(i)
let mime = res.headers['content-type']
if (/image/.test(mime)) await conn.sendFile(m.chat, i, 'error.jpg', null, m).catch(() => { return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*')})
if (/video/.test(mime)) await conn.sendFile(m.chat, i, 'error.mp4', null, m).catch(() => { return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*')})
}}
handler.help = ['igstory <username>']
handler.tags = ['downloader']
handler.command = ['igstory', 'ighistoria' ]
export default handler*/
