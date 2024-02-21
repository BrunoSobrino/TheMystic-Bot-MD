import {
    aiovideodl
} from '@bochilteam/scraper'

let handler = async (m, { conn, args, usedPrefix, command }) => {

try {
if (!args[0]) throw `Use example ${usedPrefix}${command} https://vt.tiktok.com/ZSdDyUHcR/https://www.tiktok.com/@kata__kasar/video/7088823247373946138'`
const { title, medias } = await aiovideodl(args[0])
for (const { url, quality, formattedSize} of medias) await conn.sendFile(m.chat, url, 'save.mp4', `*AIOVIDEO DOWNLOADER*\n\n${title ? `*Title:* ${title}` : "NotFound"}\n*💽Format:* ${quality ? `${quality}` : "Unknown"}\n*📨Size:* ${formattedSize ? `${formattedSize}` : "countless" }\n`, m)
} catch (e) {
m.reply("Eror")
}
}
handler.help = ['aiovideo'].map(v => v + ' <url>')
handler.tags = ['downloader']

handler.command = /^(aio(video)?(dl)?)$/i

export default handler
