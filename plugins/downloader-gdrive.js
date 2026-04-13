import fetch from 'node-fetch';
import { sizeFormatter } from 'human-readable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream'; 

const formatSize = sizeFormatter({
  std: 'JEDEC', 
  decimalPlaces: 2, 
  keepTrailingZeroes: false, 
  render: (literal, symbol) => `${literal} ${symbol}B`
});

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_gdrive;

  if (!args[0]) {
    throw `${tradutor.texto1} _${usedPrefix + command} https://drive.google.com/file/d/1dmHlx1WTbH5yZoNa_ln325q5dxLn1QHU/view_`;
  }

  let tempFilePath;

  try {
    conn.reply(m.chat, tradutor.texto2 || '🔄 Obteniendo enlace de descarga...', m);
    const res = await GDriveDl(args[0]);
    
    if (!res) throw 'No se pudo obtener el enlace de Google Drive.';

    // 🟢 NUEVO LÍMITE: 2 GB = 2147483648 bytes
    if (res.sizeBytes > 2147483648) { 
        throw `El archivo es demasiado grande para enviarlo por WhatsApp (${res.fileSize}). El límite máximo es de 2GB.`;
    }

    const fileResponse = await fetch(res.downloadUrl);
    if (!fileResponse.ok) throw `Error al descargar el archivo: ${fileResponse.statusText}`;

    tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${res.fileName}`);
    const totalBytes = res.sizeBytes;
    
    // ==========================================
    // 1. MONITOR DE DESCARGA (Drive -> Servidor)
    // ==========================================
    let downloadedBytes = 0;
    const downloadStartTime = Date.now();
    let lastDownloadLogTime = 0;

    const downloadProgressStream = new Transform({
      transform(chunk, encoding, callback) {
        downloadedBytes += chunk.length;
        const currentTime = Date.now();
        
        if (currentTime - lastDownloadLogTime > 500) {
           const elapsedTime = (currentTime - downloadStartTime) / 1000;
           const speedBytes = elapsedTime > 0 ? downloadedBytes / elapsedTime : 0;
           
           const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
           const speedMBps = (speedBytes / (1024 * 1024)).toFixed(1);
           const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(1);
           const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
           
           // Limpia la línea en terminales compatibles y usa texto corto
           if (process.stdout.isTTY) {
               process.stdout.clearLine(0);
               process.stdout.cursorTo(0);
           }
           process.stdout.write(`\r📥 ${percent}% | ${downloadedMB}/${totalMB}MB | ${speedMBps}MB/s`);
           lastDownloadLogTime = currentTime;
        }
        callback(null, chunk);
      }
    });

    console.log(`\nIniciando proceso para: ${res.fileName}`);
    
    await pipeline(
        fileResponse.body, 
        downloadProgressStream, 
        fs.createWriteStream(tempFilePath)
    );

    console.log(`\n✅ Descarga completada. Iniciando subida a WhatsApp...`);

    // ==========================================
    // 2. MONITOR DE SUBIDA (Servidor -> WhatsApp)
    // ==========================================
    let uploadedBytes = 0;
    const uploadStartTime = Date.now();
    let lastUploadLogTime = 0;

    const uploadProgressStream = new Transform({
      transform(chunk, encoding, callback) {
        uploadedBytes += chunk.length;
        const currentTime = Date.now();

        if (currentTime - lastUploadLogTime > 500) {
           const elapsedTime = (currentTime - uploadStartTime) / 1000;
           const speedBytes = elapsedTime > 0 ? uploadedBytes / elapsedTime : 0;

           const percent = ((uploadedBytes / totalBytes) * 100).toFixed(1);
           const speedMBps = (speedBytes / (1024 * 1024)).toFixed(1);
           const uploadedMB = (uploadedBytes / (1024 * 1024)).toFixed(1);
           const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

           // Limpia la línea en terminales compatibles y usa texto corto
           if (process.stdout.isTTY) {
               process.stdout.clearLine(0);
               process.stdout.cursorTo(0);
           }
           process.stdout.write(`\r📤 ${percent}% | ${uploadedMB}/${totalMB}MB | ${speedMBps}MB/s`);
           lastUploadLogTime = currentTime;
        }
        callback(null, chunk);
      }
    });

    const readStream = fs.createReadStream(tempFilePath).pipe(uploadProgressStream);

    await conn.sendMessage(m.chat, {
        document: { stream: readStream }, 
        fileName: res.fileName,
        mimetype: res.mimetype
    }, { quoted: m });

    console.log(`\n🚀 Subida completada. Enviado con éxito a ${m.sender}\n`);

    // Limpieza
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }

  } catch (e) {
    m.reply(typeof e === 'string' ? e : tradutor.texto3);
    console.error('\n[ERROR DEL PLUGIN GDRIVE]:', e);
    
    if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }
  }
};

handler.command = /^(gdrive)$/i;
export default handler;

async function GDriveDl(url) {
  if (!(url && url.match(/drive\.google/i))) throw 'URL no válida';
  
  const idMatch = url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//);
  const id = idMatch ? idMatch[1] : null;
  if (!id) throw 'ID no encontrado';

  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'post',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'content-length': '0',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'origin': 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested': 'true'
    }
  });

  const rawText = await res.text();
  const { fileName, sizeBytes, downloadUrl } = JSON.parse(rawText.slice(4));
  
  if (!downloadUrl) throw '¡Límite de descarga alcanzado o el archivo es privado!';
  
  const data = await fetch(downloadUrl);
  if (data.status !== 200) throw `Error HTTP: ${data.statusText}`;

  return { 
    downloadUrl, 
    fileName, 
    sizeBytes: Number(sizeBytes),
    fileSize: formatSize(sizeBytes), 
    mimetype: data.headers.get('content-type') 
  };
}
