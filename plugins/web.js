import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const savePath = path.join('../tmp');  // Ruta temporal agregado en alias savePath
const downloadingFiles = new Set();  // Conjunto para registrar nombres de archivos en proceso
let browserInstance = null;  // Variable para almacenar la instancia del navegador
let activeDownloads = 0;  // Contador para las descargas activas

async function initializeBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-features=BlockInsecurePrivateNetworkRequests",
        "--disable-features=IsolateOrigins", 
        "--disable-site-isolation-trials", 
        '--disable-web-security', 
        "--proxy-server='direct://'", 
        '--proxy-bypass-list=*', 
        '--no-sandbox'
      ],
      executablePath: '/usr/bin/chromium'  // Ruta a Chromium en tu sistema, sin esto no funcionara. En caso de que tu sistema sea x64 pupperteer ya trae un precompilado
    });
  }
  return browserInstance;
}

async function saveAsMHTML(url, conn, m) {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();

    await page.goto(url, { timeout: 90000, waitUntil: 'networkidle2' });

    const cdp = await page.target().createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });

    await page.close();  // Cierra la página después de capturar

    return data;
  } catch (error) {
    console.error('Error in saveAsMHTML:', error);
    await conn.reply(m.chat, `💢 Error: ${error.message}`, m);
    throw error;
  }
}

async function handleDownloadRequest(url, conn, m) {
  let fileName = '';
  try {
    const timestamp = Date.now();
    fileName = `page_${timestamp}.mhtml`;
    const filePath = path.join(savePath, fileName);  // Ruta del Archivo

    if (downloadingFiles.has(fileName)) {
      await conn.reply(m.chat, '😒 Error de Archivo.', m);
      return;
    }

    downloadingFiles.add(fileName);
    activeDownloads++;

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    await conn.reply(m.chat, '💾 Descargando...', m);

    const mhtmlContent = await saveAsMHTML(url, conn, m);
    fs.writeFileSync(filePath, mhtmlContent);

    await conn.sendFile(m.chat, filePath, fileName, 'Aquí tienes ❤️', m, false, {
      mimetype: 'multipart/related'
    });

    console.log(`MHTML ${fileName} enviado exitosamente.`);
    
    fs.unlinkSync(filePath);
    console.log(`Archivo ${fileName} eliminado.`);
  } catch (error) {
    console.error('Error al descargar la página:', error);
  } finally {
    // Elimina el nombre de archivo del conjunto y decrementa el contador de descargas activas
    downloadingFiles.delete(fileName);
    activeDownloads--;

    // Si no hay más descargas activas, cierra el navegador
    if (activeDownloads === 0 && browserInstance) {
      browserInstance.close().then(() => {
        browserInstance = null;
        console.log('Navegador cerrado.');
      }).catch(err => {
        console.error('Error al cerrar el navegador:', err);
      });
    }
  }
}

const handler = async (m, { conn, text }) => {
  const quotedMessage = m.quoted && m.quoted.text ? m.quoted.text : '';
  const urlMatch = quotedMessage.match(/\bhttps?:\/\/\S+/gi);
  const url = urlMatch ? urlMatch[0] : (text ? text.trim() : '');

  if (!url.startsWith('http')) {
    await conn.reply(m.chat, '💢 El link debe ser http o https.', m);
    return;
  }

  await handleDownloadRequest(url, conn, m);
};

handler.command = /web$/i;
export default handler;
