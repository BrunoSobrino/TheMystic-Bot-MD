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
  "https://us-cdn03-prem.boomio-cdn.com/remote_control.php?time=1746007947&cv=ef2dbadf28c45bfb55a60042cd777181&lr=2986500&cv2=16fb505eb1db4a859b9e8b8f7ee89167&file=%2Fvideos%2F3770000%2F3770917%2F3770917_720p.mp4&cv3=7b148ffed7e5ddccd7d2456825ccfe56&cv4=334b20271785ad4ed2e233c45667fc62"
  ]
