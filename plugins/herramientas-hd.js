import uploadImage from '../lib/uploadImage.js'
import deepai from 'deepai'
import fetch from 'node-fetch'
import FormData from 'form-data'
deepai.setApiKey('04f02780-e0bd-44c1-afa2-14cf5a78948c')
let handler = async (m, { conn, args, usedPrefix, command }) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (/image/g.test(mime) && !/webp/g.test(mime)) {
try {
let img = await q.download?.()
let out = await uploadImage(img)
var resp = await deepai.callStandardApi("waifu2x", { image: out })
let w2x1 = resp['output_url']
var resep = await deepai.callStandardApi("waifu2x", { image: w2x1 })
let w2x2 = resep['output_url']
var resup = await   deepai.callStandardApi("torch-srgan", { image: w2x2 })
await conn.sendFile(m.chat, resup['output_url'], 'error.png', '', m)
} catch {
await m.reply(global.wait)
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (!mime) throw '*[❗] 𝙴𝙽𝚅𝙸𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽𝙰 𝙵𝙾𝚃𝙾*'
if (!/image\/(jpe?g|png)/.test(mime)) throw `*[❗] 𝙴𝙻 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙳𝙴𝙻 𝙰𝚁𝙲𝙷𝙸𝚅𝙾 (${mime}) 𝙽𝙾 𝙴𝚂 𝙲𝙾𝙼𝙿𝙰𝚁𝚃𝙸𝙱𝙻𝙴, 𝙴𝙽𝚅𝙸𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽𝙰 𝙵𝙾𝚃𝙾*`
let img = await q.download()
let body = new FormData
body.append('image', img, 'image')
let res = await fetch('http://max-image-resolution-enhancer.codait-prod-41208c73af8fca213512856c7a09db52-0000.us-east.containers.appdomain.cloud/model/predict', { method: 'POST', body })
if (res.status !== 200) throw await res.json()
await conn.sendFile(m.chat, await res.buffer(), 'error.jpg', '', m)}} else {
m.reply(`*[❗] 𝙴𝙽𝚅𝙸𝙴 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙲𝙾𝙽 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`)}}
handler.help = ['hd', 'enhance']
handler.tags = ['tools']
handler.command = /^(hd|enhance)$/i
export default handler
