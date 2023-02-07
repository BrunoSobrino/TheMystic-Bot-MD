import fetch from 'node-fetch'
let handler = m => m
handler.before = async (m) => {
try {   
let chat = global.db.data.chats[m.chat]
if (chat.simi) { 
if (/^.*false|disnable|(turn)?off|0/i.test(m.text)) return
let ressimi = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(m.text)}&lc=` + lenguajeGB.lenguaje())
let data = await ressimi.json();
if (data.success == 'No s\u00e9 lo qu\u00e9 est\u00e1s diciendo. Por favor ense\u00f1ame.') return                                                                                                 
await m.reply(data.success)
return !0 }
return true 
} catch {
throw '*Error en la IA / API de simsimi*'}}
export default handler
