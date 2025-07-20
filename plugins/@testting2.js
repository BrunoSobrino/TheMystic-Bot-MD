import GoogleVideo, { PART, Protos } from 'googlevideo';
import { createWriteStream, unlink } from 'node:fs';
import { pipeline } from 'stream/promises';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*¡URL de YouTube requerida!*\nEjemplo: ${usedPrefix + command} https://youtu.be/...`;

  try {
    await m.reply('*🔍 Obteniendo información del video...*');

    // 1. Obtener información del video usando tu API
    const apiResponse = await axios({
      method: 'POST',
      url: 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      headers: {
        'x-rapidapi-key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: { url: text }
    });

    const { medias, source, title, author, duration } = apiResponse.data;
    if (source !== 'youtube') throw '❌ Solo soportamos YouTube con este método';

    // 2. Obtener la URL directa de googlevideo.com
    const media = medias.find(m => m.type === 'video') || medias[0];
    const streamingUrl = media.url;

    if (!streamingUrl.includes('googlevideo.com')) {
      throw 'La API no devolvió un enlace directo de Google Video';
    }

    // 3. Configuración del cliente GoogleVideo
    const client = new GoogleVideo.ServerAbrStream({
      fetch: async (url, options) => {
        // Implementación personalizada de fetch para evitar bloqueos
        const response = await fetch(url, {
          ...options,
          headers: {
            'Referer': 'https://www.youtube.com',
            'Origin': 'https://www.youtube.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Range': 'bytes=0-',
            ...options?.headers
          }
        });
        return response;
      },
      poToken: '', // Token opcional si es necesario
      serverAbrStreamingUrl: streamingUrl,
      videoPlaybackUstreamerConfig: {
        // Configuración básica del reproductor
        enableAdaptiveBitrate: true,
        enableLowLatency: false
      },
      durationMs: duration * 1000
    });

    // 4. Procesar el stream
    const tempFile = `temp_${Date.now()}.mp4`;
    const writeStream = createWriteStream(tempFile);
    const videoChunks = [];

    client.on('data', (streamData) => {
      for (const formatData of streamData.initializedFormats) {
        for (const chunk of formatData.mediaChunks) {
          videoChunks.push(chunk);
          writeStream.write(chunk);
        }
      }
    });

    await new Promise((resolve, reject) => {
      client.on('end', resolve);
      client.on('error', reject);
      client.init({
        audioFormats: [],
        videoFormats: [{
          itag: media.itag || 18,
          width: media.width || 640,
          height: media.height || 360
        }],
        clientAbrState: {
          playerTimeMs: 0,
          enabledTrackTypesBitfield: 0
        }
      });
    });

    writeStream.end();

    // 5. Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: `file://${tempFile}` },
      caption: `*${title}*\n⏱ ${duration}s | 👤 ${author}`,
      mimetype: 'video/mp4'
    }, { quoted: m });

    // 6. Limpieza
    unlink(tempFile, () => {});

  } catch (error) {
    console.error('Error en ytdl:', error);
    throw `*Error:* ${error.message || 'Falló la descarga'}`;
  }
};

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
