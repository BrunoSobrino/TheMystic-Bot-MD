/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

const handler = async (m, { conn, usedPrefix, command }) => {
 try {   
   const donar = `╭─「 💖 *DONACIONES* 💖 」
│
│ ¡Hola *${m?.name}*! 👋
│
│ ¿Te gusta este proyecto? 🤖✨
│ ¡Ayúdanos a mantenerlo!
│
├─「 💳 *Métodos de donación* 」
│
│ • PayPal: paypal.me/BrunoSob 💰
│
│ 💬 *Otras formas:*
│ Contáctame: @5219996125657
│ Numero: wa.me/5219996125657
│
│ 📝 *Nota:* Toda donación
│ nos ayuda a crecer juntos 🌱
│
╰─「 *¡Gracias por tu apoyo!* 🙏 」`.trim();

   const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
   const document = doc[Math.floor(Math.random() * doc.length)];
   
   const buttonMessage = {
     'document': {url: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`},
     'mimetype': `application/${document}`,
     'fileName': `💖 DONACIONES 💖`,
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
         'title': '💖 DONACIONES - Apoya el proyecto',
         'body': wm,
         'thumbnail': imagen1,
         'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
     'caption': donar,
     'footer': wm,
     'headerType': 6
   };
   
   conn.sendMessage(m.chat, buttonMessage, {quoted: m});
   
 } catch {
   const simpleMsg = `💖 *DONACIONES*

¡Hola *${m?.name}*! 

¿Te gusta este bot? ¡Ayúdanos a mantenerlo activo!

🎯 *¿Por qué donar?*
• Mantener servidor activo
• Nuevas funciones  
• Mejor velocidad
• Soporte 24/7

💳 *Métodos:*
• PayPal: paypal.me/BrunoSob

💬 *Otras formas:*
Contáctame: @5219996125657

¡Gracias por tu apoyo! 🙏`;
   
   m.reply(simpleMsg);
 }
};
handler.help = ['donate'];
handler.tags = ['info'];
handler.command = /^(donate|donar|apoyar|donación|donacion|apoyo|ayuda|colaborar|contribuir)$/i
export default handler;
