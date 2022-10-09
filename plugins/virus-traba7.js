import fetch from 'node-fetch'
let handler  = async (m, { conn }) => {
let info = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba4.txt').then(v => v.text());
conn.fakeReply(m.chat, info, '0@s.whatsapp.net', '🔥 *by 𝙲𝚛𝚕𝚜҉ꪶ͢sєrꫂ⁩* 🔥', 'status@broadcast')}
handler.command = ['virus7', 'c7', 'binario7', 'traba7', 'crash7', 'bughole'] 
handler.rowner = true
handler.fail = null
export default handler 
