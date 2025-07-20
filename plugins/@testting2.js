import axios from 'axios';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*¡Por favor ingresa una URL de Instagram válida!*\n*Ejemplo:* ${usedPrefix + command} https://www.instagram.com/p/Cejemplo/`;
  
  try {
    m.reply(`*Procesando tu solicitud, por favor espera...*`);
    
    const options = {
      method: 'GET',
      url: 'https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/',
      params: {
        url: text.trim() 
      },
      headers: {
        'x-rapidapi-key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const result = response.data;

    if (!result || result.error) {
      throw result?.message || 'La API no devolvió resultados válidos';
    }

    // Construir mensaje con la información obtenida
    let caption = `*Instagram Downloader*\n`;
    if (result.username) caption += `👤 *Usuario:* @${result.username}\n`;
    if (result.caption) caption += `📝 *Descripción:* ${result.caption}\n`;

    // Enviar el contenido multimedia
    if (result.media) {
      if (result.media.includes('.mp4')) {
        await conn.sendMessage(m.chat, {
          video: { url: result.media },
          caption: caption
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: result.media },
          caption: caption
        }, { quoted: m });
      }
    } else {
      throw 'No se encontró contenido multimedia en esta publicación';
    }

  } catch (error) {
    console.error('Error en Instagram Downloader:', error);
    throw `*Error al procesar:* ${error.message || 'Ocurrió un error desconocido'}\n\n*Posibles soluciones:*\n- Verifica que la URL sea correcta\n- Asegúrate que la cuenta no sea privada\n- Intenta con otra publicación`;
  }
};

handler.help = ['instagram <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
