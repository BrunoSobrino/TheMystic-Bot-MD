import fecth from 'node-fetch'
let handler  = async (m, { conn }) => {
let info = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba5.txt').then(v => v.text());
conn.fakeReply(m.chat, info, '0@s.whatsapp.net', '🔥 *by ĐłɆ₲Ø-Ø₣₵ 🔥', 'status@broadcast')}
handler.command = ['virus10', 'c10', 'binario10', 'traba10', 'crash10'] 
handler.rowner = true
handler.fail = null
export default handler
