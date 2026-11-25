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
import fs from 'fs';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.search_pinterest
 if (!text) return conn.sendMessage(m.chat, { text: `${tradutor.texto1[0]}${usedPrefix + command}${tradutor.texto1[1]}` }, { quoted: m });
 try {
 let { data } = await axios.get(`${global.APIs.stellar}/search/pinterest?query=${text}&apikey=${global.APIKeys[global.APIs.stellar]}`);
 let images = data.data;
 let push = [];
 for (let i = 0; i < images.length; i++) {
 let image = images[i];
 push.push({ 
 body: proto.Message.InteractiveMessage.Body.fromObject({ text: `${tradutor.texto2}${i + 1}\n` }), 
 footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: global.pickbot }), 
 header: proto.Message.InteractiveMessage.Header.fromObject({ 
 title: tradutor.texto4, 
 hasMediaAttachment: true, 
 imageMessage: await generateWAMessageContent({ image: { url: image.mini } }, { upload: conn.waUploadToServer }).then(res => res.imageMessage) 
 }), 
 nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
 buttons: [ 
 { 
 "name": "cta_url", 
 "buttonParamsJson": `{"display_text":"${tradutor.texto3}","url":"${image.hd}","merchant_url":"${image.hd}"}` 
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
 body: proto.Message.InteractiveMessage.Body.create({ text: tradutor.texto4 }), 
 footer: proto.Message.InteractiveMessage.Footer.create({ text: `${tradutor.texto5[0]}${text}${tradutor.texto5[1]}${global.db.data.users[m.sender].name}` }), 
 header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }), 
 carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [ ...push ] }) 
  }) 
 } 
} 
}, { quoted: m });
 await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
 } catch (error) {
 console.error(error);
 conn.sendMessage(m.chat, { text: tradutor.texto6 }, { quoted: m });
 }
};

handler.help = ['pinterest'];
handler.tags = ['search'];
handler.command = ['pinterest', 'pin'];

export default handler;
