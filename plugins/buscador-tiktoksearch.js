// Codigo hecho para The Mystic - Bot - MD por https://github.com/BrunoSobrino
// By @BrunoSobrino
import axios from 'axios';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;

let handler = async (message, { conn, text }) => {
    if (!text) return conn.sendMessage(message.chat, { text: '[❗] ¿Qué quieres buscar en TikTok?' }, { quoted: message });

    try {
        //conn.sendMessage(message.chat, { text: global.wait }, { quoted: message });
        let response = await tiktokSearch(text);
        if (!response.status) throw new Error(response.resultado);
        let searchResults = response.resultado;
        shuffleArray(searchResults);
        let selectedResults = searchResults.slice(0, 7);
        let videoMessages = await Promise.all(selectedResults.map(result => createVideoMessage(result.videoUrl, conn)));
        let results = videoMessages.map((videoMessage, index) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `*❧ By ${global.wm}*` }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: selectedResults[index].description, hasMediaAttachment: true, videoMessage: videoMessage
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        }));
        const responseMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `*< TIKTOK SEARCH >*\n\n` + `📌 *Texto buscado:* ${text}\n\n` + `📈 *Resultados obtenidos:*` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: '' }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: results })
                    })
                }
            }
        }, { quoted: message });
        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });
    } catch (error) {
        await conn.sendMessage(message.chat, { text: error.toString() }, { quoted: message });
    }
};
handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = /^(tiktoksearch|tiktoks)$/i;
export default handler;

async function tiktokSearch(query) {
    try {
        const response = await axios.post("https://tikwm.com/api/feed/search", new URLSearchParams({keywords: query, count: '10', cursor: '0', HD: '1'}), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                Cookie: "current_language=en",
                "User-Agent": "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            }
        });
        const videos = response.data.data.videos;
        if (videos.length === 0) return {status: false, resultado: "No se encontraron videos."};
        return {
            status: true,
            resultado: videos.map(v => ({
                description: v.title ? v?.title : "Sin descripción",
                videoUrl: v.play ? v.play : "Sin URL"
            }))
        };
    } catch (error) {
        return { status: false, resultado: error.message };
    }
}

async function createVideoMessage(url, conn) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = response.data;
        const { videoMessage } = await generateWAMessageContent({ video: buffer }, { upload: conn.waUploadToServer });
        return videoMessage;
    } catch (error) {
        throw new Error(`Error al crear el mensaje de video: ${error.message}`);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/*import axios from 'axios'
const {proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice} = (await import("baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {
if (!text) return conn.reply(message.chat, '[❗️] *¿Que quieres buscar en tiktok?*', message)
async function createVideoMessage(url) {
const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer })
return videoMessage
}
async function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[array[i], array[j]] = [array[j], array[i]]
}
}
try {
let results = []
let { data: response } = await axios.get('https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=' + text)
let searchResults = response.data
shuffleArray(searchResults)
let selectedResults = searchResults.splice(0, 7)
for (let result of selectedResults) {
results.push({
body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: wm }),
header: proto.Message.InteractiveMessage.Header.fromObject({
title: '' + result.title,
hasMediaAttachment: true,
videoMessage: await createVideoMessage(result.nowm)
}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })})}
const responseMessage = generateWAMessageFromContent(message.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({ text: '[❗️] Resultado de: ' + text }),
footer: proto.Message.InteractiveMessage.Footer.create({ text: '🔎 `T I K T O K - S E A R C H`' }),
header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })})}}
}, { quoted: message })
await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id })
} catch (error) {
await conn.reply(message.chat, error.toString(), message)
}}

handler.help = ['tiktoksearch <txt>']
handler.tags = ['buscador']
handler.command = ['tiktoksearch', 'tiktoks']
export default handler*/
