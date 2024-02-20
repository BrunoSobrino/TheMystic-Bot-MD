import axios from "axios"
import fetch from "node-fetch"
import cheerio from "cheerio"
import {
    JSDOM
} from "jsdom"

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    text,
    command
}) => {
    if (!text) throw "هذا الامر خاص بعمل شعارات باسمك \nمثال:\n*.brandcrowd* essaouidi"
    try {
            await m.reply(wait)
            let res = await BrandCrowd(text)
            let rdm = res[Math.floor(Math.random() * res.length)];
            await conn.sendMessage(m.chat, {
                image: {
                    url: rdm
                }, caption: "[ النتيجة ]"
            }, {
                quoted: m
            })

    } catch (e) {
        throw eror
    }
}
handler.help = ["brandcrowd"]
handler.tags = ["logo"]
handler.command = /^brandcrowd$/i

export default handler

/* New Line */
async function BrandCrowd(query) {
let res = await fetch('https://www.brandcrowd.com/maker/logos/page1?Text=' +query+ '&TextChanged=true&SearchText&KeywordChanged=true&LogoStyle=0&FontStyles&Colors&FilterByTags')
    let html = await res.text()
    let dom = new JSDOM(html)
    var collection = dom.window.document.getElementsByTagName('img');
    let img = []
for (var i = 0; i < collection.length; i++) {
	if (collection[i].getAttribute('src').startsWith('https://dynamic.brandcrowd.com')) {
	img.push(collection[i].getAttribute('src'))
	}
}
let newArr = img.filter(el => el != null);
return newArr
}
