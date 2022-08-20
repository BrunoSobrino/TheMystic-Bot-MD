/* Created by https://github.com/BrunoSobrino */
       /* Diseño by Yameko-Bot V1*/

import yts from "yt-search"
let handler = async (m, { text, conn, args, command, usedPrefix }) => {
if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙻𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽 𝙵𝙰𝙻𝚃𝙰𝙽𝚃𝙴, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙼𝙰𝚂 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴/𝚃𝙸𝚃𝚄𝙻𝙾 𝙳𝙴 𝚄𝙽𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} Begin you*`    
try {
let search = await yts(args.join(" "))
let listSerch = []
let listSerch2 = []
let listSerch3 = []
let listSerch4 = []
let teskd = `𝐌𝐮𝐬𝐢𝐜𝐚 𝐫𝐞𝐥𝐚𝐜𝐢𝐨𝐧𝐚𝐝𝐚 𝐜𝐨𝐧: ${args.join(" ")}`
const sections = [{
title: `|－－－－－{ ＡＵＤＩＯ }－－－－－|`,
rows: listSerch },
{              
title: `|－－－－－{ ＶＩＤＥＯ }－－－－－|`,
rows: listSerch2 },
{              
title: `|－－{ ＤＯＣＵＭＥＮＴＯ  ＭＰ３ }－－|`,
rows: listSerch3 },
{              
title: `|－－{ ＤＯＣＵＭＥＮＴＯ  ＭＰ４ }－－|`,
rows: listSerch4 }]
const listMessage = {
text: teskd,
footer: '𝐄𝐥𝐢𝐣𝐚 𝐮𝐧𝐚 𝐨𝐩𝐜𝐢𝐨𝐧 𝐲 𝐩𝐫𝐞𝐜𝐢𝐨𝐧𝐞 𝐄𝐧𝐯𝐢𝐚𝐫',
title: " 『 𝗠𝗨𝗦𝗜𝗖𝗔 𝗥𝗘𝗟𝗔𝗖𝗜𝗢𝗡𝗔𝗗𝗔 』",
buttonText: "[♦ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 ♦]",
sections}
for (let i of search.all) {
listSerch.push({title: i.title, description: `Autor: ${i.author.name} / ${i.timestamp}`, rowId: `${usedPrefix}ytmp3 ${i.url}`})
listSerch2.push({title: i.title, description: `Autor: ${i.author.name} / ${i.timestamp}`, rowId: `${usedPrefix}ytmp4 ${i.url}`})
listSerch3.push({title: i.title, description: `Autor: ${i.author.name} / ${i.timestamp}`, rowId: `${usedPrefix}ytmp3doc ${i.url}`})
listSerch4.push({title: i.title, description: `Autor: ${i.author.name} / ${i.timestamp}`, rowId: `${usedPrefix}ytmp4doc ${i.url}`})}
conn.sendMessage(m.chat, listMessage, { quoted: m })
} catch (e) {
m.reply('*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾 𝙲𝙾𝙽 𝙾𝚃𝚁𝙾 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝙽𝙰 𝙲𝙰𝙽𝙲𝙸𝙾𝙽*')
}}
handler.command = /^playlist|playlist2$/i
export default handler
