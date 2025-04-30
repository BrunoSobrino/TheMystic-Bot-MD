import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {
if (!db.data.chats[m.chat].modohorny && m.isGroup) throw '[ ⚠️ ] Los comandos +18 estan desactivados en este grupo, si es administrador de este grupo y desea activarlos escriba #enable nsfw'
let url = futanari[Math.floor(Math.random() * futanari.length)]
conn.sendFile(m.chat, 
url, null, `*_ACA TIENES UNA RICA FUTANARI 🔥_*`, m)
}
handler.help = ['futanari']
handler.tags = ['nsfw']
handler.command = /^(futanari)$/i //futa|futasolo|futanarisolo
handler.group = true;
export default handler

global.futanari = [
  "https://ahri2mp4.rule34.xxx//images/1723/af1aad8933411817279b394f83fe7d5a.mp4?13309285"
  ]
