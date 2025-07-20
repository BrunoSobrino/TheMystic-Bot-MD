// Plug test 2
import axios from 'axios';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  if (!text) throw `*¡Por favor ingresa una URL válida!*\n*Ejemplo:* ${usedPrefix + command} https://www.youtube.com/watch?v=...`;
  
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
      data: { url: text.trim() }
    };

    const response = await axios.request(options);
    const result = response.data;

    // Verificar estructura de respuesta
    if (!result || result.error) {
      throw result?.message || 'La API no devolvió resultados válidos';
    }

    // Verificar que hay medios disponibles
    if (!result.medias || result.medias.length === 0) {
      throw 'No se encontraron medios descargables en esta URL';
    }

    const medias = result.medias;
    const isYouTube = result.source === 'youtube';
    const isTikTok = result.source === 'tiktok';

    // Seleccionar mejores formatos
    const bestVideo = medias
      .filter(m => m.type === 'video')
      .sort((a, b) => {
        // Ordenar por calidad/resolución (mayor primero)
        return (b.width || 0) - (a.width || 0) || (b.bitrate || 0) - (a.bitrate || 0);
      })[0];

    const bestAudio = medias
      .filter(m => m.type === 'audio')
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    // Construir caption base
    let caption = `*${result.source.toUpperCase()}*\n`;
    if (result.title) caption += `📌 *Título:* ${result.title}\n`;
    if (result.author || result.unique_id) caption += `👤 *Autor:* ${result.author || '@'+result.unique_id}\n`;
    if (bestVideo?.quality) caption += `🎥 *Calidad:* ${bestVideo.quality}\n`;
    if (result.duration) caption += `⏱ *Duración:* ${Math.round(result.duration/1000)}s`;

    // Enviar contenido según plataforma
    if (isYouTube) {
      // Para YouTube: enviar el mejor video y el mejor audio por separado
      if (bestVideo) {
        await conn.sendFile(m.chat, bestVideo.url, 'video.mp4', 
          `${caption}\n📹 *Video:* ${bestVideo.label || bestVideo.quality}`, m);
      }
      
      if (bestAudio) {
        await conn.sendFile(m.chat, bestAudio.url, 'audio.m4a', 
          `${caption}\n🎵 *Audio:* ${bestAudio.label || bestAudio.quality}`, m);
      }
    } 
    else if (isTikTok) {
      // Para TikTok: enviar solo el mejor video (ya incluye audio)
      if (bestVideo) {
        await conn.sendFile(m.chat, bestVideo.url, 'tiktok.mp4', caption, m);
      }
    }
    else {
      // Para otras plataformas
      if (bestVideo) {
        await conn.sendFile(m.chat, bestVideo.url, 'video.mp4', caption, m);
      }
    }

  } catch (error) {
    console.error('Error en socialdl:', error.response?.data || error.message || error);
    throw `*Error al procesar:* ${error.message || 'Ocurrió un error desconocido'}\n\n*Posibles soluciones:*\n- Verifica que la URL sea correcta\n- Intenta con otro enlace\n- La plataforma podría no ser compatible`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial', 'ytdl', 'tiktokdl'];
handler.limit = true;

export default handler;
