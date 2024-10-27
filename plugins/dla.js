// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

import fs from "fs";
import path, { join, basename } from "path";
import { exec } from "child_process";
import { promisify } from "util";  // Para hacer que exec sea promisificado.

const execPromise = promisify(exec);
const __dirname = path.resolve();
const ytDlpTempDirectory = path.join(process.cwd(), 'src/tmp/YTDLP');
const curlTempDirectory = path.join(process.cwd(), 'src/tmp/CURL');
const maxDownloads = 5; // Instancias Permitidas
let activeDownloads = 0;
const queue = [];

const cleanCommand = (text) => text.replace(/^\.(dla)\s*/i, "").trim();
const filterArgs = (args, filter) => args.filter(filter);

const processQueue = () => {
  if (activeDownloads >= maxDownloads) {
    const { m } = queue[0]; 
    m.reply(`Hay ${maxDownloads} Descargas Activas, tu Archivo Tardara un Rato.`);
    return;
  }

  if (!queue.length) return; 
  
  const { m, resolve, reject } = queue.shift();
  activeDownloads++;

  handleRequest(m)
    .then(resolve)
    .catch(reject)
    .finally(() => {
      activeDownloads--;
      processQueue(); 
    });
};

let handler = (m) => {
  return new Promise((resolve, reject) => {
    queue.push({ m, resolve, reject });
    processQueue();
  });
};

const handleRequest = async (m) => {
  const command = cleanCommand(m.text.trim());
  const args = command.split(/\s+/);
  const urls = filterArgs(args, arg => arg.startsWith("http"));

  if (args[0] === 'update') return await updateYtDlp(m);

  if (args[0] === 'curl' && urls.length) {
    const options = filterArgs(args, arg => !arg.startsWith("http") && arg !== 'curl').join(' ');
    await Promise.all(urls.map(url => downloadWithCurl(m, url, options)));
    return;
  }

  if (!urls.length) return await execWithoutUrl(m, args.join(' '));

  const options = filterArgs(args, arg => !arg.startsWith("http")).join(' ');
  await Promise.all(urls.map(url => downloadAndSend(m, url, options)));
};

const execWithoutUrl = async (m, options) => {
  try {
    await m.reply(`⏳ Ejecutando...`);
    const result = await execPromise(`yt-dlp ${options}`);
    await m.reply(`✅ \n${result}`);
  } catch (error) {
    await sendErrorMessage(m, error, `yt-dlp ${options}`);
  }
};

// YT-DLP
const downloadAndSend = async (m, url, options) => {
  let outputFilePathPrefix = join(ytDlpTempDirectory, `download_${Date.now()}`);
  try {
    await prepareDirectory(ytDlpTempDirectory);
    await m.reply(`⏳ Descargando con YT-DLP...`);
    await execPromise(`yt-dlp ${options} --max-filesize 1500M --yes-playlist --abort-on-error -o "${outputFilePathPrefix}_%(title)s.%(ext)s" "${url}"`);

    const downloadedFiles = await findDownloadedFiles(outputFilePathPrefix, ytDlpTempDirectory);
    for (const downloadedFile of downloadedFiles) {
      await sendDownloadedFile(m, join(ytDlpTempDirectory, downloadedFile));
    }
  } catch (error) {
    await sendErrorMessage(m, error, `yt-dlp ${options} -o "${outputFilePathPrefix}_%(title)s.%(ext)s" "${url}"`);
  } finally {
    await cleanupFiles(ytDlpTempDirectory, outputFilePathPrefix);
  }
};

// CURL 
const downloadWithCurl = async (m, url, options) => {
  const fileNameFromUrl = basename(new URL(url).pathname);
  const outputFilePath = join(curlTempDirectory, `download_${Date.now()}_${fileNameFromUrl}`);

  try {
    await prepareDirectory(curlTempDirectory);
    await m.reply(`⏳ Descargando con CURL...`);
    
    // Ejecutamos curl
    await execPromise(`curl --max-filesize 1500000000 ${options} -o "${outputFilePath}" "${url}"`);
    
    if (fs.existsSync(outputFilePath)) {
      await sendDownloadedFile(m, outputFilePath);
    } else {
      throw new Error(`Archivo no descargado: ${outputFilePath}`);
    }
  } catch (error) {
    await sendErrorMessage(m, error, `curl ${options} -o "${outputFilePath}" "${url}"`);
  } finally {
    await cleanupFiles(curlTempDirectory, outputFilePath);
  }
};

// YT-DLP
const updateYtDlp = async (m) => {
  try {
    await m.reply(`⏳ Actualizando YT-DLP...`);
    await execPromise(`python3 -m pip install -U --pre "yt-dlp[default]"`);
    await m.reply(`✅ YT-DLP actualizado (python3).`);
  } catch (error) {
    try {
      const result = await execPromise(`python -m pip install -U --pre "yt-dlp[default]"`);
      await m.reply(`✅ YT-DLP actualizado (python).\n${result}`);
    } catch (error2) {
      await sendErrorMessage(m, error2, "python -m pip install -U --pre yt-dlp");
    }
  }
};

const prepareDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const findDownloadedFiles = (filePathPrefix, directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) reject(err);
      resolve(files.filter(file => file.startsWith(path.basename(filePathPrefix))));
    });
  });
};

const sendDownloadedFile = (m, filePath) => {
  fs.stat(filePath, (err, stats) => {
    if (!err) {
      conn.sendMessage(m.chat, {
        document: { url: filePath },
        mimetype: 'video/mp4',
        fileName: path.basename(filePath)
      }, { quoted: m }, () => {
        fs.unlink(filePath, (err) => { if (err) console.error(err); });
      });
    } else {
      console.error("Error al enviar el archivo:", err);
    }
  });
};

const cleanupFiles = (directory, filePathPrefix) => {
  fs.readdir(directory, (err, files) => {
    if (err) return console.error("Error al limpiar los archivos:", err);
    files.forEach(file => {
      if (file.startsWith(path.basename(filePathPrefix))) {
        fs.unlink(join(directory, file), (err) => {
          if (err) console.error("Error al eliminar el archivo:", err);
        });
      }
    });
  });
};

const sendErrorMessage = (m, error, command) => {
  m.reply(`❌ \n${error.message || error}\n\nComando ejecutado:\n${command}`);
};

handler.help = ['dla [OPTIONS] URL', 'dla update', 'dla curl [OPTIONS] URL'];
handler.tags = ['tools'];
handler.command = /^(dla)$/i;
handler.owner = false;

export default handler;
