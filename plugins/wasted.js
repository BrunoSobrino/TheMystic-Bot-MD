
import uploadImage from '../lib/uploadImage.js'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
 try {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw 'قم بالاشارة للصورة'
  if (!/image\/(jpe?g|png)/.test(mime)) throw 'Mime ${mime} غير مدعوم'
  let img = await q.download?.()
  let url = await uploadImage(img)
  let wasted = `https://some-random-api.com/canvas/wasted?avatar=${url}`
  let stiker = await sticker(null, wasted, packname, author)
  conn.sendFile(m.chat, stiker, 'wasted.webp', '', m)
 } catch (e) {
   m.reply('راجاء قم بالاشارة لصورة ثم اكتب \n.wasted')
  }
}
handler.help = ['wasted']
handler.tags = ['sticker']
handler.command = /^wasted$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

export default handler
