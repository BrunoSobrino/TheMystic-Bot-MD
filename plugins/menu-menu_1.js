/* 

Codigo abierto - Dejar creditos
Created by https://github.com/BrunoSobrino 

👇🏻 EMPEIZA A MODIFICAR DESDE AQUÍ 👇🏻 */

import { xpRange } from '../lib/levelling.js'
const { levelling } = '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import fs from 'fs'
let handler = async (m, { conn, usedPrefix, usedPrefix: _p, __dirname, text }) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
else who = m.sender   
let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {}
let { exp, limit, level, role } = global.db.data.users[m.sender]
let { min, xp, max } = xpRange(level, global.multiplier)
let name = await conn.getName(m.sender)
let d = new Date(new Date + 3600000)
let locale = 'es'
let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, {
day: 'numeric',
month: 'long',
year: 'numeric' })
let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
day: 'numeric',
month: 'long',
year: 'numeric' }).format(d)
let time = d.toLocaleTimeString(locale, {
hour: 'numeric',
minute: 'numeric',
second: 'numeric' })
let _uptime = process.uptime() * 1000
let _muptime
if (process.send) {
process.send('uptime')
_muptime = await new Promise(resolve => {
process.once('message', resolve)
setTimeout(resolve, 1000)}) * 1000 }
let muptime = clockString(_muptime)
let uptime = clockString(_uptime)
let totalreg = Object.keys(global.db.data.users).length
let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
let replace = {
'%': '%',
p: _p, uptime, muptime,
me: conn.getName(conn.user.jid),
npmname: _package.name,
npmdesc: _package.description,
version: _package.version,
exp: exp - min,
maxexp: xp,
totalexp: exp,
xp4levelup: max - exp,
github: _package.homepage ? _package.homepage.url || _package.homepage : '[unknown github url]',
level, limit, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
readmore: readMore }
text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])    
    
