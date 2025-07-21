// dla.js
// Copyright (C) 2025 Weskerty
//
// Este programa se distribuye bajo los términos de la Licencia Pública General Affero de GNU (AGPLv3).
// Usted puede usarlo, modificarlo y redistribuirlo bajo esa licencia.
// Licencia completa: https://www.gnu.org/licenses/agpl-3.0.html

import fs from "fs";
import path, { join, basename } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execPromise = promisify(exec);
const __dirname = path.resolve();

const config = {
  tempDir: process.env.TEMP_DOWNLOAD_DIR || path.join(process.cwd(), 'src/tmp/YTDLP'),
  maxFileSize: (parseInt(process.env.MAX_UPLOAD, 10) * 1048576) || 1500000000,
  ytDlpPath: path.join(process.cwd(), 'src/tmp/YTDLP'),
  maxConcurrent: parseInt(process.env.MAXSOLICITUD, 10) || 5,
  playlistLimit: parseInt(process.env.PLAYLIST_LIMIT, 10) || 10,
  cookiesFile: path.join(process.cwd(), 'src/tmp/YTDLP/cookies.txt')
};

const ytDlpBinaries = new Map([
  ['win32-x64', 'yt-dlp.exe'],
  ['win32-ia32', 'yt-dlp_x86.exe'],
  ['darwin', 'yt-dlp_macos'],
  ['linux-x64', 'yt-dlp_linux'],
  ['linux-arm64', 'yt-dlp_linux_aarch64'],
  ['linux-arm', 'yt-dlp_linux_armv7l'],
  ['default', 'yt-dlp'],
]);

const formats = {
  video: '-f "sd/bv[vcodec*=h264][height<=720]/bv[height<=720]/bv*+ba/best" --format-sort "height:720,vcodec:h264,acodec:aac,ext:mp4"',
  audio: '-f "ba/best" -x --audio-format mp3 --audio-quality 0',
  playlist: '--yes-playlist',
  noPlaylist: '--no-playlist'
};

const commonFlags = [
  '--restrict-filenames',
  '--extractor-retries 3',
  '--fragment-retries 3',
  '--compat-options no-youtube-unavailable-videos',
  '--ignore-errors',
  '--no-abort-on-error'
].join(' ');

class DownloadQueue {
  constructor(maxConcurrent = 5) {
    this.queue = [];
    this.activeDownloads = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.activeDownloads >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.activeDownloads++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeDownloads--;
      this.processNext();
    }
  }
}

const downloadQueue = new DownloadQueue(config.maxConcurrent);

const cleanCommand = (text) => text.replace(/^\.(dla)\s*/i, "").trim();
const isUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const buildCookiesFlag = async () => {
  try {
    await fs.promises.access(config.cookiesFile);
    return `--cookies "${config.cookiesFile}"`;
  } catch {
    return '';
  }
};

const safeExecute = async (command, silentError = false) => {
  try {
    const result = await execPromise(command);
    return result;
  } catch (error) {
    if (!silentError) {
      console.error(`Command: ${command}`);
      console.error(`Error: ${error.message}`);
      if (error.stdout) console.error(`Stdout: ${error.stdout}`);
      if (error.stderr) console.error(`Stderr: ${error.stderr}`);
    }
    throw error;
  }
};

const isYtDlpAvailable = async () => {
  try {
    await execPromise('yt-dlp --version');
    return true;
  } catch {
    return false;
  }
};

const detectYtDlpBinaryName = () => {
  const platform = os.platform();
  const arch = os.arch();
  const key = `${platform}-${arch}`;
  return ytDlpBinaries.get(key) || ytDlpBinaries.get('default');
};

const ensureDirectories = async () => {
  await Promise.all([
    fs.promises.mkdir(config.tempDir, { recursive: true }),
    fs.promises.mkdir(config.ytDlpPath, { recursive: true }),
  ]);
};

const detectYtDlpBinary = async (m) => {
  if (await isYtDlpAvailable()) {
    return 'yt-dlp';
  }

  const fileName = detectYtDlpBinaryName();
  const filePath = path.join(config.ytDlpPath, fileName);
  
  try {
    await fs.promises.access(filePath);
    return `${filePath}`;
  } catch {
    return await downloadYtDlp(m);
  }
};

const downloadYtDlp = async (m) => {
  await ensureDirectories();
  const fileName = detectYtDlpBinaryName();
  const downloadUrl = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${fileName}`;
  const filePath = path.join(config.ytDlpPath, fileName);

  try {
    await safeExecute(`curl -L -o "${filePath}" "${downloadUrl}"`);
    
    if (os.platform() !== 'win32') {
      await fs.promises.chmod(filePath, '755');
    }
    
    return `${filePath}`;
  } catch (error) {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`Descarga fallida: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    if (os.platform() !== 'win32') {
      await fs.promises.chmod(filePath, '755');
    }

    return `${filePath}`;
  }
};

