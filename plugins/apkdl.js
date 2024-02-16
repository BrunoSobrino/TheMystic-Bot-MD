import cheerio from 'cheerio';
import fetch from 'node-fetch';
import {
    apkdl,
    apkcombo,
    aptoide
} from '../lib/scraper-apk.js';

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    text,
    command
}) => {

    let lister = [
        "s",
        "d"
    ]

    let [feature, inputs, inputs_, inputs__, inputs___] = text.split("+")
    if (!lister.includes(feature)) return m.reply("هذا الامر خاص بتحميل التطبيقات من موقع \napk-dl.com\nيمكنك تحميل التطبيقات من هذا الامر من خلال كتابة\n*.apkdl s+facebook lite*\nبعد ان تحصل على رابط التطبيق تعود للبوت وتكتب له هذا الامر لتحميله\n*.apkdl d+*(رابط التطبيق) \n\n*لوازم*\n" + lister.map((v, index) => "  ○ " + v).join("\n"))

    if (lister.includes(feature)) {

        if (feature == "s") {
            if (!inputs) return m.reply("مثال : \n.apkdl s+facebook lite")
            await m.reply(wait)
            try {
                let res = await apkdl.search(inputs)
                let teks = res.map((item, index) => {
                    return `🔍 *[ RESULT ${index + 1} ]*
📰 *Title:* ${item.name}
🔗 *Url:* ${item.link}`
                }).filter(v => v).join("\n\n________________________\n\n")
                await m.reply(teks)
            } catch (e) {
                await m.reply('error')
            }
        }

        if (feature == "d") {
            if (!inputs) return m.reply("مثال\n .apkdl d+https://apk-dl.com/smart-media4u-technology-pteltd/shareit.lite")
            try {
                
                let resl = await apkdl.download(inputs)
                
                let cap = "*Name:* " + resl.appname + "\n" + "*Link:* " + resl.link + "\n\n" + wait
                await conn.sendFile(m.chat, resl.img, "", cap, m)
                await conn.sendFile(m.chat, resl.link, resl.appname, null, m, true, {
                    quoted: m,
                    mimetype: "application/vnd.android.package-archive"
                })
            } catch (e) {
                await m.reply('error')
            }
        }
    }
}
handler.help = ["apkdl"]
handler.tags = ["applications"]
handler.command = /^(apkdl)$/i
handler.premium = false
export default handler

/* New Line */
