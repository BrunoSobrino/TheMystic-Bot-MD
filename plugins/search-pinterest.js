/* 
/////////////////////////////////

 ☆ Código creado por: GabrielZks
 ☆ GitHub: github.com/glytglobal/
 ☆ Tipo: Buscador de Pinterest (Modo Carrusel)
 ☆ Descripción: Creado específicamente y adaptado
   a las funcionalidades de TheMystic-Bot-MD, prohibida su
   venta, modificación sin autorización explícita y cambios de
   derechos de autor. Creative Commons (2025) -License-.

/////////////////////////////////
*/

const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys"));
import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command, text }) => {
 if (!text) return conn.sendMessage(m.chat, { text: `*_< BUSQUEDAS - PINTEREST />_*\n\n[ ❗️ ] Ingresa un texto para buscar resultados\nEjemplo: ${usedPrefix + command} Gato` }, { quoted: m });
 try {
 let { data } = await axios.get(`${global.APIs.stellar}/search/pinterest?query=${text}&apikey=${global.APIKeys[global.APIs.stellar]}`);
 let images = data.data;
 let push = [];
 for (let i = 0; i < images.length; i++) {
 let image = images[i];
 push.push({ 
 body: proto.Message.InteractiveMessage.Body.fromObject({ text: `\n□ Número de resultado: ${i + 1}\n` }), 
 footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: global.pickbot }), 
 header: proto.Message.InteractiveMessage.Header.fromObject({ 
 title: '*_< BUSQUEDAS - PINTEREST />_*', 
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
 body: proto.Message.InteractiveMessage.Body.create({ text: "*_< BUSQUEDAS - PINTEREST />_*" }), 
 footer: proto.Message.InteractiveMessage.Footer.create({ text: `□ *Busqueda:* ${text}\n□ *Solicitante:* ${global.db.data.users[m.sender].name}` }), 
 header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }), 
 carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [ ...push ] }) 
  }) 
 } 
} 
}, { quoted: m });
 await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
 } catch (error) {
 console.error(error);
 conn.sendMessage(m.chat, { text: "*_< BUSQUEDAS - PINTEREST />_*\n\n[❗] 𝙾𝙲𝚄𝚁𝚁𝙸𝙾 𝚄𝙽 𝙴𝚁𝚁𝙾𝚁 𝙰𝙻 𝙿𝚁𝙾𝙲𝙴𝚂𝙰𝚁 𝚂𝚄 𝚂𝙾𝙻𝙸𝙲𝙸𝚃𝚄𝙳" }, { quoted: m });
 }
};

handler.help = ['pinterest'];
handler.tags = ['search'];
handler.command = ['pinterest', 'pin'];

export default handler;
