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

//Fakes
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

global.mysticicon = 'https://qu.ax/GOer.jpg'

global.fakechannel = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363316342878334@newsletter", serverMessageId: 100, newsletterName: 'The Shadow Brokers - Channel ℹ️', }, externalAdReply: { showAdAttribution: true, title: wm, body: 'The Shadow Brokers - TEAM', mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: mysticicon, sourceUrl: md, mediaType: 1, renderLargerThumbnail: false
}, }, }}

export default handler