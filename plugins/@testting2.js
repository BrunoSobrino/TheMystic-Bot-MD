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

    // 3. Método alternativo usando el módulo GoogleVideo sin ServerAbrStream
    const videoBuffer = await downloadVideoDirectly(streamingUrl);

    // 4. Enviar el video
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: `*${title}*\n⏱ ${duration}s | 👤 ${author}`,
      mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (error) {
    console.error('Error en ytdl:', error);
    throw `*Error:* ${error.message || 'Falló la descarga'}`;
  }
};

// Función alternativa que evita el problema con base64
async function downloadVideoDirectly(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Configurar headers para evitar bloqueos
      const headers = {
        'Referer': 'https://www.youtube.com',
        'Origin': 'https://www.youtube.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Range': 'bytes=0-'
      };

      // 2. Obtener los datos del video
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // 3. Procesar el stream con GoogleVideo
      const dataBuffer = new GoogleVideo.ChunkedDataBuffer();
      const ump = new GoogleVideo.UMP();
      const videoChunks = [];

      ump.on('data', (part) => {
        if (part.type === PART.MEDIA) {
          const mediaData = part.data.split(1).remainingBuffer;
          videoChunks.push(mediaData.getBuffer());
        }
      });

      // 4. Leer el stream en chunks
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convertir Uint8Array a Buffer
        const chunkBuffer = Buffer.from(value);
        dataBuffer.append(new Uint8Array(chunkBuffer));
        
        // Parsear los datos
        ump.parse(dataBuffer);
      }

      // 5. Devolver el video completo
      resolve(Buffer.concat(videoChunks));

    } catch (error) {
      reject(error);
    }
  });
}

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
