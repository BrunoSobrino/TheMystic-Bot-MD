import axios from 'axios';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;

let handler = async (m, { conn, text }) => {
    if (!text) return conn.sendMessage(m.chat, { text: '[❗] Ingresa un texto para la búsqueda en Pinterest.' }, { quoted: m });

    try {
        let response = await pinterestSearch(text);
        if (!response.status) throw new Error(response.resultado);
        let searchResults = response.resultado;

        shuffleArray(searchResults);
        let selectedResults = searchResults.slice(0, 5);

        let imageCards = await Promise.all(
            selectedResults.map(async (result, index) => ({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: `\nRESULTADO: ${index + 1}\n` }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `*❧ By ${global.wm}*` }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: result.description || `Imagen ${index + 1}`,
                    hasMediaAttachment: true,
                    imageMessage: await createImage(result.imageUrl, conn)
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{"display_text":"Enlace","url":"https://www.pinterest.com/search/pins/?rs=typed&q=${text}"}`
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": `{"display_text":"Página Web","url":"https://www.pinterest.com/"}`
                        }
                    ]
                })
            }))
        );

        const responseMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: "「 ✰ 」INFORMACIÓN DE BÚSQUEDA"
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `✰ *Término:* ${text}\n✰ *Usuario:* ${m.pushName}`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: imageCards })
                    })
                }
            }
        });

        await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id });

    } catch (error) {
        await conn.sendMessage(m.chat, { text: `[❗] Error: ${error.message}` }, { quoted: m });
    }
};

handler.help = ['pinterestsearch', 'pinsearch'];
handler.tags = ['search'];
handler.command = ['pinterestsearch', 'pinsearch'];
export default handler;

async function pinterestSearch(query) {
    try {
        const response = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${query}`);
        const images = response.data.data;
        if (!images || images.length === 0) return { status: false, resultado: "No se encontraron imágenes." };

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

async function createImage(url, conn) {
    try {
        const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: conn.waUploadToServer });
        return imageMessage;
    } catch (error) {
        throw new Error(`Error al crear el mensaje de imagen: ${error.message}`);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}