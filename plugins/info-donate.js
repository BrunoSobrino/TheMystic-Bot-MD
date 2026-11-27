import fs from 'fs';
/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

const handler = async (m, { conn, usedPrefix, command }) => {
 try {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_donate
   const donar = `${tradutor.texto1[0]}${m?.name}${tradutor.texto1[1]}`.trim();

   // Antes se mandaba como documento falso (una URL de GitHub como
   // "documento", con mimetype aleatorio y fileLength inventado): en varios
   // dispositivos no se veía nada. Ahora es un mensaje de texto normal con
   // la misma tarjeta de vista previa (externalAdReply).
   const buttonMessage = {
     'text': donar,
     'contextInfo': {
       'forwardingScore': 200,
       'isForwarded': true,
       'mentionedJid': conn.parseMention(donar),
       'externalAdReply': {
         'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
         'mediaType': 2,
         'previewType': 'pdf',
         'title': tradutor.texto3,
         'body': wm,
         'thumbnail': imagen1,
         'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
   };
   
   conn.sendMessage(m.chat, buttonMessage, {quoted: m});
   
 } catch {
   const simpleMsg = `${tradutor.texto2[0]}${m?.name}${tradutor.texto2[1]}`;
   
   m.reply(simpleMsg);
 }
};
handler.help = ['donate'];
handler.tags = ['info'];
handler.command = /^(donate|donar|apoyar|donación|donacion|apoyo|ayuda|colaborar|contribuir)$/i
export default handler;
