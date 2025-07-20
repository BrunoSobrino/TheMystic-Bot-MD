// Plug test 2
import axios from 'axios';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  if (!text) throw `*¡Por favor ingresa una URL!*\n*Ejemplo:* ${usedPrefix + command} https://www.tiktok.com/@usuario/video/123456789`;
  
  try {
    m.reply(`*Procesando tu solicitud, por favor espera...*`);
    
    const options = {
      method: 'POST',
      url: 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      headers: {
        'x-rapidapi-key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        url: text.trim() 
      }
    };

    const response = await axios.request(options);
    const result = response.data;

    if (result.data?.media) {
      const media = result.data.medias;
      
      if (media.type === 'video') {
        await conn.sendFile(m.chat, media.url, 'social.mp4', '*Video descargado*', m);
      } else if (media.type === 'image') {
        await conn.sendFile(m.chat, media.url, 'social.jpg', '*Imagen descargada*', m);
      } else {
        await conn.sendMessage(m.chat, {text: `*Contenido descargado:*\n${JSON.stringify(result, null, 2)}`}, {quoted: m});
      }
    } else {
      await conn.sendMessage(m.chat, {text: `*Respuesta de la API:*\n${JSON.stringify(result, null, 2)}`}, {quoted: m});
    }
    
  } catch (error) {
    console.error('Error en socialdl:', error);
    throw `*Ocurrió un error al procesar tu solicitud*`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial'];
handler.limit = true;

export default handler;
