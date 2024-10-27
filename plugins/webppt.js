// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const tempDirectory = path.join(process.cwd(), 'src/tmp/PPT');
const maxDownloads = 2;
let activeDownloads = 0;
const queue = [];
let browserInstance = null;

async function initializeBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [ // Banderas para Eficiencia. Se pueden Borrar o Agregar mas. Utilizar coma por cada agregado.
        "--disable-features=BlockInsecurePrivateNetworkRequests",
        "--disable-features=IsolateOrigins", 
        "--disable-site-isolation-trials", 
        '--disable-web-security', 
        "--proxy-server='direct://'", 
        '--proxy-bypass-list=*',
        '--headless',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-logging',
        '--disable-infobars',
        '--disable-breakpad',
        '--disable-gl-drawing-for-tests',
        '--disable-canvas-aa', // Disable antialiasing on 2d canvas
        '--disable-2d-canvas-clip-aa',
	    	'--no-sandbox', 
        //'--user-data-dir=/$HOME/.config/chromium/' //ubicacion de los datos. util para que utilice tus credenciales. Riesgoso en caso de que sea plugin publico y agregues credenciales privadas.
      ],
      //executablePath: '/usr/bin/chromium'  // Ruta a Chromium en tu sistema, si no funciona este plugin debes descomentar y agregar la ubicacion de tu instalacion de chomium o firefox. Requerido para Termux o Sistema ARM 
    });
  }
  return browserInstance;
}

async function saveAsMHTML(url) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 90000, waitUntil: 'networkidle2' });
    const { data } = await page._client().send('Page.captureSnapshot', { format: 'mhtml' });
    return data;
  } finally {
    await page.close();
  }
}

async function saveAsPDF(url) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 90000, waitUntil: 'networkidle2' });
    return await page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await page.close();
  }
}

async function downloadImages(url) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 90000, waitUntil: 'networkidle2' });
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({ src: img.src, size: img.naturalWidth * img.naturalHeight }))
    );
    return images.filter(img => img.size > 11240).map(img => img.src);
  } finally {
    await page.close();
  }
}

async function handleDownloadRequest(url, conn, m, type = 'mhtml') {
  try {
    let content;
    if (type === 'mhtml') {
      await conn.reply(m.chat, '💾 Descargando...', m);
      content = await saveAsMHTML(url);
    } else if (type === 'pdf') {
      await conn.reply(m.chat, '💾 Generando PDF...', m);
      content = await saveAsPDF(url);
    }

    const tempFile = path.join(tempDirectory, `file_${Date.now()}.${type}`);
    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory, { recursive: true });
    }
    fs.writeFileSync(tempFile, content);

    await conn.sendFile(m.chat, tempFile, '', '❤️', m);
    fs.unlinkSync(tempFile);
  } catch (error) {
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
  } finally {
    activeDownloads--;
    processQueue();
  }
}

async function handleImageDownloadRequest(url, conn, m) {
  try {
    await conn.reply(m.chat, '💾 Descargando Imagenes...', m);
    const imageUrls = await downloadImages(url);

    if (imageUrls.length === 0) {
      await conn.reply(m.chat, '❌ No Imagenes +10KB.', m);
      return;
    }

    for (const imageUrl of imageUrls) {
      const fileName = path.basename(new URL(imageUrl).pathname);
      const filePath = path.join(tempDirectory, `image_${Date.now()}_${fileName}`);
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      fs.writeFileSync(filePath, buffer);
      await conn.sendFile(m.chat, filePath, '', '', m);

      fs.unlinkSync(filePath);
    }
  } catch (error) {
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
  } finally {
    activeDownloads--;
    processQueue();
  }
}

async function processQueue() {
  if (queue.length === 0 && activeDownloads === 0 && browserInstance) {
    try {
      await browserInstance.close();
      browserInstance = null;
    } catch (err) {
      console.error('Error al cerrar el navegador:', err);
    }
    return;
  }

  if (queue.length > 0 && activeDownloads < maxDownloads) {
    const { url, conn, m, type } = queue.shift();
    activeDownloads++;
    if (type === 'img') {
      await handleImageDownloadRequest(url, conn, m);
    } else {
      await handleDownloadRequest(url, conn, m, type);
    }
  }
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.reply(m.chat, '❌ URL?.', m);
    return;
  }

  const args = text.trim().split(/\s+/);
  const url = args.find(arg => arg.startsWith('http'));

  if (!url) {
    await conn.reply(m.chat, '❌ URL', m);
    return;
  }

  const command = args[0].toLowerCase();
  let type = 'mhtml';

  if (command === 'pdf') {
    type = 'pdf';
  } else if (command === 'img') {
    type = 'img';
  }

  queue.push({ url, conn, m, type });
  processQueue();
};

handler.help = ['web', 'web pdf', 'web img'];
handler.tags = ['tools'];
handler.command = /^(web)$/i;
handler.owner = false;

export default handler;
