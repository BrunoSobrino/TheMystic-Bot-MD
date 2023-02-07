import fetch from 'node-fetch'
let handler = m => m

handler.before = async (m) => {
let chat = global.db.data.chats[m.chat]
if (chat.simi) {
if (/^.*false|disnable|(turn)?off|0/i.test(m.text)) return
let ressimi = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(m.text)}&lc=es`)
let data = await ressimi.json();
if (data.success == 'No s\u00e9 lo qu\u00e9 est\u00e1s diciendo. Por favor ense\u00f1ame.') return => {
let tiores = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=${text}&user=user-unique-id`)
let hasil = await tiores.json()
await m.reply(`${hasil.result}`.trim())  
}
await m.reply(data.success)  
return !0
}
return true
}
export default handler
