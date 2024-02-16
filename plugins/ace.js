import fetch from "node-fetch"
import {
    generateWAMessageFromContent
} from "@adiwajshing/baileys"
let handler = async (m, {
    conn,
    text
}) => {
    if (!text) throw "هذا الامر خاص بالبحث في اليوتوب مثلا \n*.ace* Essaouidi Yassine "
    const regex = /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+$/;
const isMatch = regex.test(text);

if (isMatch) {
let ress = await(await fetch("https://backendace.1010diy.com/web/free-mp3-finder/detail?url=" + text)).json()
    let res = ress.data
  let teks = res.audios.map((item, index) => {
                return `*[ AUDIO ${index + 1} ]*
*Format:* ${item.ext}
*Size:* ${item.fileSize}
*Url:* ${item.url.replace("/download?url=", "")}
*Note:* ${item.formatNote}
*HD:* ${item.hd ? 'Ya' : 'Tidak'}
*Pro:* ${item.pro ? 'Ya' : 'Tidak'}
   `.trim()
            }).filter(v => v).join("\n\n________________________\n\n")
            let teks2 = res.videos.map((item, index) => {
                return `*[ VIDEO ${index + 1} ]*
*Format:* ${item.ext}
*Size:* ${item.fileSize}
*Url:* ${item.url.replace("/download?url=", "")}
*Note:* ${item.formatNote}
*HD:* ${item.hd ? 'Ya' : 'Tidak'}
*Pro:* ${item.pro ? 'Ya' : 'Tidak'}
   `.trim()
            }).filter(v => v).join("\n\n________________________\n\n")
            await m.reply(teks + "\n\n" + teks2)
} else {
  let ress = await(await fetch("https://backendace.1010diy.com/web/free-mp3-finder/query?q=" + text + "&type=youtube&pageToken=")).json()
    let res = ress.data
    let teks = res.items.map((item, index) => {
                return `*[ RESULT ${index + 1} ]*

*Title:* ${item.title}
*Url:* ${item.url}
*Duration:* ${item.duration}
*View:* ${item.viewCount}

*Description:* ${item.description}
*Published:* ${item.publishedAt}
` }).filter(v => v).join("\n\n________________________\n\n")
    
        let ytthumb = await (await conn.getFile(res.items[0].thumbnail)).data
        let msg = await generateWAMessageFromContent(m.chat, {
            extendedTextMessage: {
                text: teks,
                jpegThumbnail: ytthumb,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        body: "S E A R C H",
                        containsAutoReply: true,
                        mediaType: 1,
                        mediaUrl: res.items[0].url,
                        renderLargerThumbnail: true,
                        showAdAttribution: true,
                        sourceId: "WudySoft",
                        sourceType: "PDF",
                        previewType: "PDF",
                        sourceUrl: res.items[0].url,
                        thumbnail: ytthumb,
                        thumbnailUrl: res.items[0].thumbnail,
                        title:  + " Y O U T U B E " 
                    }
                }
            }
        }, {
            quoted: m
        })
        await conn.relayMessage(m.chat, msg.message, {})
}
    
}
handler.help = ["ace"]
handler.tags = ["search"]
handler.command = /^(ace)$/i
export default handler

async function shortUrl(url) {
    let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
    return await res.text()
}
