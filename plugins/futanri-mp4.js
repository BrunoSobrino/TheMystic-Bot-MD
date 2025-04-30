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
  "https://us-cdn12-prem.boomio-cdn.com/remote_control.php?time=1746007599&cv=d98c61b64661042dc5e0ae041ad09f23&lr=1074750&cv2=2ad6b4fd496b354b4376ff816fd21aef&file=%2Fvideos%2F3815000%2F3815381%2F3815381_720p.mp4&cv3=7b148ffed7e5ddccd7d2456825ccfe56&cv4=0966fcd00e27281034111c2db87b53df"
  ]
