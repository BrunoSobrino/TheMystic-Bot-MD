import fetch from 'node-fetch';

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw "> *Hola, soy un servicio `Black Box Ai` un servicio capaz de programar códigos en todos los lenguajes y resolver problemas de programación, por ejemplo :*\n\n- #iabox Cómo hacer una página de inicio de sesión con `html`";

  try {
 
    var apii = await fetch(`https://zoro-apis2-0a5bc82f5275.herokuapp.com/api/ai/blackbox?text=${text}&apikey=Zoro3mk`);
    var res = await apii.json();

    if (res.result && text.trim().length > 0) {
      await conn.sendFile(m.chat, 'https://telegra.ph/file/34bd1de01d59fb18833cc.jpg', 'image.png', res.result, m, { caption: text });
    } else if (res.result) {
      await conn.sendFile(m.chat, 'https://telegra.ph/file/34bd1de01d59fb18833cc.jpg', res.result, m);
    } else {
      throw '> *Error ⚠️*';
    }

  } catch (error) {
    console.error(error);
    throw '> *Mewing time 🤫🧏🏻‍♂️ (API ERROR)*';
  }
};

handler.command = ['bb', 'blackbox', 'iabox'];
handler.help = ['blackbox'];
handler.tags = ['herramientas'];
export default handler;

// By Saad - @nm9h
// Thanks for Zoro API