import { createWriteStream, unlink, createReadStream } from 'node:fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import axios from 'axios';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*¡URL de YouTube requerida!*\nEjemplo: ${usedPrefix + command} https://youtu.be/...`;
  
  let tempFile = null;
  
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
      data: { url: text },
      timeout: 10000
    });
    
    console.log('API Response:', JSON.stringify(apiResponse.data, null, 2));
    
    const { medias, source, title, author, duration } = apiResponse.data;
    if (source !== 'youtube') throw '❌ Solo soportamos YouTube con este método';
    
    if (!medias || medias.length === 0) {
      throw '❌ No se encontraron medios disponibles para descargar';
    }
    
    // 2. Buscar el mejor formato de video
    let selectedMedia;
    
    // Prioridad: video > video con audio > cualquier formato
    selectedMedia = medias.find(m => m.type === 'video' && m.hasAudio === false) ||
                   medias.find(m => m.type === 'video') ||
                   medias.find(m => m.url && m.url.includes('googlevideo')) ||
                   medias[0];
    
    if (!selectedMedia || !selectedMedia.url) {
      throw '❌ No se encontró URL de descarga válida';
    }
    
    console.log('Selected media:', selectedMedia);
    
    const downloadUrl = selectedMedia.url;
    
    await m.reply('*📥 Descargando video...*');
    
    // 3. Descargar directamente usando axios con stream
    tempFile = `temp_video_${Date.now()}.mp4`;
    
    const downloadResponse = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Range': 'bytes=0-',
        'Connection': 'keep-alive'
      },
      timeout: 60000, // 60 segundos
      maxRedirects: 5
    });
    
    if (!downloadResponse.data) {
      throw '❌ No se pudo obtener el stream del video';
    }
    
    // 4. Crear stream de escritura
    const writeStream = createWriteStream(tempFile);
    let downloadedBytes = 0;
    
    // Monitorear progreso
    downloadResponse.data.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      // Log cada MB descargado
      if (downloadedBytes % (1024 * 1024) === 0) {
        console.log(`Descargados: ${Math.round(downloadedBytes / (1024 * 1024))}MB`);
      }
    });
    
    // 5. Pipeline para descargar
    await pipeline(downloadResponse.data, writeStream);
    
    console.log(`Descarga completada: ${downloadedBytes} bytes`);
    
    // Verificar que el archivo se descargó correctamente
    if (downloadedBytes < 1000) { // Menos de 1KB
      throw '❌ El archivo descargado es demasiado pequeño, posiblemente corrupto';
    }
    
    await m.reply('*📤 Enviando video...*');
    
    // 6. Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: `file://${process.cwd()}/${tempFile}` },
      caption: `*${title || 'Video de YouTube'}*\n⏱ ${duration ? `${duration}s` : ''} | 👤 ${author || ''}\n📏 ${Math.round(downloadedBytes / (1024 * 1024))}MB`,
      mimetype: selectedMedia.extension === 'webm' ? 'video/webm' : 'video/mp4'
    }, { quoted: m });
    
    console.log('Video enviado exitosamente');
    
  } catch (error) {
    console.error('Error completo:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Falló la descarga del video';
    
    if (error.response?.status) {
      errorMessage = `Error HTTP ${error.response.status}: ${error.response.statusText || 'Error del servidor'}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout: La descarga tomó demasiado tiempo';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Error de conexión: No se pudo conectar al servidor';
    } else if (error.message?.includes('API')) {
      errorMessage = 'Error en la API de YouTube';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw `*Error:* ${errorMessage}`;
    
  } finally {
    // 7. Limpieza garantizada
    if (tempFile) {
      setTimeout(() => {
        unlink(tempFile, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error eliminando archivo temporal:', err);
          } else {
            console.log('Archivo temporal eliminado:', tempFile);
          }
        });
      }, 10000); // Esperar 10 segundos antes de eliminar
    }
  }
};

// Versión alternativa usando ytdl-core como fallback
const handlerYTDL = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*¡URL de YouTube requerida!*\nEjemplo: ${usedPrefix + command} https://youtu.be/...`;
  
  try {
    // Importar ytdl-core dinámicamente
    const ytdl = await import('ytdl-core').catch(() => null);
    
    if (!ytdl) {
      throw 'ytdl-core no está instalado. Instala con: npm install ytdl-core';
    }
    
    await m.reply('*🔍 Obteniendo información del video (método alternativo)...*');
    
    if (!ytdl.validateURL(text)) {
      throw '❌ URL de YouTube no válida';
    }
    
    const info = await ytdl.getInfo(text);
    const title = info.videoDetails.title;
    const author = info.videoDetails.author.name;
    const duration = info.videoDetails.lengthSeconds;
    
    // Buscar formato apropiado
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'lowest',
      filter: 'videoandaudio'
    });
    
    if (!format) {
      throw '❌ No se encontró formato compatible';
    }
    
    await m.reply('*📥 Descargando video (método alternativo)...*');
    
    const tempFile = `temp_ytdl_${Date.now()}.mp4`;
    const stream = ytdl(text, { format: format });
    const writeStream = createWriteStream(tempFile);
    
    await pipeline(stream, writeStream);
    
    await conn.sendMessage(m.chat, {
      video: { url: `file://${process.cwd()}/${tempFile}` },
      caption: `*${title}*\n⏱ ${duration}s | 👤 ${author}`,
      mimetype: 'video/mp4'
    }, { quoted: m });
    
    setTimeout(() => unlink(tempFile, () => {}), 5000);
    
  } catch (error) {
    console.error('Error en ytdl alternativo:', error);
    throw `*Error (método alternativo):* ${error.message || 'Falló la descarga'}`;
  }
};

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['ytdl', 'youtube'];

// Exportar ambas versiones
handler.alternative = handlerYTDL;

export default handler;
