import GoogleVideo, { PART, Protos } from 'googlevideo';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*¡URL necesaria!*\nEjemplo: ${usedPrefix + command} https://youtu.be/...`;

  try {
    await m.reply('*📥 Descargando contenido...*');

    // 1. Obtener info del video usando la API (como antes)
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
    if (source !== 'youtube' || !medias?.length) throw '❌ Solo soportamos YouTube aquí';

    // 2. Filtrar la mejor calidad de video (ejemplo: itag 18)
    const media = medias.find(m => m.type === 'video' && m.quality === '360p') || medias[0];
    const googlevideoUrl = media.url; // URL como: https://r1---sn-xxx.googlevideo.com/...

    if (!googlevideoUrl.includes('googlevideo.com')) {
      throw 'La API no devolvió un enlace directo de Google Video';
    }

    // 3. ¡Aquí usamos el módulo `googlevideo` para evitar el bloqueo!
    const videoBuffer = await downloadWithGoogleVideoModule(googlevideoUrl);

    // 4. Enviar el video
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: `*${title}*\n🕒 ${duration}s | 👤 ${author}`,
      mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    throw `*Error:* ${error.message || 'Falló la descarga'}`;
  }
};

// Función clave que usa el módulo `googlevideo` para evitar bloqueos
async function downloadWithGoogleVideoModule(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Configurar el cliente de GoogleVideo
      const client = new GoogleVideo.Client({
        withCredentials: true,
        headers: {
          'Origin': 'https://www.youtube.com',
          'Referer': 'https://www.youtube.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
        }
      });

      // 2. Iniciar la conexión directa al servidor de Google
      const connection = await client.connect(url);
      
      // 3. Procesar el stream usando UMP (Unified Media Protocol)
      const umpProcessor = new GoogleVideo.UMP();
      const videoChunks = [];

      connection.on('data', (chunk) => {
        const dataBuffer = new GoogleVideo.ChunkedDataBuffer();
        dataBuffer.append(chunk);
        
        umpProcessor.parse(dataBuffer, (part) => {
          if (part.type === PART.MEDIA) {
            videoChunks.push(part.data.getBuffer());
          }
        });
      });

      connection.on('end', () => {
        resolve(Buffer.concat(videoChunks)); // Devolver el video completo
      });

      connection.on('error', reject);

    } catch (err) {
      reject(err);
    }
  });
}

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
