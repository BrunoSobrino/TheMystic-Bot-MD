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
  "https://ahri2mp4.rule34.xxx//images/1723/af1aad8933411817279b394f83fe7d5a.mp4?13309285",
  "https://api-cdn-us-mp4.rule34.xxx//images/1723/9d946dfb74b020652d433431e197e081.mp4?13309281",
  "https://ahri2mp4.rule34.xxx//images/1723/615dfbf9897d1dbdee5b5a01c25aabb4.mp4?13308215",
  "https://api-cdn-us-mp4.rule34.xxx//images/1723/1899f4b0507d29f96ecd21c65b26e1d0.mp4?13308808",
  "https://api-cdn-us-mp4.rule34.xxx//images/1723/ec94d6813a156840ee6d9b1f0f6755ce.mp4?13306941",
  "https://api-cdn-us-mp4.rule34.xxx//images/1466/c33ec9c2ab9f8502c1e38b9be57449d8.mp4?13304589",
  "https://api-cdn-us-mp4.rule34.xxx//images/1466/5ed2bd692939af11fe178f9a84769001.mp4?13302695",
  "https://api-cdn-us-mp4.rule34.xxx//images/2488/c2c4ef432bffff9b58bcfc9b0b6089fb.mp4?13298079",
  "https://api-cdn-us-mp4.rule34.xxx//images/2488/60502f6ecadc873d86f55dfb30485037.mp4?13297679",
  "https://api-cdn-us-mp4.rule34.xxx//images/3085/73e08aad8668f3a21b6aafba8b352b91.mp4?13297151",
  "https://ahri2mp4.rule34.xxx//images/2482/3fc89778accab75d451cc1141116e09c.mp4?13283934",
  "https://api-cdn-us-mp4.rule34.xxx//images/2224/53f4357e73034d6ae86646c293e9eb08.mp4?13271184",
  "https://api-cdn-us-mp4.rule34.xxx//images/1712/bc51e7f169e9ef7bd842652bbfbcf112.mp4?13267867",
  "https://api-cdn-us-mp4.rule34.xxx//images/1712/9139abe3be818d95753210c088c4e45c.mp4?13269188",
  "https://api-cdn-us-mp4.rule34.xxx//images/1712/ffdea33d855aed84fa4506acf2672116.mp4?13267494",
  "https://us-cdn01-prem.boomio-cdn.com/remote_control.php?time=1746006751&cv=9f2505ceb5c534f1087cedc43bc11a0a&lr=3184875&cv2=a5ce78ad148afe2c2da6ab2873bc32d2&file=%2Fvideos%2F3778000%2F3778613%2F3778613_720p.mp4&cv3=7b148ffed7e5ddccd7d2456825ccfe56&cv4=7bd1dbd2ce85337e139422da502bcc5a"
  ]
