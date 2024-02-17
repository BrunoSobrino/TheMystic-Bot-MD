import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import {
    webp2png
} from '../lib/webp2mp4.js'
import fetch from 'node-fetch'

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
    var out

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/video/g.test(mime)) {
        if ((q.msg || q).seconds > 11) return m.reply('يجب الا يتجاوز الفيديو 11 ثانية')
    }
    if (!/webp|image|video|gif|viewOnce/g.test(mime)) return m.reply(`*هذا الأمر خاص بفحص الصور واستخراج النص الموجود فيها. بلغة اخرى لديك صورة وتريد ان تستخرج ذلك النص الموجود فيها يكفي ان ترسل للبوت الصورة ثم تشير لها وتكتب*\n\n${usedPrefix + command}`)
    let img = await q.download?.()

    if (/webp/g.test(mime)) {
        out = (await webp2png(img))
    } else if (/image/g.test(mime)) {
        out = (await uploadImage(img))
    } else if (/video/g.test(mime)) {
        out = (await uploadFile(img))
    } else if (/gif/g.test(mime)) {
        out = (await uploadFile(img))
    } else if (/viewOnce/g.test(mime)) {
        out = (await uploadFile(img))
    }
    await m.reply(wait)
    try {
        let res
        if (args[0]) {
            res = await (await fetch("https://api.ocr.space/parse/imageurl?apikey=helloworld&url=" + out + "&language=" + args[0])).json()
        } else {
            res = await (await fetch("https://api.ocr.space/parse/imageurl?apikey=helloworld&url=" + out)).json()
        }
        await m.reply("\n\n" + res.ParsedResults[0].ParsedText)
    } catch (e) {
        throw 'حذثت مشكلة راسل صاحب البوت'
    }
}
handler.help = ['ocr']
handler.tags = ['tools']
handler.command = /^(ocr|texte)$/i
export default handler
