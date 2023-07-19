import fetch from 'node-fetch'
let handler = async (m, { conn, command, usedPrefix }) => {
if (!db.data.chats[m.chat].modohorny && m.isGroup) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙻𝙾𝚂 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 +𝟷𝟾 𝙴𝚂𝚃𝙰𝙽 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾, 𝚂𝙸 𝙴𝚂 𝙰𝙳𝙼𝙸𝙽 𝚈 𝙳𝙴𝚂𝙴𝙰 𝙰𝙲𝚃𝙸𝚅𝙰𝚁𝙻𝙾𝚂 𝚄𝚂𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #enable modohorny*'
switch (command) {
case "pack": 
let url = await pack[Math.floor(Math.random() * pack.length)]
    await conn.sendFile(  
      m.chat,  
      url,  
      "gimage.jpg",  
      `🥵 pack 🥵`.trim(), m)
case "pack2":  
let url2 = await packgirl[Math.floor(Math.random() * packgirl.length)]
conn.sendMessage(m.chat, { image: { url: url2 }, caption: `_🥵 Pack 2 🥵_` }, { quoted: m })    
//conn.sendButton(m.chat, `_🥵 Pack 2 🥵_`, author, url2, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `${usedPrefix + command}`]], m) 
break
case "pack3":
let url3 = await packmen[Math.floor(Math.random() * packmen.length)]
conn.sendMessage(m.chat, { image: { url: url3 }, caption: `_🥵 Pack 3 🥵_` }, { quoted: m })    
//conn.sendButton(m.chat, `_🥵 Pack 3 🥵_`, author, url3, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `${usedPrefix + command}`]], m) 
break
case "videoxxx": case "vídeoxxx":    
let url4 = await videosxxxc[Math.floor(Math.random() * videosxxxc.length)] 
await conn.sendMessage(m.chat, { video: { url: url4 }, caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*` }, { quoted: m })    
await conn.sendButton(m.chat, `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`, author, url4, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `${usedPrefix + command}`]], m)  
break  
case "videoxxxlesbi": case "videolesbixxx": case "pornolesbivid": case "pornolesbianavid": case "pornolesbiv": case "pornolesbianav": case "pornolesv":       
let url5 = await videosxxxc2[Math.floor(Math.random() * videosxxxc2.length)] 
await conn.sendMessage(m.chat, { video: { url: url5 }, caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*` }, { quoted: m }) 
//await conn.sendButton(m.chat, `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`, author, url5, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `${usedPrefix + command}`]], m)    
break    
}}
handler.command = /^(pack|pack2|pack3|videoxxx|vídeoxxx|videoxxxlesbi|videolesbixxx|pornolesbivid|pornolesbianavid|pornolesbiv|pornolesbianav|pornolesv)$/i
export default handler

global.pack = [ 
   "https://telegra.ph/file/f8bc435732650131192a5.jpg", 
   "https://telegra.ph/file/570e7cf369d70aae15990.jpg", 
   "https://telegra.ph/file/891da3a1c54cb37ed0756.jpg", 
   "https://telegra.ph/file/624815273ed1ae11c4ff0.jpg", 
   "https://telegra.ph/file/8e398585865bc94030ce7.jpg", 
   "https://telegra.ph/file/11b8efdc9615134725752.jpg", 
   "https://telegra.ph/file/29662296bbb1ae7f1a856.jpg", 
   "https://telegra.ph/file/f30ee098a6c46e5537653.jpg", 
   "https://telegra.ph/file/6933cb35ca62196b9fe17.jpg", 
   "https://telegra.ph/file/a779b85b5f0cab14aa147.jpg", 
   "https://telegra.ph/file/29047576f7d000286f0ab.jpg", 
   "https://telegra.ph/file/0dad2b4ed22cba2a3140e.jpg", 
   "https://telegra.ph/file/bf6210e80f3d37f160baf.jpg", 
   "https://telegra.ph/file/679e3a1f1fd2617035a35.jpg", 
   "https://telegra.ph/file/97d2ae47ea0dbdb1ed764.jpg", 
   "https://telegra.ph/file/b71c296f6c210bc39d10b.jpg", 
   "https://telegra.ph/file/3d9a5fee6553aafb47858.jpg", 
   "https://telegra.ph/file/af13b3d0acd9b180118fa.png", 
 ]; 
 
