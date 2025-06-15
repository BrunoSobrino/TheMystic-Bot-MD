import fetch from 'node-fetch';
import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys';

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `[ ❗ ] Ingresa un término de búsqueda.`, m);

  const pinterestAPI = `https://api.stellarwa.xyz/search/pinterest?query=${text}`;

  try {
    const res = await fetch(pinterestAPI);
    if (!res.ok) {
      throw new Error(`La API devolvió un código de error: ${res.status}`);
    }

    const jsons = await res.json();
    const json = jsons.data;

    if (!json || json.length === 0) {
      return conn.reply(m.chat, `[ ❕ ] No se encontraron resultados para "${text}".`, m);
    }

    const selectedResults = json.slice(0, 5);

    let results = selectedResults.map((result, index) => ({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `*❧ By ${global.wm}*` }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: result.description || `Imagen ${index + 1}`,
        hasMediaAttachment: true,
        imageMessage: {
          url: result.hd
        }
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
    }));

    const responseMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `*< Pinterest Search >*\n\n📌 *Texto buscado:* ${text}\n\n📈 *Resultados obtenidos:*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: '' }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: results })
          })
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id });

  } catch (e) {
    await m.reply(`[ ❌ ] Error, intenta nuevamente.`);
    console.error(e);
  }
};

handler.help = ['pinterest', 'pin'];
handler.tags = ['download'];
handler.command = ['pinterest', 'pin'];

export default handler;