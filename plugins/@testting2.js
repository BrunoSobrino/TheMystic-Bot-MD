import GoogleVideo, { PART, Protos } from 'googlevideo';

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

    // Construir caption
    let caption = `*${result.source.toUpperCase()}*\n`;
    if (result.title) caption += `📌 *Título:* ${result.title}\n`;
    if (result.author || result.unique_id) caption += `👤 *Autor:* ${result.author || '@'+result.unique_id}\n`;
    if (bestVideo?.quality) caption += `🎥 *Calidad:* ${bestVideo.quality}\n`;
    if (result.duration) caption += `⏱ *Duración:* ${Math.round(result.duration/1000)}s`;

    if (isYouTube && bestVideo) {
      try {
        // Procesar el video con el módulo GoogleVideo
        const streamingUrl = bestVideo.url;
        
        // Configurar headers necesarios
        const headers = {
          'Referer': 'https://www.youtube.com/',
          'Origin': 'https://www.youtube.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Range': 'bytes=0-'
        };

        // Descargar el contenido del video
        const response = await fetch(streamingUrl, { 
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const dataBuffer = new GoogleVideo.ChunkedDataBuffer();
        dataBuffer.append(new Uint8Array(arrayBuffer));

        // Procesar el stream de video
        const googUmp = new GoogleVideo.UMP(dataBuffer);
        const videoChunks = [];
        let mediaHeader = null;

        googUmp.parse((part) => {
          switch (part.type) {
            case PART.MEDIA_HEADER: {
              mediaHeader = Protos.MediaHeader.decode(part.data.chunks[0]);
              console.log('[MediaHeader]:', mediaHeader);
              break;
            }
            case PART.MEDIA: {
              const headerId = part.data.getUint8(0);
              const streamData = part.data.split(1).remainingBuffer;
              videoChunks.push(streamData.getBuffer());
              break;
            }
            case PART.MEDIA_END: {
              const headerId = part.data.getUint8(0);
              console.log('[MediaEnd]:', `Header ID: ${headerId}`);
              break;
            }
            default:
              console.log('Unhandled part:', part.type);
              break;
          }
        });

        // Combinar todos los chunks de video
        const videoData = Buffer.concat(videoChunks);
        
        // Enviar el video al chat
        await conn.sendMessage(m.chat, {
          video: videoData,
          caption: `${caption}\n📹 *Video:* ${bestVideo.label || bestVideo.quality}`,
          mimetype: 'video/mp4'
        }, { quoted: m });

      } catch (videoError) {
        console.error('Error al procesar video con GoogleVideo:', videoError);
        throw 'Error al procesar el video. Intenta con otro enlace.';
      }
    } else if (!isYouTube && bestVideo) {
      // Para otras plataformas (no YouTube)
      await conn.sendMessage(m.chat, {
        video: { url: bestVideo.url },
        caption: caption
      }, { quoted: m });
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
