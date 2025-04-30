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
  "https://us-cdn01-prem.boomio-cdn.com/remote_control.php?time=1746006751&cv=9f2505ceb5c534f1087cedc43bc11a0a&lr=3184875&cv2=a5ce78ad148afe2c2da6ab2873bc32d2&file=%2Fvideos%2F3778000%2F3778613%2F3778613_720p.mp4&cv3=7b148ffed7e5ddccd7d2456825ccfe56&cv4=7bd1dbd2ce85337e139422da502bcc5a"
  ]
