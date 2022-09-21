import fetch from 'node-fetch'
let handler = async (m, { conn, text, args, usedPrefix, command }) => {	   
const doc = { 
key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m ? { remoteJid: "" } : {})},
"message": { "documentMessage": { "url": "https://mmg.whatsapp.net/d/f/Aj85sbZCtNtq1cJ6JupaBUTKfgrl2zXRXGvVNWAbFnsp.enc", "mimetype": "application/octet-stream", "fileSha256": "TSSZu8gDEAPhp8vjdtJS/DXIECzjrSh3rmcoHN76M9k=", "fileLength": "64455", "pageCount": 1, "mediaKey": "P32GszzU5piUZ5HKluLD5h/TZzubVJ7lCAd1PIz3Qb0=", "fileName": `Mystic`, "fileEncSha256": "ybdZlRjhY+aXtytT0G2HHN4iKWCFisG2W69AVPLg5yk="}}}
let virtex = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba1.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/trabas/traba3.txt').then(v => v.text());
m.reply(virtex, doc);
m.reply(virtex2, doc);
m.reply(virtex3, doc, { mentions: conn.parseMention(virtex3) })}
//m.reply(virtex3, doc);
}
handler.command = ['virus5', 'c5', 'binario5', 'traba5'] 
handler.rowner = true
export default handler
