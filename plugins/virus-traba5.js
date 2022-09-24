import fetch from 'node-fetch'
let handler = async (m, { conn, text, args, usedPrefix, command }) => {	   
let virtex = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba1.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba3.txt').then(v => v.text());
conn.fakeReply(m.chat, virtex, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(m.chat, virtex2, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(m.chat, virtex3, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')}
handler.command = ['virus5', 'c5', 'binario5', 'traba5', 'crash5'] 
handler.rowner = true
export default handler
