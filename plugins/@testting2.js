import cloudflareScraper from 'cloudflare-scraper';
import axios from 'axios';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  if (!text) throw `*¡Por favor ingresa una URL válida!*\n*Ejemplo:* ${usedPrefix + command} https://www.youtube.com/watch?v=...`;
  
  try {
    m.reply(`*Procesando tu solicitud, por favor espera...*`);
    
    // Obtener información de la API
    const apiOptions = {
      method: 'POST',
      url: 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      headers: {
        'x-rapidapi-key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: { url: text.trim() }
    };

    const apiResponse = await axios.request(apiOptions);
    const result = apiResponse.data;

    if (!result || result.error) {
      throw result?.message || 'La API no devolvió resultados válidos';
    }

    if (!result.medias || result.medias.length === 0) {
      throw 'No se encontraron medios descargables en esta URL';
    }

    const medias = result.medias;
    const isYouTube = result.source === 'youtube';

    // Buscar el mejor formato de video
    const bestVideo = medias
      .filter(m => m.type === 'video')
      .sort((a, b) => (b.width || 0) - (a.width || 0) || (b.bitrate || 0) - (a.bitrate || 0))[0];

    // Buscar el mejor formato de audio
    const bestAudio = medias
      .filter(m => m.type === 'audio')
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    // Construir caption
    let caption = `*${result.source.toUpperCase()}*\n`;
    if (result.title) caption += `📌 *Título:* ${result.title}\n`;
    if (result.author || result.unique_id) caption += `👤 *Autor:* ${result.author || '@'+result.unique_id}\n`;
    if (bestVideo?.quality) caption += `🎥 *Calidad:* ${bestVideo.quality}\n`;
    if (result.duration) caption += `⏱ *Duración:* ${Math.round(result.duration/1000)}s`;

    // Función para descargar con cloudflare-scraper
    const downloadWithScraper = async (url) => {
      try {
        const response = await cloudflareScraper.get(url, {
          headers: {
            'Referer': 'https://www.youtube.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          responseType: 'stream'
        });
        return response;
      } catch (error) {
        console.error('Error con cloudflare-scraper:', error);
        throw 'Error al descargar el contenido. Intenta nuevamente más tarde.';
      }
    };

    if (isYouTube) {
      // Para YouTube usar cloudflare-scraper
      if (bestVideo) {
        try {
          const videoStream = await downloadWithScraper(bestVideo.url);
          await conn.sendMessage(m.chat, {
            video: videoStream.data,
            caption: `${caption}\n📹 *Video:* ${bestVideo.label || bestVideo.quality}`
          }, { quoted: m });
        } catch (videoError) {
          console.error('Error al descargar video:', videoError);
          throw 'Error al descargar el video de YouTube. Intenta con otro enlace.';
        }
      }
      
      if (bestAudio) {
        try {
          const audioStream = await downloadWithScraper(bestAudio.url);
          await conn.sendMessage(m.chat, {
            audio: audioStream.data,
            mimetype: 'audio/mp4',
            fileName: 'audio.m4a'
          }, { quoted: m });
        } catch (audioError) {
          console.error('Error al descargar audio:', audioError);
          // Continuar sin fallar si solo falla el audio
        }
      }
    } else {
      // Para otras plataformas (TikTok, etc.) usar método normal
      if (bestVideo) {
        await conn.sendMessage(m.chat, {
          video: { url: bestVideo.url },
          caption: caption
        }, { quoted: m });
      }
    }

  } catch (error) {
    console.error('Error en socialdl:', error.response?.data || error.message || error);
    throw `*Error al procesar:* ${error.message || 'Ocurrió un error desconocido'}\n\n*Posibles soluciones:*\n- Verifica que la URL sea correcta\n- Intenta con otro enlace\n- Espera unos minutos y vuelve a intentar`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial', 'ytdl', 'tiktokdl'];
handler.limit = true;

export default handler;
