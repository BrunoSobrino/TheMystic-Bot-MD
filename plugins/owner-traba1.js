import fetch from 'node-fetch'
let handler = async (m, { conn, text, args }) => {
const estiloaudio = { key: {  fromMe: false, participant: `05675@s.whatsapp.net`, ...(m.chat ? { remoteJid: "5219992606@g.us" } : {}) }, message: {"audioMessage": { "mimetype":"audio/ogg; codecs=opus", "seconds": "995576878678657856785678567856785678768757876856769", "ptt": "true"}}}  
let virtex = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/1.txt').then(v => v.text());
let virtex2 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/2.txt').then(v => v.text());
let virtex3 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/3.txt').then(v => v.text());
let virtex4 = await fetch('https://raw.githubusercontent.com/Caliph91/txt/main/pirtex/4.txt').then(v => v.text());
let virtex5 = await fetch('https://raw.githubusercontent.com/BrunoSobrino/ShadowBotV3-OBSOLETO/master/lib/Binario.txt').then(v => v.text());
conn.sendPresenceUpdate('recording', m.chat)
m.reply(virtex, estiloaudio);
m.reply(virtex2, estiloaudio);
conn.sendPresenceUpdate('recording', m.chat)
m.reply(virtex3, estiloaudio);
m.reply(virtex4, estiloaudio);
conn.sendPresenceUpdate('recording', m.chat)
}
handler.command = /^traba1|c1|binario1$/i
handler.rowner = true
export default handler
