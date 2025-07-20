// Plug test 2
import axios from 'axios';
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

    if (!result || result.error) {
      throw result?.message || 'La API no devolvió resultados válidos';
    }

    if (!result.medias || result.medias.length === 0) {
      throw 'No se encontraron medios descargables en esta URL';
    }

    const medias = result.medias;
    const isYouTube = result.source === 'youtube';
    const isTikTok = result.source === 'tiktok';

    // Buscar formatos que incluyan audio y video juntos
    const combinedFormat = medias.find(m => 
      m.type === 'video' && 
      (m.audioQuality || m.is_audio) && 
      m.extension === 'mp4'
    );

    // Seleccionar mejores formatos por separado
    const bestVideo = medias
      .filter(m => m.type === 'video')
      .sort((a, b) => (b.width || 0) - (a.width || 0) || (b.bitrate || 0) - (a.bitrate || 0))[0];

    const bestAudio = medias
      .filter(m => m.type === 'audio')
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    // Construir caption
    let caption = `*${result.source.toUpperCase()}*\n`;
    if (result.title) caption += `📌 *Título:* ${result.title}\n`;
    if (result.author || result.unique_id) caption += `👤 *Autor:* ${result.author || '@'+result.unique_id}\n`;
    if (bestVideo?.quality) caption += `🎥 *Calidad:* ${bestVideo.quality}\n`;
    if (result.duration) caption += `⏱ *Duración:* ${Math.round(result.duration/1000)}s`;

    if (combinedFormat) {
      // Enviar formato combinado si existe
      await conn.sendMessage(m.chat, {
        video: { url: combinedFormat.url },
        caption: `${caption}\n🔊 *Formato:* Audio y Video combinados`
      }, { quoted: m });
    } else if (isYouTube) {
      // Para YouTube sin formato combinado
      if (bestVideo) {
        await conn.sendMessage(m.chat, {
          video: { url: bestVideo.url },
          caption: `${caption}\n📹 *Video:* ${bestVideo.label || bestVideo.quality}`
        }, { quoted: m });
      }
      
      if (bestAudio) {
        await conn.sendMessage(m.chat, {
          audio: { url: bestAudio.url },
          mimetype: 'audio/mp4',
          fileName: 'audio.m4a'
        }, { quoted: m });
      }
    } else if (isTikTok) {
      // Para TikTok siempre enviar video (ya incluye audio)
      if (bestVideo) {
        await conn.sendMessage(m.chat, {
          video: { url: bestVideo.url },
          caption: caption
        }, { quoted: m });
      }
    } else if (bestVideo) {
      // Para otras plataformas
      await conn.sendMessage(m.chat, {
        video: { url: bestVideo.url },
        caption: caption
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Error en socialdl:', error.response?.data || error.message || error);
    throw `*Error al procesar:* ${error.message || 'Ocurrió un error desconocido'}\n\n*Posibles soluciones:*\n- Verifica que la URL sea correcta\n- Intenta con otro enlace\n- La plataforma podría no ser compatible`;
  }
};

handler.help = ['socialdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl', 'descargasocial', 'ytdl', 'tiktokdl'];

export default handler;
