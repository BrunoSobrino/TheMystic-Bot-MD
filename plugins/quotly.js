import axios from "axios"
import {
    sticker
} from "../lib/sticker.js"
import wibusoft from "wibusoft"

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = await conn.getName(who)
    let reply
    if (text && m.quoted) {
        if (m.quoted.text || m.quoted.sender) {
            reply = {
                "name": await conn.getName(m.quoted.sender),
                "text": m.quoted.text || '',
                "chatId": m.chat.split('@')[0],
            };
        }
    } else if (text && !m.quoted) {
        reply = {};
    } else if (!text && m.quoted) {
        if (m.quoted.text) {
            text = m.quoted.text || '';
        }
        reply = {};
    } else {
        throw "مثال :\n\n*.quotly essaouidi bot* \n\nأو هــكــذا \n\n*.quotlyv2 essaouidi bot* \n\nاو هــكـذا \n\n*.quotlyv3 essaouidi bot*";
    }

    await m.reply(wait)
    let pp = await conn.profilePictureUrl(m.sender, "image").catch(_ => logo)
    let temas
    if (command == "quotly") {
        temas = "terang"
    }
    if (command == "quotlyv2") {
        temas = "gelap"
    }
    if (command == "quotlyv3") {
        temas = "random"
    }
    let result = await Quotly(name, pp, text, temas, reply)
    try {
        let out = await wibusoft.tools.makeSticker(result, {
            author: packname,
            pack: name,
            keepScale: true
        })
        await m.reply(out)
    } catch (e) {
        let stick = await sticker(buffer, false, name, packname)
        await conn.sendFile(m.chat, stick, "Quotly.webp", "", m)
    }
}

handler.help = ["quotly", "quotlyv2", "quotlyv3"]
handler.tags = ["sticker"]
handler.command = ["quotly", "quotlyv2", "quotlyv3"]

export default handler

async function Quotly(a, b, c, d, reply) {
    let obj;

    if (d == "terang") {
        obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#FFFFFF",
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: a,
                    photo: {
                        url: b
                    }
                },
                text: c,
                replyMessage: reply
            }]
        };
    } else if (d == "random") {
        obj = {
            type: "quote",
            format: "png",
            backgroundColor: getRandomHexColor().toString(),
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: a,
                    photo: {
                        url: b
                    }
                },
                text: c,
                replyMessage: reply
            }]
        };
    } else if (d == "gelap") {
        obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#1b1429",
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: a,
                    photo: {
                        url: b
                    }
                },
                text: c,
                replyMessage: reply
            }]
        };
    }

    let json;

    try {
        json = await axios.post("https://qc.sazumi.moe/generate", obj, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        return e;
    }

    const results = json.data.result.image;
    const buffer = Buffer.from(results, "base64");
    return buffer;
}

function getRandomHexColor() {
    const randomColor = () => Math.floor(Math.random() * 200).toString(16).padStart(2, "0");
    return `#${randomColor()}${randomColor()}${randomColor()}`;
}
