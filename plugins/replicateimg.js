import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'
import Replicate from 'replicate'

let handler = async (m, {
    conn,
    usedPrefix,
    args,
    text,
    command
}) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw 'قم بالاشارة لصورة ما واكتب الامر'
    let media = await q.download()
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    let link = await (isTele ? uploadImage : uploadFile)(media)
    let model =
        "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478"
    if (link) {
        await m.reply(wait)
        let hasil = await imgReplicate(link, model, "3a4886dd3230e523600d3b555f651dc82aba3a4e")
        await conn.sendFile(m.chat, hasil[0], "result", "النتيجة صورة عشوائية من الذكاء الاصطناعي:\n", m)
    } else throw 'error'
}
handler.help = ['replicateimg']
handler.tags = ['drawing']
handler.command = /^replicateimg$/i
export default handler


async function imgReplicate(img, models, ApiKey) {
    const replicate = new Replicate({
        auth: ApiKey
    })
    const input = {
        img: img
    }
    const output = await replicate.run(models, {
        input
    })
    return output
}
