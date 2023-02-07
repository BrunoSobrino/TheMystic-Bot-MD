import fetch from 'node-fetch'
let handler = m => m
handler.before = async (m) => {
let chat = global.db.data.chats[m.chat]
if (chat.simi) {
if (/^.*false|disnable|(turn)?off|0/i.test(m.text)) return
let ressimi = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(m.text)}&lc=es`)
let data = await ressimi.json() 
let resultf = data.success  
let aa1 = await fetchJson(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=${m.text}&user=user-unique-id`)
if (data.success == 'No s\u00e9 lo qu\u00e9 est\u00e1s diciendo. Por favor ense\u00f1ame.' || !ressimi) resultf = aa1.result
await m.reply(resultf)      
return !0
}
return true
}
export default handler
async function fetchJson(url, options) {
try {
options ? options : {}
const res = await axios({ method: 'GET', url: url, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'}, ...options })
return res.data
} catch (err) {
return err
}}