global.packgirl = [
  "https://i.imgur.com/mwLJaxU.jpg",
  "https://i.imgur.com/9ptmlPl.jpg",
  "https://i.imgur.com/38tVliz.jpg",
  "https://i.imgur.com/2NqCKE3.jpg",
  "https://i.imgur.com/pveviMG.jpg",
  "https://i.imgur.com/d71dnkv.jpg",
  "https://i.imgur.com/cr7Ypj1.jpg",
  "https://i.imgur.com/jAxzCj4.jpg",
  "https://i.imgur.com/xokuFLf.jpg",
  "https://i.imgur.com/Hi4zLaf.jpg",
  "https://i.imgur.com/OlaQtwW.jpg",
  "https://i.imgur.com/Dm4GLuF.jpg",
  "https://i.imgur.com/k6Y2E9b.jpg",
  "https://i.imgur.com/1rk7jdu.jpg",
  "https://i.imgur.com/TFmEVPc.jpg",
  "https://i.imgur.com/0XefLlJ.jpg",
  "https://i.imgur.com/bwa9LYZ.jpg",
  "https://i.imgur.com/WgrpTmg.jpg",
  "https://i.imgur.com/Z5f5YAw.jpg",
  "https://i.imgur.com/xEuBtPO.jpg",
  "https://i.imgur.com/NA0fHxn.jpg",
  "https://i.imgur.com/InueCKQ.jpg",
  "https://i.imgur.com/3syOcHe.jpg",
  "https://i.imgur.com/N1dgels.jpg",
  "https://i.imgur.com/IxKAJaV.jpg",
  "https://i.imgur.com/8VrxL1d.jpg",
  "https://i.imgur.com/8B4Y0bG.jpg",
  "https://i.imgur.com/wgkGOjF.jpg",
  "https://i.imgur.com/765Wi6q.jpg",
  "https://i.imgur.com/5joeWnm.jpg",
  "https://i.imgur.com/71fjmmM.jpg",
  "https://i.imgur.com/cAuKeyZ.jpg",
  "https://i.imgur.com/SDZ2Hs5.jpg",
  "https://i.imgur.com/skkEyqI.jpg",
  "https://i.imgur.com/6dXFsBW.jpg",
  "https://i.imgur.com/6CeG9ZX.jpg"
]
global.packmen = [
  "https://i.imgur.com/TK0qLAu.jpg",
  "https://i.imgur.com/q8lKT40.jpg",
  "https://i.imgur.com/OwWdL9u.jpg",
  "https://i.imgur.com/Er7WiQo.jpg",
  "https://i.imgur.com/u4y0q4P.jpg",
  "https://i.imgur.com/y8y4PPr.jpg",
  "https://i.imgur.com/qgfLlRY.jpg",
  "https://i.imgur.com/irgyUTD.jpg",
  "https://i.imgur.com/uXrqfBl.jpg",
  "https://i.imgur.com/lgXjetf.jpg",
  "https://i.imgur.com/81QLh8s.jpg",
  "https://i.imgur.com/R3AlYe1.jpg",
  "https://i.imgur.com/a2Myr3F.jpg",
  "https://i.imgur.com/Wp9cgGw.jpg",
  "https://i.imgur.com/ggKUnxt.jpg",
  "https://i.imgur.com/eCJNWBl.jpg",
  "https://i.imgur.com/6lcrBQB.jpg",
  "https://i.imgur.com/eSSbXJ1.jpg",
  "https://i.imgur.com/tNyvzyO.jpg"
]
global.videosxxxc = [
"https://telegra.ph/file/4a270d9945ac46f42d95c.mp4",
"https://telegra.ph/file/958c11e84d271e783ea3f.mp4",
"https://telegra.ph/file/f753759342337c4012b3f.mp4",
"https://telegra.ph/file/379cee56c908dd536dd33.mp4",
"https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4",
"https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4",
"https://telegra.ph/file/1e316b25c787f94a0f8fd.mp4",
"https://telegra.ph/file/c229d33edce798cde0ca4.mp4",
"https://telegra.ph/file/b44223e72dd7e80e415f2.mp4",
"https://telegra.ph/file/61486d45a8a3ea95a7c86.mp4",  
"https://telegra.ph/file/76ba0dc2a07f491756377.mp4",
"https://telegra.ph/file/831bb88f562bef3f1a15d.mp4",
"https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4",
"https://telegra.ph/file/598857924f3a29ffd37ae.mp4",  
"https://telegra.ph/file/528caef6ea950ec45aeef.mp4",
"https://telegra.ph/file/4a270d9945ac46f42d95c.mp4",
"https://telegra.ph/file/958c11e84d271e783ea3f.mp4",
"https://telegra.ph/file/f753759342337c4012b3f.mp4",
"https://telegra.ph/file/379cee56c908dd536dd33.mp4",
"https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4",
"https://telegra.ph/file/76ba0dc2a07f491756377.mp4",
"https://telegra.ph/file/831bb88f562bef3f1a15d.mp4"
]
/*global.videosxxxc = [
"https://l.top4top.io/m_2235dduf01.mp4",
"https://a.top4top.io/m_2235268m61.mp4",
"https://b.top4top.io/m_2235k7hze2.mp4",
"https://c.top4top.io/m_2235lxohb3.mp4",
"https://d.top4top.io/m_2235jwd2e4.mp4",
"https://e.top4top.io/m_2235h5b1z5.mp4",
"https://f.top4top.io/m_2235gihcu6.mp4",
"https://l.top4top.io/m_2235dp7m41.mp4",
"https://a.top4top.io/m_2235zxue82.mp4",
"https://b.top4top.io/m_2235m3bhf3.mp4",
"https://c.top4top.io/m_2235vjyio4.mp4",
"https://d.top4top.io/m_2235m9tdu5.mp4",
"https://e.top4top.io/m_2235y2kon6.mp4",
"https://f.top4top.io/m_2235rhid57.mp4",
"https://g.top4top.io/m_2235zgsqf8.mp4",
"https://i.top4top.io/m_2235drxxg10.mp4",
"https://d.top4top.io/m_2235fzynm1.mp4",    
"https://e.top4top.io/m_22354t3zk2.mp4",
"https://f.top4top.io/m_2235gyxgh3.mp4",
"https://g.top4top.io/m_22357cmft4.mp4", 
"https://i.top4top.io/m_2235mcizm6.mp4",
"https://j.top4top.io/m_2235gwsn17.mp4",
"https://k.top4top.io/m_2235gzzjc8.mp4",
"https://a.top4top.io/m_2235l9y1310.mp4",  
"https://l.top4top.io/m_2235r1opz1.mp4",    
"https://a.top4top.io/m_22358cuuu2.mp4",
"https://b.top4top.io/m_22350c9br3.mp4",
"https://c.top4top.io/m_22355p2js4.mp4",  
"https://d.top4top.io/m_2235lv7415.mp4",
"https://e.top4top.io/m_2235q8z3f6.mp4",     
"https://b.top4top.io/m_22358oas31.mp4",
"https://c.top4top.io/m_2235xg7o62.mp4",
"https://d.top4top.io/m_2235ut91p3.mp4",
"https://e.top4top.io/m_22352ktoj4.mp4",
"https://f.top4top.io/m_2235hcqj65.mp4",
"https://g.top4top.io/m_2235j81s76.mp4"
]*/
global.videosxxxc2 = [
"https://l.top4top.io/m_2257y4pyl0.mp4",
"https://c.top4top.io/m_2274woesg0.mp4",
"https://k.top4top.io/m_2257pdwjy0.mp4",
"https://a.top4top.io/m_2257qulmx0.mp4",
"https://a.top4top.io/m_2257vxzr62.mp4",
"https://b.top4top.io/m_2257wjmbh3.mp4",
"https://b.top4top.io/m_2257sen2a1.mp4",
"https://c.top4top.io/m_2257hpo9v3.mp4",
"https://e.top4top.io/m_2257pye7u1.mp4",
"https://c.top4top.io/m_2257p7xg14.mp4",
"https://c.top4top.io/m_2257p4v9i3.mp4",
"https://l.top4top.io/m_2257jvkrv3.mp4",
"https://b.top4top.io/m_2257pl7wh1.mp4",
"https://e.top4top.io/m_2257fiwnp2.mp4",
"https://b.top4top.io/m_22578b1nk1.mp4",
"https://k.top4top.io/m_22572gv7q1.mp4",
"https://i.top4top.io/m_2257pu90l2.mp4",
"https://d.top4top.io/m_2257vcwiw3.mp4",
"https://j.top4top.io/m_2258joebc2.mp4",
"https://g.top4top.io/m_2258kvnba4.mp4",
"https://f.top4top.io/m_2258nm8pe1.mp4",
"https://g.top4top.io/m_2258af7bc2.mp4",
"https://l.top4top.io/m_2258f0ci92.mp4",
"https://j.top4top.io/m_2258ehqpb2.mp4",
"https://h.top4top.io/m_2258pckkf3.mp4",
"https://e.top4top.io/m_225857rs20.mp4",
"https://k.top4top.io/m_225863kpa0.mp4",
"https://j.top4top.io/m_2258s6we62.mp4",
"https://i.top4top.io/m_2258if6l13.mp4",
"https://b.top4top.io/m_2258lmd2h1.mp4",
"https://j.top4top.io/m_2258a9oah2.mp4",
"https://i.top4top.io/m_22588w3xh0.mp4",
"https://g.top4top.io/m_225885lm14.mp4",
"https://e.top4top.io/m_2258buxc30.mp4",
"https://e.top4top.io/m_2258fvra62.mp4",
"https://l.top4top.io/m_22588mx7k4.mp4",
"https://g.top4top.io/m_2258zhldg1.mp4"
]
