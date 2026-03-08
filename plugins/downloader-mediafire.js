import axios from 'axios';
import cheerio from 'cheerio';
import { lookup } from 'mime-types';
import fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('*[ ℹ️ ] Ingrese un enlace de MediaFire.*');

  try {
    // 1. Obtener metadatos del enlace
    const res = await mediafireDl(args[0]);
    const { name, size, mime, link } = res;

    await m.reply(`*📥 Preparando descarga...*\n\n*Nombre:* ${name}\n*Tamaño:* ${size}\n\n_El proceso se está monitoreando en la terminal._`);

    // 2. Definir ruta temporal para el archivo
    const tempPath = join(tmpdir(), `${Date.now()}_${name}`);
    const writer = fs.createWriteStream(tempPath);

    console.log(`\n[MEDIAFIRE] Iniciando descarga: ${name}`);
    console.log(`[MEDIAFIRE] URL: ${link}`);

    // 3. Descarga con Axios y Stream para el progreso en Terminal
    const response = await axios({
      method: 'get',
      url: link,
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;

    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      const progress = ((downloadedLength / totalLength) * 100).toFixed(2);
      
      // Limpia la línea y muestra el progreso en la misma posición de la terminal
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`[MEDIAFIRE] PROGRESO: ${progress}% (${(downloadedLength / 1024 / 1024).toFixed(2)} MB / ${(totalLength / 1024 / 1024).toFixed(2)} MB)`);
    });

    response.data.pipe(writer);

    // 4. Cuando termine de guardarse en disco, subir a WhatsApp
    writer.on('finish', async () => {
      console.log(`\n[MEDIAFIRE] Descarga completada. Iniciando subida a WhatsApp...`);
      
      await conn.sendFile(m.chat, tempPath, name, '', m, null, { 
        mimetype: mime, 
        asDocument: true 
      });

      console.log(`[MEDIAFIRE] Archivo enviado con éxito: ${name}\n`);
      
      // Borrar archivo temporal para no llenar el disco
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    });

    writer.on('error', (err) => {
      console.error('[MEDIAFIRE] Error en escritura:', err);
      m.reply('❌ Error al guardar el archivo temporal.');
    });

  } catch (error) {
    console.error('[MEDIAFIRE] Error fatal:', error.message);
    await m.reply(`❌ Error: ${error.message}`);
  }
};

handler.command = /^(mediafire|mediafiredl|dlmediafire)$/i;
export default handler;

// Función Scraper (Mantenemos la lógica robusta anterior)
async function mediafireDl(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(response.data);
  
  let link = $('#downloadButton').attr('href') || 
             $('a#downloadButton').attr('href') ||
             response.data.match(/https?:\/\/download\d+\.mediafire\.com\/[^\s"']+/)?.[0];

  if (!link) throw new Error('No se pudo extraer el enlace directo.');

  const name = $('div.dl-btn-label').attr('title') || 'archivo_descargado';
  const size = $('#downloadButton').text().replace(/Download|[\(\)\n\t]/g, '').trim() || 'N/A';
  const ext = name.split('.').pop()?.toLowerCase();
  const mime = lookup(ext) || 'application/octet-stream';

  return { name, size, mime, link };
}
