// Codigo hecho para The Mystic - Bot - MD por https://github.com/BrunoSobrino
// By @BrunoSobrino
import axios from 'axios';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;

let handler = async (message, { conn, text }) => {
    if (!text) return conn.sendMessage(message.chat, { text: '[❗] ¿Qué quieres buscar en TikTok?' }, { quoted: message });
    
    try {
        const processingMsg = await conn.sendMessage(message.chat, { text: '*[🔍] Buscando en TikTok, espere...*' }, { quoted: message });
        let response = await tiktokSearch(text);
        if (!response.status) throw new Error(response.resultado);
        let searchResults = response.resultado;
        if (searchResults.length === 0) throw new Error('*[❗] No se encontraron videos válidos de tiktok.*');
        let selectedResults = getRandomElements(searchResults, Math.min(searchResults.length, 10));
        
        const BATCH_SIZE = 2;
        const RETRY_ATTEMPTS = 2;
        let videoMessages = [];
        let successfulCount = 0;
        for (let i = 0; i < selectedResults.length; i += BATCH_SIZE) {
            const batch = selectedResults.slice(i, i + BATCH_SIZE);
            for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
                try {
                    const batchMessages = await Promise.all(batch.map(result => createVideoMessage(result.videoUrl, conn) ));
                    videoMessages.push(...batchMessages);
                    successfulCount += batchMessages.length;
                    break; 
                } catch (batchError) {
                    if (attempt === RETRY_ATTEMPTS) {
                        console.error(`Error procesando lote ${i/BATCH_SIZE + 1}:`, batchError);
                    }
                }
            }
        }
        const validVideos = videoMessages.filter(Boolean);
        if (validVideos.length === 0) throw new Error('*[❗] No se pudieron cargar los videos.*');
        const results = validVideos.map((videoMessage, index) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `*❧ By ${global.wm}*`.trim() }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: selectedResults[index].description || "Video de TikTok",
                hasMediaAttachment: true,
                videoMessage: videoMessage
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
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: `*< TIKTOK SEARCH >*\n\n📌 *Texto buscado:* ${text}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: '' }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ 
                            cards: results 
                        })
                    })
                }
            }
        }, { quoted: message });

        await conn.sendMessage(message.chat, { delete: processingMsg.key });
        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });
        
    } catch (error) {
        await conn.sendMessage(message.chat, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: message });
    }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['search'];
handler.command = /^(tiktoksearch|tiktoks)$/i;
export default handler;

async function tiktokSearch(query, maxRetries = 3) {
    let retries = 0;
    let lastError = null;
    while (retries < maxRetries) {
        try {
            const response = await axios.post("https://tikwm.com/api/feed/search", 
                new URLSearchParams({
                    keywords: query, 
                    count: '30',  
                    cursor: '0', 
                    HD: '1'
                }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Cookie: "current_language=en",
                    "User-Agent": "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                },
                timeout: 10000
            });
            const videos = response.data?.data?.videos || [];
            if (videos.length === 0) {
                retries++;
                lastError = "No se encontraron videos.";
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                continue;
            }
            return {
                status: true,
                resultado: videos.map(v => ({
                    description: v.title ? v.title.slice(0, 200) : "Sin descripción", 
                    videoUrl: v.play ? v.play : (v.wmplay || v.hdplay || "Sin URL")
                })).filter(v => v.videoUrl !== "Sin URL") 
            };
        } catch (error) {
            retries++;
            lastError = error.message;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
    return { status: false, resultado: lastError || "Error después de varios intentos" };
}

async function createVideoMessage(url, conn, timeout = 15000) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: timeout });
        if (!response.data || response.data.length === 0) throw new Error('Video vacío o no disponible');
        const { videoMessage } = await generateWAMessageContent({ video: response.data }, { upload: conn.waUploadToServer });
        return videoMessage;
    } catch (error) {
        return null;
    }
}

function getRandomElements(array, count) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}
