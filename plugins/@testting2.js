import axios from 'axios';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fs from 'fs';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

const streamPipeline = promisify(pipeline);

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

    // Función para descargar con headers personalizados
    const downloadWithHeaders = async (url) => {
      const tempFile = `${tmpdir()}/${randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`;
      
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.youtube.com/',
          'Origin': 'https://www.youtube.com',
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'en-US,en;q=0.9',
          'Range': 'bytes=0-',
          'DNT': '1'
        }
      });

      await streamPipeline(response.data, fs.createWriteStream(tempFile));
      return tempFile;
    };

    if (bestVideo) {
      try {
        const tempFilePath = await downloadWithHeaders(bestVideo.url);
        
        await conn.sendMessage(m.chat, {
          video: fs.readFileSync(tempFilePath),
          caption: `${caption}\n📹 *Video:* ${bestVideo.label || bestVideo.quality}`
        }, { quoted: m });
        
        fs.unlinkSync(tempFilePath); // Eliminar archivo temporal
      } catch (videoError) {
        console.error('Error al descargar video:', videoError);
        throw 'Error al descargar el video. Intenta con otro enlace.';
      }
    }
    
    if (bestAudio && !isYouTube) { // Para YouTube, el audio ya viene con el video
      try {
        const tempFilePath = await downloadWithHeaders(bestAudio.url);
        
        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(tempFilePath),
          mimetype: 'audio/mp4',
          fileName: 'audio.mp4'
        }, { quoted: m });
        
        fs.unlinkSync(tempFilePath); // Eliminar archivo temporal
      } catch (audioError) {
        console.error('Error al descargar audio:', audioError);
        // Continuar sin fallar si solo falla el audio
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
