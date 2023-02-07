import fetch from 'node-fetch'
let handler = m => m
handler.before = async (m) => {
let chat = global.db.data.chats[m.chat]
if (chat.simi) {
try {  
if (/^.*false|disnable|(turn)?off|0/i.test(m.text)) return
let ressimi = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(m.text)}&lc=es`)
let data = await ressimi.json() 
let resultf = `${data.success}`  
if (data.success == 'No s\u00e9 lo qu\u00e9 est\u00e1s diciendo. Por favor ense\u00f1ame.' || !ressimi) return
await m.reply(resultf) 
} catch {
throw '*Error en la IA / API de simsimi*'  
return !0 }
return true }
export default handler
