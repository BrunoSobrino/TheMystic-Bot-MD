import uploadImage from '../lib/uploadImage.js'

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw '*[❗] یرجی الرد علی صوره*'
  if (mime && mime.startsWith('video/')) {
    throw '_خطأ ، الرد فقط علی الصور_';
  }
  let media = await q.download()
  let isTele = /image\/(png|jpe?g|gif)/.test(mime)
  
  let link = await (isTele ? uploadImage : uploadImage)(media);
  let lr = (`https://api.popcat.xyz/wanted?image=${link}`)
  conn.sendFile(m.chat, lr, 'wanted.png', `*📌 تفضل طلبك*`, m)
}
handler.help = ['wanted']
handler.tags = ['meme']
handler.command = ['مطلوب','المطلوب']

export default handler