let imagen1 = fs.readFileSync('./Menu2.jpg')
let imagen2 = fs.readFileSync('./src/nuevobot.jpg') 
let imagen3 = fs.readFileSync('./src/Pre Bot Publi.png')
let texto1 = `╭═─═─═─═─═─═╮
║   𝚃𝙷𝙴 𝙼𝚈𝚂𝚃𝙸𝙲 - 𝙱𝙾𝚃 - 𝙼𝙳
║╰═─═─═─═─══╯
┠╮
║- 𝙷𝙾𝙻𝙰 @${m.sender.split("@")[0]}
║- 𝚃𝙸𝙴𝙼𝙿𝙾 𝙰𝙲𝚃𝙸𝚅𝙾: ${uptime}
╿- 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂: ${rtotalreg}
╠╯               
╠═─═─ • ⏄ • ─═─═╮
║    *ＣＯＭＡＮＤＯＳ*
╠═─═─ • ⏄ • ─═─═╯
║
╰╮
01╠ Bot (𝑢𝑠𝑜 𝑠𝑖𝑛 𝑝𝑟𝑒𝑓𝑖𝑗𝑜)
02╠ admins (𝑢𝑠𝑜 𝑠𝑖𝑛 𝑝𝑟𝑒𝑓𝑖𝑗𝑜)
03╠ ${usedPrefix}grupos
04╠ ${usedPrefix}estado
05╠ ${usedPrefix}infobot
06╠ ${usedPrefix}donar
07╠ ${usedPrefix}grouplist
08╠ ${usedPrefix}owner
09╠ ${usedPrefix}script
10╠ ${usedPrefix}join
11╠ ${usedPrefix}mates
12╠ ${usedPrefix}ppt 
13╠ ${usedPrefix}prostituto 
14╠ ${usedPrefix}prostituta 
15╠ ${usedPrefix}gay2 
16╠ ${usedPrefix}lesbiana 
17╠ ${usedPrefix}pajero 
18╠ ${usedPrefix}pajera 
19╠ ${usedPrefix}puto 
20╠ ${usedPrefix}puta 
21╠ ${usedPrefix}manco 
22╠ ${usedPrefix}manca 
23╠ ${usedPrefix}rata 
24╠ ${usedPrefix}love 
25╠ ${usedPrefix}doxear 
26╠ ${usedPrefix}pregunta 
27╠ ${usedPrefix}slot 
28╠ ${usedPrefix}pvp 
29╠ ${usedPrefix}simi 
30╠ ${usedPrefix}topgays
31╠ ${usedPrefix}topotakus
32╠ ${usedPrefix}formarpareja
33╠ ${usedPrefix}verdad
34╠ ${usedPrefix}reto
35╠ ${usedPrefix}enable
36╠ ${usedPrefix}disable
37╠ ${usedPrefix}reporte
38╠ ${usedPrefix}facebook
39╠ ${usedPrefix}instagram
40╠ ${usedPrefix}mediafire
41╠ ${usedPrefix}instagram
42╠ ${usedPrefix}gitclone
43╠ ${usedPrefix}gdrive
44╠ ${usedPrefix}tiktok
45╠ ${usedPrefix}ytmp3
46╠ ${usedPrefix}ytmp4
47╠ ${usedPrefix}ytmp3doc
48╠ ${usedPrefix}ytmp4doc
49╠ ${usedPrefix}play.1
50╠ ${usedPrefix}play.2
51╠ ${usedPrefix}play
52╠ ${usedPrefix}playdoc
53╠ ${usedPrefix}spotify
54╠ ${usedPrefix}imagen
55╠ ${usedPrefix}pinteret
56╠ ${usedPrefix}wallpaper
57╠ ${usedPrefix}wallpaper2
58╠ ${usedPrefix}pptiktok
59╠ ${usedPrefix}igstalk
60╠ ${usedPrefix}igstory
61╠ ${usedPrefix}tiktokstalk
62╠ ${usedPrefix}add
63╠ ${usedPrefix}kick
64╠ ${usedPrefix}grupo
65╠ ${usedPrefix}promote
66╠ ${usedPrefix}demote
67╠ ${usedPrefix}demote 
68╠ ${usedPrefix}infogroup
69╠ ${usedPrefix}link
70╠ ${usedPrefix}setname 
71╠ ${usedPrefix}setdesc
72╠ ${usedPrefix}invocar
73╠ ${usedPrefix}setwelcome
74╠ ${usedPrefix}setbye 
75╠ ${usedPrefix}hidetag
76╠ ${usedPrefix}toimg
77╠ ${usedPrefix}tomp3
78╠ ${usedPrefix}toptt
79╠ ${usedPrefix}tovideo
80╠ ${usedPrefix}tourl
81╠ ${usedPrefix}tts
82╠ ${usedPrefix}logos
83╠ ${usedPrefix}simpcard
84╠ ${usedPrefix}hornycard
85╠ ${usedPrefix}lolice
86╠ ${usedPrefix}ytcomment
87╠ ${usedPrefix}itssostupid
88╠ ${usedPrefix}pixelar
89╠ ${usedPrefix}blur
90╠ ${usedPrefix}cristianoronaldo
91╠ ${usedPrefix}messi
92╠ ${usedPrefix}meme
93╠ ${usedPrefix}itzy
94╠ ${usedPrefix}blackpink
95╠ ${usedPrefix}kpop
96╠ ${usedPrefix}lolivid
97╠ ${usedPrefix}loli
98╠ ${usedPrefix}navidad
99╠ ${usedPrefix}ppcouple
⌻ ╰╮
100╠ ${usedPrefix}neko
101╠ ${usedPrefix}waifu
102╠ ${usedPrefix}akira
103╠ ${usedPrefix}akiyama
104╠ ${usedPrefix}anna
105╠ ${usedPrefix}asuna
106╠ ${usedPrefix}ayuzawa
107╠ ${usedPrefix}boruto
108╠ ${usedPrefix}chiho
109╠ ${usedPrefix}chitoge
110╠ ${usedPrefix}deidara
111╠ ${usedPrefix}erza
112╠ ${usedPrefix}elaina
113╠ ${usedPrefix}eba
114╠ ${usedPrefix}emilia
115╠ ${usedPrefix}hestia
116╠ ${usedPrefix}hinata
117╠ ${usedPrefix}inori
118╠ ${usedPrefix}isuzu
119╠ ${usedPrefix}itachi
120╠ ${usedPrefix}itori
121╠ ${usedPrefix}kaga
122╠ ${usedPrefix}kagura
123╠ ${usedPrefix}kaori
124╠ ${usedPrefix}keneki
125╠ ${usedPrefix}kotori
126╠ ${usedPrefix}kurumi
127╠ ${usedPrefix}madara
128╠ ${usedPrefix}mikasa
129╠ ${usedPrefix}miku
130╠ ${usedPrefix}minato
131╠ ${usedPrefix}naruto
132╠ ${usedPrefix}nezuko
133╠ ${usedPrefix}sagiri
134╠ ${usedPrefix}sasuke
135╠ ${usedPrefix}sakura
136╠ ${usedPrefix}cosplay
137╠ ${usedPrefix}pack
138╠ ${usedPrefix}pack2
139╠ ${usedPrefix}pack3
140╠ ${usedPrefix}videoxxx
141╠ ${usedPrefix}tetas
142╠ ${usedPrefix}booty
143╠ ${usedPrefix}ecchi
144╠ ${usedPrefix}furro
145╠ ${usedPrefix}imagenlesbians
146╠ ${usedPrefix}panties
147╠ ${usedPrefix}pene
148╠ ${usedPrefix}porno
149╠ ${usedPrefix}porno2
150╠ ${usedPrefix}randomxxx
151╠ ${usedPrefix}pechos
152╠ ${usedPrefix}yaoi
153╠ ${usedPrefix}yaoi2
154╠ ${usedPrefix}yuri
155╠ ${usedPrefix}yuri2
156╠ ${usedPrefix}trapito
157╠ ${usedPrefix}hentai
158╠ ${usedPrefix}pies
159╠ ${usedPrefix}nsfwloli
160╠ ${usedPrefix}nsfworgy
161╠ ${usedPrefix}nsfwfoot
162╠ ${usedPrefix}nsfwass
163╠ ${usedPrefix}nsfwbdsm
164╠ ${usedPrefix}nsfwcum
165╠ ${usedPrefix}nsfwero
166╠ ${usedPrefix}nsfwfemdom
167╠ ${usedPrefix}nsfwglass
168╠ ${usedPrefix}bass
169╠ ${usedPrefix}blown
170╠ ${usedPrefix}deep
171╠ ${usedPrefix}earrape
172╠ ${usedPrefix}fast
173╠ ${usedPrefix}fat
174╠ ${usedPrefix}nightcore
175╠ ${usedPrefix}reverse
176╠ ${usedPrefix}robot
177╠ ${usedPrefix}slow
178╠ ${usedPrefix}smooth
179╠ ${usedPrefix}tupai
180╠ ${usedPrefix}start
181╠ ${usedPrefix}next
182╠ ${usedPrefix}leave
183╠ ${usedPrefix}animeinfo
184╠ ${usedPrefix}google
185╠ ${usedPrefix}letra
186╠ ${usedPrefix}wikipedia
187╠ ${usedPrefix}ytsearch
188╠ ${usedPrefix}apkdone
189╠ ${usedPrefix}apkgoogle
190╠ ${usedPrefix}apkmody
191╠ ${usedPrefix}apkshub
192╠ ${usedPrefix}happymod
193╠ ${usedPrefix}hostapk
194╠ ${usedPrefix}revdl
195╠ ${usedPrefix}toraccino
196╠ ${usedPrefix}uapkpro
197╠ ${usedPrefix}afk
198╠ ${usedPrefix}acortar
199╠ ${usedPrefix}calc
200╠ ${usedPrefix}del
201╠ ${usedPrefix}qrcode
202╠ ${usedPrefix}readmore
203╠ ${usedPrefix}spamwa
204╠ ${usedPrefix}styletext
205╠ ${usedPrefix}traducir
206╠ ${usedPrefix}balance
207╠ ${usedPrefix}claim
208╠ ${usedPrefix}top
209╠ ${usedPrefix}levelup
210╠ ${usedPrefix}myns
210╠ ${usedPrefix}perfil
210╠ ${usedPrefix}work
210╠ ${usedPrefix}minar
210╠ ${usedPrefix}buy
210╠ ${usedPrefix}buyall
210╠ ${usedPrefix}transfer
210╠ ${usedPrefix}verificar
210╠ ${usedPrefix}unreg
210╠ ${usedPrefix}sticker
220╠ ${usedPrefix}emojimix
221╠ ${usedPrefix}semoji
222╠ ${usedPrefix}attp
223╠ ${usedPrefix}ttp
224╠ ${usedPrefix}pat
225╠ ${usedPrefix}slap
226╠ ${usedPrefix}kiss
227╠ ${usedPrefix}dado
228╠ ${usedPrefix}wm
229╠ ${usedPrefix}stickermarker
230╠ ${usedPrefix}stickerfilter
232╠ ${usedPrefix}menucompleto
233╠ ${usedPrefix}menuaudios
234╠ ${usedPrefix}menu2
235╠ ${usedPrefix}menu3
236╠ ${usedPrefix}playlist
237╠ ${usedPrefix}playlist2
238╠ ${usedPrefix}xnxxsearch
239╠ ${usedPrefix}xnxxdl
240╠ ${usedPrefix}xvideosdl
╭─╯
╠╯
║ㅤㅤㅤ A____A
║ㅤㅤㅤ |・ㅅ・|
║ㅤㅤㅤ |っ　ｃ|
║ㅤㅤㅤ |　　　|
║ㅤㅤㅤ |　　　|
║ㅤㅤㅤ U￣￣U
╠═─═─ • ⏄ • ─═─═╮
╰═─═─ • ⏄ • ─═─═╯`
const fake = { quoted: {
key : {
participant : '0@s.whatsapp.net' },
message: {
orderMessage: {
itemCount : 999999,
status: 1,
surface : 1,
message: wm, 
orderTitle: 'WaBot',
thumbnail: imagen2, 
sellerJid: '0@s.whatsapp.net' }}}}      
const owner = "5219992095479@s.whatsapp.net"
var doc = ['pdf','zip','vnd.openxmlformats-officedocument.presentationml.presentation','vnd.openxmlformats-officedocument.spreadsheetml.sheet','vnd.openxmlformats-officedocument.wordprocessingml.document']
var document = doc[Math.floor(Math.random() * doc.length)]
const buttons = [
{buttonId: `#donar`, buttonText: {displayText: '📮 𝙳𝙾𝙽𝙰𝚁 📮'}, type: 1},
{buttonId: `#menuaudios`, buttonText: {displayText: '🔊 𝙼𝙴𝙽𝚄 𝙰𝚄𝙳𝙸𝙾𝚂 🔊'}, type: 1},
{buttonId: `#menucompleto`, buttonText: {displayText: '💟 𝙼𝙴𝙽𝚄 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙾 💟'}, type: 1}, ]
let buttonMessage = {
document: imagen1, 
fileName: `ᴇʟ ᴍᴇᴊᴏʀ ʙᴏᴛ ᴅᴇ ᴡʜᴀᴛsᴀᴘᴘ⁩`, 
mimetype: `application/${document}`,
jpegThumbnail: imagen1,
caption: texto1,
fileLength: "99999999999999",
mentions:[m.sender, owner],
footer: `𝔹𝕪 𝔹𝕣𝕦𝕟𝕠 𝕊𝕠𝕓𝕣𝕚𝕟𝕠`,
buttons: buttons,
headerType: 4,   
contextInfo: {
"mentionedJid": [m.sender, owner],
"externalAdReply": {
"showAdAttribution": false,
"title": `𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙻𝙰𝙲𝙸𝙾𝙽`,
"mediaType": 2, 
"previewType": "VIDEO",
"thumbnail": imagen3,
"mediaUrl": 'https://youtu.be/eC9TfKICpcY',
"sourceUrl": 'https://www.pornhub.com' }}} 
conn.sendMessage(m.chat, buttonMessage, fake)}
handler.help = ['menu', 'help', '?']
handler.tags = ['main']
handler.command = /^(menucompleto|menu3|menú3|memu3|memú3|help3|info3|comandos3|allmenu3|ayuda3|commands3|commandos3)$/i
export default handler
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
function clockString(ms) {
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}
