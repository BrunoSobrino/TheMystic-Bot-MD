import axios from 'axios';
import { URLSearchParams } from 'url';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*¡Ingresa una URL válida!*\nEjemplo: ${usedPrefix + command} https://www.youtube.com/watch?v=ejemplo`;
  
  try {
    await m.reply('*📥 Procesando tu enlace...*');
    
    const encodedParams = new URLSearchParams();
    encodedParams.append('url', text.trim());

    const options = {
      method: 'POST',
      url: 'https://all-video-downloader1.p.rapidapi.com/all',
      headers: {
        'x-rapidapi-key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'x-rapidapi-host': 'all-video-downloader1.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: encodedParams,
    };

    const response = await axios.request(options);
    const result = response.data;

    if (!result || result.error) {
      throw result?.message || 'La API no devolvió resultados válidos';
    }

    // Construir mensaje con información del video
    let caption = `*📹 Descarga Exitosa*\n`;
    if (result.title) caption += `🔹 *Título:* ${result.title}\n`;
    if (result.duration) caption += `⏱ *Duración:* ${result.duration} segundos\n`;
    if (result.platform) caption += `🌐 *Plataforma:* ${result.platform}\n`;

    // Enviar el mejor formato de video disponible
    if (result.videos && result.videos.length > 0) {
      const bestQuality = result.videos.reduce((prev, current) => 
        (prev.quality > current.quality) ? prev : current);
      
      await conn.sendMessage(m.chat, { 
        video: { url: bestQuality.url },
        caption: caption
      }, { quoted: m });
    } else if (result.url) {
      // Si solo hay una URL directa
      await conn.sendMessage(m.chat, { 
        video: { url: result.url },
        caption: caption
      }, { quoted: m });
    } else {
      throw 'No se encontró contenido descargable';
    }

  } catch (error) {
    console.error('Error en socialdl:', error);
    throw `*⚠️ Error al descargar*\n${error.message || 'Intenta con otro enlace o verifica que sea válido'}`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial', 'videodl'];
handler.limit = true;

export default handler;
