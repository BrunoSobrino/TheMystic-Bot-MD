import pkg from '@whiskeysockets/baileys' // IMPORTAR LA LIBRERÍA "BAILEYS"
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
try {
options ? options : {}
var res = await axios({
method: "get",
url,
headers: {
'DNT': 1,
'User-Agent': 'GoogleBot',
'Upgrade-Insecure-Request': 1
},
...options,
responseType: 'arraybuffer'
})
return res.data
} catch (e) {
console.log(`Error : ${e}`)
}}

// Enlaces Mystic - (Random) 
var canalmystic = 'https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y'  
var gituser = 'https://github.com/BrunoSobrino' 
var mysticyt = 'https://www.youtube.com/@theshadowbrokers-team' 
var githubmystic = 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'

global.mysticredes = [canalmystic, gituser, mysticyt, githubmystic].getRandom()


// Fakes - Fkontak
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

global.mysticicon = 'https://qu.ax/nBBN.jpg'

global.fakechannel = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363316342878334@newsletter", serverMessageId: 100, newsletterName: '✰ The Shadow Brokers - Channel ✰', }, externalAdReply: { showAdAttribution: true, title: wm, body: '✩ 𝐓𝐡𝐞-𝐌𝐲𝐬𝐭𝐢𝐜-𝐁𝐨𝐭-𝐌𝐃 ✩', mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: mysticicon, sourceUrl: mysticredes, mediaType: 1, renderLargerThumbnail: false
}, }, }}

export default handler
