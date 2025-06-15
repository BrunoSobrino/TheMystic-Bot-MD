const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;
import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.sendMessage(m.chat, { text: `「 ✰ 」INGRESA LO QUE QUIERAS BUSCAR EN *PINTEREST*\n\n*• EJEMPLO:*\n> ${usedPrefix + command} RIN TOHSAKA` }, { quoted: m });
  await conn.sendMessage(m.chat, { text: "「 ✰ 」ESTOY ENVIANDO SUS RESULTADOS..." }, { quoted: m });

  try {
    let { data } = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${text}`);
    let images = data.data;
    let push = [];

    for (let i = 0; i < images.length; i++) {
      let image = images[i];
      push.push({ 
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: `\nRESULTADO: ${i + 1}\n` }), 
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: global.pickbot }), 
        header: proto.Message.InteractiveMessage.Header.fromObject({ 
          title: '「 ✰ 」RESULTADOS ENCONTRADOS', 
          hasMediaAttachment: true, 
          imageMessage: await generateWAMessageContent({ image: { url: image.mini } }, { upload: conn.waUploadToServer }).then(res => res.imageMessage) 
        }), 
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
          buttons: [ 
            { 
              "name": "cta_url", 
              "buttonParamsJson": `{"display_text":"Ver en alta calidad","url":"${image.hd}","merchant_url":"${image.hd}"}` 
            } 
          ] 
        }) 
      });
    }

    let bot = generateWAMessageFromContent(m.chat, { 
      viewOnceMessage: { 
        message: { 
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, 
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({ 
            body: proto.Message.InteractiveMessage.Body.create({ text: "「 ✰ 」INFORMACION" }), 
            footer: proto.Message.InteractiveMessage.Footer.create({ text: `✰ *BUSQUEDA:*\n> ${text}\n\n✰ *USUARIO:*\n> ${m.pushName}` }), 
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }), 
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [ ...push ] }) 
          }) 
        } 
      } 
    }, {});
    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
  } catch (error) {
    console.error(error); conn.sendMessage(m.chat, { text: "「 ✰ 」OCURRIÓ UN ERROR AL PROCESAR SU SOLICITUD" }, { quoted: m });
  }
};

handler.help = ['pinterestdl'];
handler.tags = ['search'];
handler.command = ['pinterestdl', 'pindl'];

export default handler;
