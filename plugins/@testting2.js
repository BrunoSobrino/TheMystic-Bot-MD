// Plug test 2
import axios from 'axios';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  // Verificar que se proporcionó una URL
  if (!text) throw `*¡Por favor ingresa una URL!*\n*Ejemplo:* ${usedPrefix + command} https://www.youtube.com/watch?v=... o https://www.tiktok.com/@usuario/video/...`;
  
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

    // Hacer la petición a la API
    const response = await axios.request(options);
    const result = response.data;

    // Verificar si hay medios disponibles
    if (!result.data?.medias || result.data.medias.length === 0) {
      throw 'No se encontraron medios descargables en esta URL';
    }

    const medias = result.data.medias;
    const isYouTube = result.source === 'youtube';
    const isTikTok = result.source === 'tiktok';

    // Obtener los mejores formatos disponibles
    const bestVideo = medias
      .filter(m => m.type === 'video')
      .sort((a, b) => {
        // Priorizar sin watermark en TikTok
        if (isTikTok) {
          if (a.quality?.includes('no_watermark')) return -1;
          if (b.quality?.includes('no_watermark')) return 1;
        }
        // Ordenar por calidad/resolución
        return (b.width || 0) - (a.width || 0);
      })[0];

    const bestAudio = medias
      .filter(m => m.type === 'audio')
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    // Enviar los medios según la plataforma
    if (isYouTube) {
      // Para YouTube: enviar video y audio por separado si están disponibles
      if (bestVideo) {
        await conn.sendFile(m.chat, bestVideo.url, 'video.mp4', 
          `*YouTube Video (${bestVideo.label || bestVideo.quality})*\n${result.title || ''}`, m);
      }
      
      if (bestAudio) {
        await conn.sendFile(m.chat, bestAudio.url, 'audio.m4a', 
          `*YouTube Audio (${bestAudio.label || bestAudio.quality})*\n${result.title || ''}`, m);
      }
    } 
    else if (isTikTok) {
      if (bestVideo) {
        await conn.sendFile(m.chat, bestVideo.url, 'tiktok.mp4', 
          `*TikTok Video (${bestVideo.quality})*\n${result.title || ''}\nAutor: @${result.unique_id || ''}`, m);
      }
    } 
    else {
      await conn.sendFile(m.chat, bestVideo.url, 'social.mp4', 
        `*Contenido descargado*\n${result.title || ''}`, m);
    }

  } catch (error) {
    console.error('Error en socialdl:', error);
    throw `*Ocurrió un error al procesar tu solicitud:* ${error.message || error}`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial', 'ytdl', 'tiktokdl'];
handler.limit = true;

export default handler;
