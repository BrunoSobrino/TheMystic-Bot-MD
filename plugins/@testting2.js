import GoogleVideo from 'googlevideo';
import { createWriteStream, unlink } from 'node:fs';
import { pipeline } from 'stream/promises';
import axios from 'axios';

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
    
    if (!streamingUrl || !streamingUrl.includes('googlevideo.com')) {
      throw 'La API no devolvió un enlace directo de Google Video válido';
    }
    
    // 3. Configuración del cliente GoogleVideo
    const client = new GoogleVideo.ServerAbrStream({
      fetch: async (url, options) => {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url, {
          ...options,
          headers: {
            'Referer': 'https://www.youtube.com/',
            'Origin': 'https://www.youtube.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            ...options?.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      },
      serverAbrStreamingUrl: streamingUrl,
      // Configuración mínima requerida
      videoPlaybackUstreamerConfig: undefined, // Usar configuración por defecto
      durationMs: duration ? duration * 1000 : undefined
    });
    
    // 4. Configurar el procesamiento de chunks
    const tempFile = `temp_${Date.now()}.mp4`;
    const writeStream = createWriteStream(tempFile);
    const videoChunks = [];
    
    // Event listeners para el cliente
    client.on('data', (streamData) => {
      try {
        console.log('Recibidos datos del stream');
        
        // Procesar los formatos inicializados
        if (streamData.initializedFormats) {
          for (const formatData of streamData.initializedFormats) {
            if (formatData.mediaChunks) {
              for (const chunk of formatData.mediaChunks) {
                if (chunk && chunk.length > 0) {
                  videoChunks.push(chunk);
                  writeStream.write(chunk);
                }
              }
            }
          }
        }
      } catch (chunkError) {
        console.error('Error procesando chunks:', chunkError);
      }
    });
    
    client.on('error', (error) => {
      console.error('Error en el cliente GoogleVideo:', error);
      writeStream.destroy();
    });
    
    // 5. Inicializar y procesar el stream
    await new Promise((resolve, reject) => {
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          writeStream.end();
        }
      };
      
      client.on('end', () => {
        console.log('Stream terminado');
        cleanup();
        resolve();
      });
      
      client.on('error', (error) => {
        console.error('Error del cliente:', error);
        cleanup();
        reject(error);
      });
      
      // Timeout de seguridad
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.log('Timeout alcanzado');
          cleanup();
          resolve(); // Continuar con lo que se haya descargado
        }
      }, 30000); // 30 segundos
      
      try {
        // Inicializar con configuración mínima
        client.init({
          audioFormats: [], // Sin audio por ahora
          videoFormats: [{
            itag: media.itag || 18, // Formato básico MP4
            width: media.width || 640,
            height: media.height || 360,
            fps: media.fps || 30
          }],
          clientAbrState: {
            playerTimeMs: 0,
            enabledTrackTypesBitfield: 1 // Habilitar video
          }
        });
        
        clearTimeout(timeout);
      } catch (initError) {
        clearTimeout(timeout);
        console.error('Error en init:', initError);
        reject(initError);
      }
    });
    
    // 6. Verificar que se descargó contenido
    if (videoChunks.length === 0) {
      unlink(tempFile, () => {});
      throw 'No se pudo descargar contenido del video';
    }
    
    console.log(`Descarga completada: ${videoChunks.length} chunks, archivo: ${tempFile}`);
    
    // 7. Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: `file://${process.cwd()}/${tempFile}` },
      caption: `*${title || 'Video de YouTube'}*\n⏱ ${duration ? `${duration}s` : 'Duración desconocida'} | 👤 ${author || 'Autor desconocido'}`,
      mimetype: 'video/mp4'
    }, { quoted: m });
    
    // 8. Limpieza
    setTimeout(() => {
      unlink(tempFile, (err) => {
        if (err) console.error('Error eliminando archivo temporal:', err);
        else console.log('Archivo temporal eliminado:', tempFile);
      });
    }, 5000); // Esperar 5 segundos antes de eliminar
    
  } catch (error) {
    console.error('Error en ytdl:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Falló la descarga';
    
    if (error.message?.includes('base64')) {
      errorMessage = 'Error de formato en los datos del video';
    } else if (error.message?.includes('HTTP')) {
      errorMessage = 'Error de conexión con el servidor de video';
    } else if (error.message?.includes('googlevideo')) {
      errorMessage = 'URL de video no válida o expirada';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw `*Error:* ${errorMessage}`;
  }
};

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['ytdl', 'youtube'];
export default handler;
