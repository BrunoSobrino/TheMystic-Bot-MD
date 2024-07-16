import pkg from '@whiskeysockets/baileys'
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

//nombre (perfil)
global.nombre = conn.getName(m.sender)

// Enlaces Mystic - (Random) 
var canalmystic = 'https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y'  
var gituser = 'https://github.com/BrunoSobrino' 
var mysticyt = 'https://www.youtube.com/@theshadowbrokers-team' 
var githubmystic = 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'

global.mysticredes = [canalmystic, gituser, mysticyt, githubmystic].getRandom()

global.iconmystic = [
'https://qu.ax/xhLt.jpg',
'https://qu.ax/xhLt.jpg'
].getRandom()

// Fakes
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

global.fakechannel = { contextInfo: { 
isForwarded: true, forwardedNewsletterMessageInfo: { 
newsletterJid: "120363316342878334@newsletter", 
serverMessageId: 100, 
newsletterName: '✰ The Shadow Brokers - Channel ✰', }, 
externalAdReply: { 
showAdAttribution: true, 
title: '✰ 𝗧𝗵𝗲 𝗠𝘆𝘀𝘁𝗶𝗰 - 𝗕𝗼𝘁 ✰', 
body: '✩ 𝐓𝐡𝐞 𝐒𝐡𝐚𝐝𝐨𝐰 𝐁𝐫𝐨𝐤𝐞𝐫𝐬 ✩',
mediaUrl: null, 
description: null, 
previewType: "PHOTO", 
thumbnailUrl: iconmystic, 
sourceUrl: mysticredes, 
mediaType: 1, 
renderLargerThumbnail: false
}, 
}, 
}
}

export default handler