const processDownloadedFile = async (m, filePath, originalFileName, isVideo = false) => {
  try {
    await fs.promises.access(filePath);
    
    if (isVideo) {
      await conn.sendMessage(m.chat, { video: { url: filePath }, mimetype: "video/mp4" }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { audio: { url: filePath }, mimetype: "audio/mpeg" }, { quoted: m });
    }

    await fs.promises.unlink(filePath).catch(() => {});
  } catch (error) {
    console.error(`Error procesando archivo ${filePath}: ${error.message}`);
    throw error;
  }
};

const downloadWithYtDlp = async (m, urls, customOptions = '', enablePlaylist = false, isVideo = false) => {
  const ytDlpPath = await detectYtDlpBinary(m);
  const sessionId = `yt-dlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputDir = path.join(config.tempDir, sessionId);
  const cookiesFlag = await buildCookiesFlag();

  await ensureDirectories();
  await fs.promises.mkdir(outputDir, { recursive: true });

  try {
    for (const url of urls) {
      const outputTemplate = path.join(outputDir, '%(title).20s.%(ext)s');
      const playlistFlag = enablePlaylist ? formats.playlist : formats.noPlaylist;
      const playlistItemsFlag = enablePlaylist ? `--playlist-items 1:${config.playlistLimit}` : '';
      
      const command = [
        ytDlpPath,
        `--max-filesize ${config.maxFileSize}`,
        commonFlags,
        playlistFlag,
        playlistItemsFlag,
        cookiesFlag,
        customOptions,
        `-o "${outputTemplate}"`,
        `"${url}"`
      ].filter(Boolean).join(' ');

      console.log(`Ejecutando comando: ${command}`);
      console.log(`Directorio de salida: ${outputDir}`);

      try {
        await safeExecute(command);
        
        try {
          await fs.promises.access(outputDir);
          const files = await fs.promises.readdir(outputDir);
          console.log(`Archivos encontrados: ${files.length}`);
          
          if (files.length === 0) {
            console.log('No se descargaron archivos');
            continue;
          }
          
          for (const file of files) {
            const fullPath = path.join(outputDir, file);
            console.log(`Procesando archivo: ${fullPath}`);
            
            try {
              await processDownloadedFile(m, fullPath, file, isVideo);
            } catch (processError) {
              console.error(`Error procesando archivo ${file}: ${processError.message}`);
            }
          }
        } catch (dirError) {
          console.error(`Error accediendo al directorio ${outputDir}: ${dirError.message}`);
        }
      } catch (error) {
        console.error(`Descarga fallida para ${url}: ${error.message}`);
        throw error;
      }
    }
  } finally {
    await fs.promises.rm(outputDir, { recursive: true, force: true }).catch((err) => {
      console.error(`Error limpiando directorio temporal: ${err.message}`);
    });
  }
};

const updateYtDlp = async (m, silent = false) => {
  try {
    const ytDlpPath = await detectYtDlpBinary(m);
    
    if (await isYtDlpAvailable()) {
      if (!silent) {
        await m.reply('ℹ️ yt-dlp instalado en sistema, no se actualiza automaticamente');
      }
      return;
    } else {
      const fileName = detectYtDlpBinaryName();
      const filePath = path.join(config.ytDlpPath, fileName);
      
      try {
        await safeExecute(`${ytDlpPath} --update-to nightly`);
        if (!silent) {
          await m.reply(`✅ yt-dlp auto-actualizado desde binario`);
        }
        return;
      } catch {
        try {
          await fs.promises.unlink(filePath).catch(() => {});
          const newPath = await downloadYtDlp(m);
          if (!silent) {
            await m.reply(`✅ yt-dlp actualizado descargando nuevo binario`);
          }
        } catch {
          if (!silent) {
            await m.reply('❌ Error actualizando yt-dlp');
          }
        }
      }
    }
  } catch (error) {
    if (!silent) {
      await m.reply('⚠️ Actualizacion de yt-dlp intentada');
    }
  }
};

const searchAndDownload = async (m, searchQuery, isVideo = false) => {
  const sessionId = `yt-dlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputDir = path.join(config.tempDir, sessionId);
  const cookiesFlag = await buildCookiesFlag();
  
  await ensureDirectories();
  await fs.promises.mkdir(outputDir, { recursive: true });

  try {
    const outputTemplate = path.join(outputDir, '%(title).20s.%(ext)s');
    const ytDlpPath = await detectYtDlpBinary(m);
    
    const formatOptions = isVideo ? formats.video : formats.audio;
    
    const searchSources = [
      { source: 'ytsearch', name: 'YouTube' },
      ...(isVideo ? [] : [
          { source: 'scsearch', name: 'SoundCloud' },
          { source: 'nicosearch', name: 'NicoNico' }
      ])
    ];

    let success = false;

    for (const { source, name } of searchSources) {
      if (success) break;

      try {
        const command = [
          ytDlpPath,
          `--max-filesize ${config.maxFileSize}`,
          commonFlags,
          '--playlist-items 1',
          formatOptions,
          cookiesFlag,
          `-o "${outputTemplate}"`,
          `"${source}10:${searchQuery}"`
        ].filter(Boolean).join(' ');
        
        console.log(`Buscando en ${name}: ${command}`);
        
        await safeExecute(command);

        try {
          await fs.promises.access(outputDir);
          const files = await fs.promises.readdir(outputDir);
          console.log(`Archivos encontrados en ${name}: ${files.length}`);
          
          if (files.length > 0) {
            await Promise.all(
              files.map(file => processDownloadedFile(m, path.join(outputDir, file), file, isVideo))
            );
            success = true;
            break;
          }
        } catch (dirError) {
          console.error(`Error accediendo al directorio despues de busqueda: ${dirError.message}`);
        }
      } catch (error) {
        console.error(`Error buscando en ${name}: ${error.message}`);
        await fs.promises.rm(outputDir, { recursive: true, force: true }).catch(() => {});
        await fs.promises.mkdir(outputDir, { recursive: true });
      }
    }

    if (!success) {
      console.error(`No se encontraron resultados para ${searchQuery}`);
    }
  } finally {
    await fs.promises.rm(outputDir, { recursive: true, force: true }).catch((err) => {
      console.error(`Error limpiando directorio temporal: ${err.message}`);
    });
  }
};

