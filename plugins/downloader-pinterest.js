import axios from 'axios';
const { proto, generateWAMessageFromContent } = (await import("baileys")).default;

let handler = async (message, { conn, text }) => {
    if (!text) return conn.sendMessage(message.chat, { text: '[❗] ¿Qué quieres buscar en Pinterest?' }, { quoted: message });

    try {
        let response = await pinterestSearch(text);
        if (!response.status) throw new Error(response.resultado);
        let searchResults = response.resultado;
        shuffleArray(searchResults);
        let selectedResults = searchResults.slice(0, 5);

        let imageCards = selectedResults.map((result, index) => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `*❧ By ${global.wm}*` }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: result.description || `Imagen ${index + 1}`,
                hasMediaAttachment: true,
                imageMessage: { url: result.imageUrl }
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
                        body: proto.Message.InteractiveMessage.Body.create({ text: `*< Pinterest Search >*\n\n📌 *Texto buscado:* ${text}\n\n📈 *Resultados obtenidos:*` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: '' }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: imageCards })
                    })
                }
            }
        }, { quoted: message });

        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });

    } catch (error) {
        await conn.sendMessage(message.chat, { text: error.toString() }, { quoted: message });
    }
};

handler.help = ['pinterest <txt>'];
handler.tags = ['download'];
handler.command = /^(pinterest|pin)$/i;
export default handler;

async function pinterestSearch(query) {
    try {
        const response = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${query}`);
        const images = response.data.data;
        if (images.length === 0) return { status: false, resultado: "No se encontraron imágenes." };
        return {
            status: true,
            resultado: images.map(img => ({
                description: img.title || "Sin descripción",
                imageUrl: img.hd
            }))
        };
    } catch (error) {
        return { status: false, resultado: error.message };
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}