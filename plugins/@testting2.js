import { createWriteStream, unlink } from 'node:fs';
import { pipeline } from 'stream/promises';
import axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';

// Función para obtener proxy gratuito
async function getFreeProxy() {
  try {
    // Opción 1: Geonode.com
    const res = await axios.get('https://proxylist.geonode.com/api/proxy-list?limit=50&page=1&sort_by=lastChecked&sort_type=desc&protocols=http', {
      timeout: 5000
    });
    
    const proxies = res.data.data.map(p => `${p.ip}:${p.port}`);
    return proxies[0]; // toma el primero
    
    // Opción 2: Proxyspace
    /*
    const res = await axios.get('https://www.proxyspace.pro/http.txt', {
      timeout: 5000
    });
    const list = res.data.split('\n').filter(Boolean);
    return list[0];
    */
    
    // Opción 3: FreeProxyList
    /*
    const res = await axios.get('https://free-proxy-list.net/', {
      timeout: 5000
    });
    const html = res.data;
    const matches = html.match(/\d+\.\d+\.\d+\.\d+:\d+/g);
    return matches ? matches[0] : null;
    */
    
  } catch (error) {
    console.log('Error obteniendo proxy, continuando sin proxy:', error.message);
    return null;
  }
}

// Función para descargar con proxy
async function downloadWithProxy(downloadUrl, tempFile) {
  const proxy = await getFreeProxy();
  
  let axiosConfig = {
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
    timeout: 60000,
    maxRedirects: 5
  };

  if (proxy) {
    console.log('Usando proxy:', proxy);
    const agent = new HttpsProxyAgent(`http://${proxy}`);
    axiosConfig.httpsAgent = agent;
    axiosConfig.httpAgent = agent;
  } else {
    console.log('Descargando sin proxy');
  }

  const response = await axios(axiosConfig);
  
  const writeStream = createWriteStream(tempFile);
  await pipeline(response.data, writeStream);
  
  return response;
}

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
    
    const { medias, source, title, author, duration } = apiResponse.data;
    if (source !== 'youtube') throw '❌ Solo soportamos YouTube';
    if (!medias || medias.length === 0) throw '❌ No se encontraron medios';
    
    // 2. Seleccionar media
    const selectedMedia = medias.find(m => m.type === 'video') || medias[0];
    if (!selectedMedia?.url) throw '❌ No se encontró URL válida';
    
    const downloadUrl = selectedMedia.url;
    console.log('URL de descarga:', downloadUrl);
    
    await m.reply('*📥 Descargando video con proxy...*');
    
    // 3. Descargar usando proxy
    tempFile = `temp_video_${Date.now()}.mp4`;
    
    try {
      await downloadWithProxy(downloadUrl, tempFile);
      console.log('Descarga completada con proxy');
    } catch (proxyError) {
      console.log('Error con proxy, intentando descarga directa:', proxyError.message);
      
      // Fallback: descarga directa sin proxy
      const directResponse = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.youtube.com/',
          'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
          'Accept-Language': 'en-US,en;q=0.9',
          'Range': 'bytes=0-'
        },
        timeout: 60000,
        maxRedirects: 5
      });
      
      const writeStream = createWriteStream(tempFile);
      await pipeline(directResponse.data, writeStream);
      console.log('Descarga completada sin proxy');
    }
    
    // 4. Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: `file://${process.cwd()}/${tempFile}` },
      caption: `*${title || 'Video de YouTube'}*\n⏱ ${duration ? `${duration}s` : ''} | 👤 ${author || ''}`,
      mimetype: selectedMedia.extension === 'webm' ? 'video/webm' : 'video/mp4'
    }, { quoted: m });
    
    console.log('Video enviado exitosamente');
    
  } catch (error) {
    console.error('Error completo:', error);
    
    let errorMessage = 'Falló la descarga del video';
    
    if (error.response?.status) {
      errorMessage = `Error HTTP ${error.response.status}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout: La descarga tomó demasiado tiempo';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Error de conexión';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw `*Error:* ${errorMessage}`;
    
  } finally {
    // Limpieza
    if (tempFile) {
      setTimeout(() => {
        unlink(tempFile, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error eliminando archivo:', err);
          } else {
            console.log('Archivo temporal eliminado:', tempFile);
          }
        });
      }, 10000);
    }
  }
};

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
