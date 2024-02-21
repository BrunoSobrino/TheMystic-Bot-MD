import fetch from "node-fetch"
import got from "got"
import cheerio from "cheerio"
import {
    instagram
} from "@xct007/frieren-scraper"

let handler = async (m, {
    command,
    usedPrefix,
    conn,
    text,
    args
}) => {

    let lister = [
        "v1",
        "v2",
        "v3"

    ]
let spas = "                "
    let [feature, inputs, inputs_, inputs__, inputs___] = text.split(" ")
    if (!lister.includes(feature.toLowerCase())) return m.reply("*Example:*\n" + usedPrefix + command + " v2 link\n\n*Pilih type yg ada*\n" + lister.map((v, index) => "  ○ " + v.toUpperCase()).join("\n"))

    if (lister.includes(feature)) {
        if (feature == "v1") {
            if (!inputs) return m.reply("Input query link")
            m.reply(wait)
                try {
                let results = await instagram.v1(inputs)

                let caption = `*[ I N S T A G R A M ]*`
                let out = results[0].url
                await m.reply(wait)
                await conn.sendFile(m.chat, out, "", caption, m)
            } catch (e) {
                await m.reply(eror)
            }
        }
        if (feature == "v2") {
            if (!inputs) return m.reply("Input query link")
            m.reply(wait)
                try {
                let results = await (await fetch("https://fantox001-scrappy-api.vercel.app/instadl?url=" + inputs)).json()

                let caption = `*[ E S S A O U I D I B O T ]*`
                let out = results.videoUrl

                await m.reply(wait)
                await conn.sendFile(m.chat, out, "", caption, m)
            } catch (e) {
                await m.reply(eror)
            }

        }
        if (feature == "v3") {
            if (!inputs) return m.reply("Input query link")
            m.reply(wait)
                try {
                let results = await igDownload(inputs)

                let caption = `*[ E S S A O U I D I B O T ]*`
                let out = results
                await m.reply(wait)
                await conn.sendFile(m.chat, out, "", caption, m)
            } catch (e) {
                await m.reply(eror)
            }

        }
        

    }
}
handler.help = ['instagram']
handler.tags = ['downloader']
handler.command = /^ig|instagram$/i

export default handler

async function igDownload(url) {
return await got(url)
  .then(response => {
    const $ = cheerio.load(response.body);
    const metaTags = $('meta[property="og:video:secure_url"]').attr('content');
    return metaTags;
  })
  }
