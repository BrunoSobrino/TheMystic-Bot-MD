//السويدي ياسين 
import fetch from 'node-fetch'
let handler  = async (m, { conn, text }) => {
try {
let res = await fetch('https://cataas.com/cat')
let img = await res.buffer()
let caption = `*M O Y T*`.trim()
await delay(5000)
conn.sendFile(m.chat, img, 'cat.jpg', caption, m)
} catch (e) {
console.log(e)
throw '*ERROR !*'
}}
handler.help = ['cat']
handler.tags = ['fun']
handler.command = /^قطه|قطة$/i
handler.fail = null
handler.money = 25
export default handler
const delay = time => new Promise(res => setTimeout(res, time))
