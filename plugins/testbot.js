import fs from 'fs'
import fetch from 'node-fetch'
let handler  = async (m, { conn, usedPrefix: _p }) => {
let info = `الســويدي يـاسين متصل الان بالانترنيت \nيمكنك كتابة \n.menu\n لتنبتق لك جميع الاوامر \n@${m.sender.split('@')[0]} \n`
await conn.reply(m.chat, info, m, { contextInfo: { mentionedJid: [m.sender],forwardingScore: 80,
      isForwarded: true, externalAdReply: { title: author, body: bottime,thumbnail: fs.readFileSync('./thumbnail.jpg') }}})
      await conn.sendMessage(m.chat, {
        audio: {
            url: "Essaouidi.mp3"
        },
        seconds: 80,
        ptt: true,
        mimetype: "audio/mpeg",
        fileName: "vn.mp3",
        waveform: [100, 0, 100, 0, 100, 0, 100]
    }, {
        quoted: m
    })
}
handler.customPrefix = /^(tes|سلام|menu|Menu|apk|ياسين|bobizaty|♥|salam|hy|Hello|.|شكرا|مرحبا)$/i
handler.command = new RegExp

export default handler
