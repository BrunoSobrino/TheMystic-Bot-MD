import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import {
    Sticker,
    StickerTypes
} from 'wa-sticker-formatter'
import { sticker } from '../lib/sticker.js'

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
    var out
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = await conn.getName(who)
    let [atas, bawah] = text.split(/[^\w\s]/g)

        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        if (/video/g.test(mime)) {
            if ((q.msg || q).seconds > 11) return m.reply('10 ثوان كحد أقصى!')
            }
        if (!/webp|image|video|gif|viewOnce/g.test(mime)) return m.reply(`المرجو الاشارة للصورة التي تريد ان تصنع منها ملصق ميمز  \n\nمثال :\n.smeme bobiza|bot`)
        let img = await q.download?.()
        let meme = "https://api.memegen.link/images/custom/" + encodeURIComponent(atas ? atas : '_') + "/" + encodeURIComponent(bawah ? bawah : '_') + ".png?background="

        if (/webp/g.test(mime)) {
            out = await createSticker(meme + await webp2png(img), false, packname, name, 60)
        } else if (/image/g.test(mime)) {
            out = await createSticker(meme + await uploadImage(img), false, packname, name, 60)
        } else if (/video/g.test(mime)) {
            out = await sticker(meme + await uploadFile(img), false, packname, name)
        } else if (/gif/g.test(mime)) {
            out = await createSticker(meme + await uploadFile(img), false, packname, name, 60)
        } else if (/viewOnce/g.test(mime)) {
            out = await createSticker(meme + await uploadFile(img), false, packname, name, 60)
        }
        
        m.reply(wait)
        if (out) {
        m.reply(out)
        } else {
        throw 'error'
        }

}
handler.help = ['smeme']
handler.tags = ['sticker']
handler.command = /^smeme$/i

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}

async function createSticker(img, url, packName, authorName, quality) {
    let stickerMetadata = {
        type: StickerTypes.FULL,
        pack: packName,
        author: authorName,
        quality
    }
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}

async function createStickerV(img, url, packName, authorName, quality) {
    let stickerMetadata = {
        type: StickerTypes.CROPPED,
        pack: packName,
        author: authorName,
        quality
    }
    return (new Sticker(img ? img : url, stickerMetadata)).toBuffer()
}
