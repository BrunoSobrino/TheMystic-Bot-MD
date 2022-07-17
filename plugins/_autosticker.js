import { sticker } from '../lib/sticker.js'

let handler = m => m

handler.all = async function (m) {
let chat = db.data.chats[m.chat]
let user = db.data.users[m.sender]

if (chat.autosticker && m.isGroup) {
let q = m
let stiker = false
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (/webp/g.test(mime)) return
if (/image/g.test(mime)) {
let img = await q.download?.()
if (!img) return
stiker = await sticker(img, false, packname, author)
} else if (/video/g.test(mime)) {
if (/video/g.test(mime)) if ((q.msg || q).seconds > 8) return await this.sendButton(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝚅𝙸𝙳𝙴𝙾 𝙽𝙾 𝙿𝚄𝙴𝙳𝙴 𝙳𝚄𝚁𝙰𝚁 𝙼𝙰𝚂 𝙳𝙴 𝟽 𝚂𝙴𝙶𝚄𝙽𝙳𝙾𝚂*', wm, [['𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝚁 𝙰𝚄𝚃𝙾𝚂𝚃𝙸𝙲𝙺𝙴𝚁', '/disable autosticker']], m)
let img = await q.download()
if (!img) return
stiker = await sticker(img, false, packname, author)
} else if (m.text.split(/\n| /i)[0]) {
if (isUrl(m.text)) stiker = await sticker(false, m.text.split(/\n| /i)[0], packname, author)
else return
}
if (stiker) {
await this.sendFile(m.chat, stiker, null, { asSticker: true })
}}
return !0
}
export default handler

const isUrl = (text) => {
return text.match(new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'))}