const handleRequest = async (m) => {
  const input = cleanCommand(m.text.trim());
  
  if (!input) {
    await m.reply(
      '> 🎶Buscar y descargar cancion:\n`dla` <consulta>\n' +
      '> 🎥Buscar y descargar video:\n`dla vd` <consulta>\n' +
      '> ⬇️Descargar todo tipo de media: \n`dla` <url> _YT-DLP FLAGS_ \n' +
      '> 🎵Descargar todo el audio de playlist: \n`dla mp3` <url> \n' +
      '> 🆙Fallo en descarga? Actualizar YT-DLP: \n`dla update` \n' +
      '> 🌐Mas informacion:\ngithub.com/yt-dlp/yt-dlp/blob/master/README.md#usage-and-options'
    );
    return;
  }

  await m.reply('Descargando!');

  try {
    const args = input.match(/[^\s"]+|"([^"]*)"/g)?.map(arg => 
      arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
    ) || [];

    const command = args[0];
    const remainingArgs = args.slice(1);
    const urls = remainingArgs.filter(arg => isUrl(arg));
    
    if (!urls.length && command !== 'update') {
      if (input.includes('://')) {
        const inputUrl = input.match(/(https?:\/\/[^\s]+)/)?.[1];
        if (inputUrl) {
          const options = input.replace(inputUrl, '').trim();
          await downloadWithYtDlp(m, [inputUrl], `${formats.video} ${options}`, false, true);
          return;
        }
      }
      if (command === 'vd') {
        await searchAndDownload(m, remainingArgs.join(' '), true);
      } else {
        await searchAndDownload(m, input, false);
      }
      return;
    }

    switch (command) {
      case 'update':
        await updateYtDlp(m);
        break;

      case 'mp3':
        if (urls.length) {
          const options = remainingArgs
            .filter(arg => !isUrl(arg))
            .join(' ');
          await downloadWithYtDlp(m, urls, `${formats.audio} ${options}`, true, false);
        }
        break;

      default:
        const options = remainingArgs
          .filter(arg => !isUrl(arg))
          .join(' ');
        await downloadWithYtDlp(m, urls, `${formats.video} ${options}`, false, true);
        break;
    }
  } catch (error) {
    console.error(`Error en comando dla: ${error.message}`);
    await m.reply(`Error: ${error.message}`);
  }
};

let handler = (m) => {
  return downloadQueue.add(() => handleRequest(m));
};

handler.help = ['dla [OPTIONS] URL', 'dla update', 'dla vd <consulta>', 'dla mp3 <url>'];
handler.tags = ['tools'];
handler.command = /^(dla)$/i;
handler.owner = false;

export default handler;
