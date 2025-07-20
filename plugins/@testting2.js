import { createWriteStream, unlink } from 'node:fs';
import { pipeline } from 'stream/promises';
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
      data: { url: text }
    });
    
    const { medias, source, title, author, duration } = apiResponse.data;
    if (source !== 'youtube') throw '❌ Solo soportamos YouTube';
    if (!medias || medias.length === 0) throw '❌ No se encontraron medios';
    
    // 2. Seleccionar media
    const selectedMedia = medias.find(m => m.type === 'video') || medias[0];
    if (!selectedMedia?.url) throw '❌ No se encontró URL válida';
    
    const downloadUrl = selectedMedia.url;
    await m.reply('*📥 Descargando video...*');
    
    // 3. Descargar directamente usando axios con stream
    tempFile = `temp_video_${Date.now()}.mp4`;
    
    // ✅ Agrega tus cookies aquí (manualmente)
    const cookieHeader = [
      'SID=g.a000zQiP0ucezBUNsofbbmbBI6s_VKfNeSkleQpFhy7nP-GIf2GeFGulTzpyaOpseCs7obOQggACgYKAbkSARESFQHGX2MikZnsGN00L4gYLnv_r2Mb1hoVAUF8yKrM8eAuWTeBHsdMu3jvHGfC0076',
      'SSID=AKKHkuzb7H_RtRo6d',
      'SIDCC=AKEyXzVwhiUJIxHVEz4ZddVCGF2B1NjaowPbeHvtFtX5t7JJ6e3upva7dj8_E8l1hgijnQCVBqk',
      'VISITOR_INFO1_LIVE=wUugjRyz06k',
      'YSC=CHm_FDU_ejA',
      'VISITOR_PRIVACY_METADATA=CgJNWBIEGgAgJQ%3D%3D'
    ].join('; ');
    
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
        'Connection': 'keep-alive',
        'Cookie': cookieHeader // ✅ Aquí se añade la cabecera de cookies
      },
      timeout: 60000,
      maxRedirects: 5
    });
    
    // 4. Descargar usando pipeline
    const writeStream = createWriteStream(tempFile);
    await pipeline(downloadResponse.data, writeStream);
    
    // 5. Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: `file://${process.cwd()}/${tempFile}` },
      caption: `*${title || 'Video de YouTube'}*\n⏱ ${duration ? `${duration}s` : ''} | 👤 ${author || ''}`,
      mimetype: 'video/mp4'
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error:', error);
    throw `*Error:* ${error.message || 'Falló la descarga'}`;
  } finally {
    // Limpieza
    if (tempFile) {
      setTimeout(() => unlink(tempFile, () => {}), 10000);
    }
  }
};

handler.help = ['ytdl <url>'];
handler.tags = ['downloader'];
handler.command = ['socialdl'];
export default handler;
