import { generateWAMessageFromContent } from '@adiwajshing/baileys'
import os from 'os'
import util from 'util'
import sizeFormatter from 'human-readable'
import MessageType from '@adiwajshing/baileys'
import fs from 'fs'
import { performance } from 'perf_hooks'
let handler = async (m, { conn, usedPrefix }) => {
let _uptime = process.uptime() * 1000
let uptime = clockString(_uptime) 
let totalreg = Object.keys(global.db.data.users).length
const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
const groups = chats.filter(([id]) => id.endsWith('@g.us'))
const used = process.memoryUsage()
const { restrict, antiCall, antiprivado, modejadibot } = global.db.data.settings[conn.user.jid] || {}
const { autoread, gconly, pconly, self } = global.opts || {}
let old = performance.now()
let neww = performance.now()
let speed = neww - old
let info = `
╠═〘 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐁𝐎𝐓 〙 ═
╠
╠➥ [🤴🏻] 𝙲𝚁𝙴𝙰𝙳𝙾𝚁: *𝙱𝚛𝚞𝚗𝚘 𝚂𝚘𝚋𝚛𝚒𝚗𝚘*
╠➥ [#️⃣] 𝙽𝚄𝙼𝙴𝚁𝙾: *+52 1 999 209 5479*
╠➥ [🎳] 𝙿𝚁𝙴𝙵𝙸𝙹𝙾: *${usedPrefix}*
╠➥ [🔐] 𝙲𝙷𝙰𝚃𝚂 𝙿𝚁𝙸𝚅𝙰𝙳𝙾𝚂: *${chats.length - groups.length}*
╠➥ [🦜] 𝙲𝙷𝙰𝚃𝚂 𝙳𝙴 𝙶𝚁𝚄𝙿𝙾𝚂: *${groups.length}* 
╠➥ [💡] 𝙲𝙷𝙰𝚃𝚂 𝚃𝙾𝚃𝙰𝙻𝙴𝚂: *${chats.length}* 
╠➥ [🚀] 𝙰𝙲𝚃𝙸𝚅𝙸𝙳𝙰𝙳: *${uptime}*
╠➥ [🎩] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂: *${totalreg} 𝚗𝚞𝚖𝚎𝚛𝚘𝚜*
╠➥ [☑️] 𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙳: ${autoread ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [❗] 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃: ${restrict ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'} 
╠➥ [💬] 𝙿𝙲𝙾𝙽𝙻𝚈: ${pconly ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [🏢] 𝙶𝙲𝙾𝙽𝙻𝚈: ${gconly ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [🌎] 𝙼𝙾𝙳𝙾: ${self ? '*𝚙𝚛𝚒𝚟𝚊𝚍𝚘*' : '*𝚙𝚞𝚋𝚕𝚒𝚌𝚘*'}
╠➥ [💬] 𝙰𝙽𝚃𝙸𝙿𝚁𝙸𝚅𝙰𝙳𝙾: ${antiprivado ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [🤖] 𝙼𝙾𝙳𝙴𝙹𝙰𝙳𝙸𝙱𝙾𝚃: ${modejadibot ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [📵] 𝙰𝙽𝚃𝙸𝙻𝙻𝙰𝙼𝙰𝙳𝙰: ${antiCall ? '*𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*' : '*𝚍𝚎𝚜𝚊𝚌𝚝𝚒𝚟𝚊𝚍𝚘*'}
╠➥ [👨‍🦯] 𝚅𝙴𝙻𝙾𝙲𝙸𝙳𝙰𝙳: 
╠  *${speed} ms* 
╠
╠═〘 𝐓𝐡𝐞 𝐌𝐲𝐬𝐭𝐢𝐜 - 𝐁𝐨𝐭 〙 ═
`.trim() 
let aa = { quoted: m, userJid: conn.user.jid }
let res = generateWAMessageFromContent (m.chat, {liveLocationMessage: {degreesLatitude: 0, degreesLongitude: 0, caption: info, secuenceNumber: "0", contextInfo: {mentionedJid: conn.parseMention()}}}, aa)
conn.relayMessage(m.chat, res.message, {})
}
handler.help = ['infobot', 'speed']
handler.tags = ['info', 'tools']
handler.command = /^(ping|speed|infobot)$/i
export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
console.log({ms,h,m,s})
return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')}
