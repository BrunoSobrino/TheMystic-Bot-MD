/*---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
  🍀 • https://github.com/ALBERTO9883/NyanCatBot-MD
-----------------------------------------------------------------------------------------*/

import axios from "axios"
import db from '../lib/database.js'
let handler = async (m, {command, conn}) => {
let fgif = { key: {participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "6289643739077-1613049930@g.us" } : {})},message: {"videoMessage": { "title":`️u`, "h": `Hmm`,'seconds': '99999', 'gifPlayback': 'true', 'caption': `🧿 𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝 🔮`, 'jpegThumbnail': false }}}
let apikey = keysxxx[Math.floor(Math.random() * keysxxx.length)]
let name = await conn.getName(m.sender)
if (command == 'wpmontaña') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/mountain?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'pubg') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/pubg?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wpgaming') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/gaming?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wpaesthetic') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/wallhp?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wprandom') {
let res = await axios("https://meme-api.herokuapp.com/gimme/wallpaper")
await conn.reply(m.chat, global.wait, m)
let json = res.data
let url = json.url
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈•${name}*`, url, [['Gracias💖', `/bot gracias`]], fgif)}
if (command == 'coffee') {
let haha = await conn.getFile(`https://coffee.alexflipnote.dev/random`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'pentol') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/pentol?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'caricatura') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/kartun?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'ciberespacio') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/cyberspace?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'technology') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/teknologi?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'doraemon') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/doraemon?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'hacker') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/hekel?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'planeta') {
let haha = await conn.getFile(`https://api-reysekha.herokuapp.com/api/wallpaper/tatasurya?apikey=APIKEY`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'randomprofile') {
let haha = await conn.getFile(`https://zenzapis.xyz/randomimage/profil?apikey=${apikey}`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wpaesthetic2') {
let haha = await conn.getFile(`https://zenzapis.xyz/randomimage/aesthetic?apikey=${apikey}`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wpvehiculo') {
let haha = await conn.getFile(`https://zenzapis.xyz/randomimage/mobil?apikey=${apikey}`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wallhp') {
let haha = await conn.getFile(`https://zenzapis.xyz/randomimage/wallhp?apikey=${apikey}`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
if (command == 'wpmoto') {
let haha = await conn.getFile(`https://zenzapis.xyz/randomimage/motor?apikey=${apikey}`)
await conn.reply(m.chat, global.wait, m)
conn.sendButton(m.chat, `_${command}_`.trim(), `*◈${name}*`, haha.data, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], fgif)}
}
handler.command = handler.help = ['wpmontaña', 'pubg', 'wpgaming', 'wpaesthetic', 'wprandom', 'coffee', 'pentol', 'caricatura', 'ciberespacio', 'technology', 'doraemon', 'hacker', 'planeta', 'randomprofile', 'wpaesthetic2', 'wpvehiculo', 'wallhp', 'wpmoto']
handler.tags = ['img']
handler.limit = false
handler.register = false
export default handler
global.keysxxx = ['fiktod', 'c2459db922', 'BF39D349845E', '675e34de8a', '37CC845916', '0b917b905e6f', '6fb0eff124']
