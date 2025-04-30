import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {
if (!db.data.chats[m.chat].modohorny && m.isGroup) throw '[ ⚠️ ] Los comandos +18 estan desactivados en este grupo, si es administrador de este grupo y desea activarlos escriba #enable nsfw'
let url = futanarimp4[Math.floor(Math.random() * futanarimp4.length)]
conn.sendFile(m.chat, 
url, null, `*_ACA TIENES UNA RICA FUTANARI 🔥_*`, m)
}
handler.help = ['futanarimp4']
handler.tags = ['nsfw']
handler.command = /^(futanari)$/i //futamp4
handler.group = true;
export default handler

global.futanarimp4 = [
  "https://api-cdn-us-mp4.rule34.xxx//images/2488/60502f6ecadc873d86f55dfb30485037.mp4?13297679"
  ]
