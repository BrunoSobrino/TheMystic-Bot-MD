/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

/* ⚠ POR FAVOR NO MODIFIQUES NADA DE AQUÍ ⚠ */

import {generateWAMessageFromContent} from "baileys";

const handler = async (m, {conn, usedPrefix, command}) => {
 try {
   const name = await conn.getName(m.sender);
   
   const donar = `╭─「 💖 *DONACIONES* 💖 」
│
│ ¡Hola *${name}*! 👋
│
│ ¿Te gusta este bot? 🤖✨
│ ¡Ayúdanos a mantenerlo activo!
│
├─「 🎯 *¿Por qué donar?* 」
│
│ • Mantener el servidor activo 🖥️
│ • Agregar nuevas funciones 🆕
│ • Mejorar la velocidad ⚡
│ • Soporte 24/7 🕐
│
├─「 💳 *Métodos de donación* 」
│
│ • PayPal: paypal.me/BrunoSob 💰
│
│ 💬 *Otras formas:*
│ Contáctame: @5219996125657
│
│ 📝 *Nota:* Toda donación
│ nos ayuda a crecer juntos 🌱
│
╰─「 ¡Gracias por tu apoyo! 🙏 」`.trim();

   const aa = { quoted: m, userJid: conn.user.jid };
   const res = generateWAMessageFromContent(m.chat, { 
     liveLocationMessage: { 
       degreesLatitude: 0, 
       degreesLongitude: 0, 
       caption: donar, 
       secuenceNumber: '0', 
       contextInfo: { 
         mentionedJid: conn.parseMention(donar)
       }
     }
   }, aa);
   
   conn.relayMessage(m.chat, res.message, {});
   
 } catch (error) {
   console.error('Error in donate handler:', error);
   // Mensaje alternativo simple si falla el formato especial
   const name = await conn.getName(m.sender);
   const simpleMsg = `💖 *DONACIONES*

¡Hola *${name}*! 

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

handler.help = ['donar'];
handler.tags = ['info'];
handler.command = ['donate', 'donar', 'apoyar'];
export default handler;
