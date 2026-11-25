import fs from 'fs';
/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

const handler = async (m, { conn, usedPrefix, command }) => {
 try {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.info_donate
   const donar = `${tradutor.texto1[0]}${m?.name}${tradutor.texto1[1]}`.trim();

   const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
   const document = doc[Math.floor(Math.random() * doc.length)];
   
   const buttonMessage = {
     'document': {url: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`},
     'mimetype': `application/${document}`,
     'fileName': tradutor.texto4,
     'fileLength': 99999999999999,
     'pageCount': 200,
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
     'caption': donar,
     'footer': wm,
     'headerType': 6
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
