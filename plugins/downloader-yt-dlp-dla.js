// dla.js
// Copyright (C) 2025 Weskerty
//
// Este programa se distribuye bajo los términos de la Licencia Pública General Affero de GNU (AGPLv3).
// Usted puede usarlo, modificarlo y redistribuirlo bajo esa licencia.
// Licencia completa: https://www.gnu.org/licenses/agpl-3.0.html
// Cambio Actualizar Automaticamente.

import fs from "fs";
import path, { join, basename } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import os from "os";

const execFilePromise = promisify(execFile);
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

// Las banderas como arreglos argv (sin shell): cada elemento es UN argumento.
// Antes eran strings que se concatenaban en un comando de shell y el texto
// del usuario se interpolaba dentro, lo que permitía inyección de comandos.
const formats = {
  video: ['-f', 'sd/18/bestvideo[height<=720][vcodec*=h264]+bestaudio[acodec*=aac]/bestvideo[height<=720][vcodec*=h264]+bestaudio[acodec*=mp4a]/bestvideo[height<=720][vcodec*=h264]+bestaudio/bestvideo[height<=720]+bestaudio/bestvideo[vcodec*=h264]+bestaudio/bestvideo+bestaudio/best', '--sponsorblock-mark', 'all'],
  audio: ['-f', 'ba/best', '-x', '--audio-format', 'mp3', '--audio-quality', '0'],
  playlist: ['--yes-playlist'],
  noPlaylist: ['--no-playlist']
};

const commonFlags = [
  '--restrict-filenames',
  '--extractor-retries', '3',
  '--fragment-retries', '3',
  '--compat-options', 'no-youtube-unavailable-videos',
  '--ignore-errors',
  '--no-abort-on-error'
];

// Solo el propietario real puede subir cookies (antes cualquier usuario).
const isOwner = (m) => {
  const sender = m?.sender || '';
  return (global.owner || []).some(([number]) => String(number).replace(/[^0-9]/g, '') + '@s.whatsapp.net' === sender);
};

const isSafeUrl = (string) => {
  try {
    const u = new URL(string);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    // Nada de destinos locales o de red privada (SSRF).
    if (host === 'localhost' || host === '[::1]' || host.endsWith('.local')) return false;
    if (/^(0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
};

// Banderas que el usuario puede pasar a yt-dlp (las demás se rechazan).
// Fuera quedan, entre otras: --exec*, --config, --batch-file, -o/--output,
// --paths, --cookies*, --postprocessor-args, --ffmpeg-location,
// --download-archive, --cache-dir y --proxy.
const ALLOWED_USER_FLAGS = new Map([
  ['-f', true], ['--format', true],
  ['--format-sort', true],
  ['--no-playlist', false], ['--yes-playlist', false],
  ['--playlist-items', true],
  ['--max-filesize', true],
  ['--audio-format', true], ['--audio-quality', true],
  ['--remux-video', true], ['--recode-video', true], ['--video-format', true],
  ['--sponsorblock-mark', true], ['--sponsorblock-remove', true], ['--sponsorblock-chapter', true],
  ['--embed-thumbnail', false], ['--embed-subs', false], ['--write-subs', false],
  ['--sub-langs', true],
  ['--concurrent-fragments', true],
  ['--extractor-retries', true], ['--fragment-retries', true],
  ['--ignore-errors', false], ['--no-abort-on-error', false],
  ['--restrict-filenames', false],
]);

const parseUserOptions = (str) => {
  const tokens = str.match(/[^\s"]+|"([^"]*)"/g)?.map((arg) =>
    arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
  ) || [];
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok || !tok.startsWith('-')) throw new Error(`Opción no permitida: ${tok}`);
    const eq = tok.indexOf('=');
    const flag = eq === -1 ? tok : tok.slice(0, eq);
    const inlineValue = eq === -1 ? null : tok.slice(eq + 1);
    if (!ALLOWED_USER_FLAGS.has(flag)) throw new Error(`Opción no permitida: ${flag}`);
    if (ALLOWED_USER_FLAGS.get(flag)) {
      // Bandera con valor: --flag valor o --flag=valor.
      let value = inlineValue;
      if (value === null) {
        value = tokens[++i];
        if (value === undefined || value.startsWith('-')) throw new Error(`Falta el valor de ${flag}`);
      }
      if (/[\0\n\r]/.test(value)) throw new Error(`Valor no permitido para ${flag}`);
      out.push(flag, value);
    } else {
      if (inlineValue !== null) throw new Error(`La opción ${flag} no lleva valor`);
      out.push(flag);
    }
  }
  return out;
};

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

const buildCookiesArgs = async () => {
  try {
    await fs.promises.access(config.cookiesFile);
    return ['--cookies', config.cookiesFile];
  } catch {
    return [];
  }
};

const safeExecFile = async (file, args, silentError = false) => {
  try {
    return await execFilePromise(file, args);
  } catch (error) {
    if (!silentError) {
      console.error(`PLUGIN DLA Command: ${file} ${args.join(' ')}`);
      console.error(`PLUGIN DLA Error: ${error.message}`);
      if (error.stdout) console.error(`Stdout: ${error.stdout}`);
      if (error.stderr) console.error(`Stderr: ${error.stderr}`);
    }
    throw error;
  }
};

const isYtDlpAvailable = async () => {
  try {
    await execFilePromise('yt-dlp', ['--version']);
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
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  await ensureDirectories();
  const fileName = detectYtDlpBinaryName();
  const downloadUrl = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${fileName}`;
  const filePath = path.join(config.ytDlpPath, fileName);

  try {
    await safeExecFile('curl', ['-L', '-o', filePath, downloadUrl]);
    
    if (os.platform() !== 'win32') {
      await fs.promises.chmod(filePath, '755');
    }
    
    return `${filePath}`;
  } catch (error) {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`${tradutor.texto1[0]}${response.statusText}${tradutor.texto1[1]}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    if (os.platform() !== 'win32') {
      await fs.promises.chmod(filePath, '755');
    }

    return `${filePath}`;
  }
};

const updateYtDlp = async (m, errorMsg = null) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  try {
    const ytDlpPath = await detectYtDlpBinary(m);
    
    const result = await safeExecFile(ytDlpPath, ['--update-to', 'master']);
    
    const updateOutput = result.stdout || result.stderr || tradutor.texto2;
    const finalMsg = errorMsg ? `Stderr: ${errorMsg}\n\n${updateOutput}` : updateOutput;
    await m.reply(finalMsg);
    
    return true;
  } catch (error) {
    console.error(`PLUGIN DLA Update error: ${error.message}`);
    const errorOutput = error.stdout || error.stderr || `${tradutor.texto3[0]}${error.message}${tradutor.texto3[1]}`;
    const finalMsg = errorMsg ? `Stderr: ${errorMsg}\n\n${errorOutput}` : errorOutput;
    await m.reply(finalMsg);
    return false;
  }
};

const uploadCookies = async (m, cookieText = null) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  try {
    let cookieContent = null;

    if (cookieText) {
      cookieContent = cookieText;
    } else if (m.quoted && m.quoted.fileSha256) {
      const media = await m.quoted.download();
      if (!media) {
        await m.reply(tradutor.texto4);
        return;
      }
      cookieContent = media.toString();
    } else {
      await m.reply(tradutor.texto5);
      return;
    }

    await ensureDirectories();
    await fs.promises.writeFile(config.cookiesFile, cookieContent);
    
    await m.reply(`${tradutor.texto6[0]}${config.cookiesFile}${tradutor.texto6[1]}`);
  } catch (error) {
    console.error(`PLUGIN DLA Cookie upload error: ${error.message}`);
    await m.reply(`${tradutor.texto7[0]}${error.message}${tradutor.texto7[1]}`);
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
    console.error(`PLUGIN DLA Error procesando archivo ${filePath}: ${error.message}`);
    throw error;
  }
};

const downloadWithYtDlp = async (m, urls, customOptions = [], enablePlaylist = false, isVideo = false) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  const ytDlpPath = await detectYtDlpBinary(m);
  const sessionId = `yt-dlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputDir = path.join(config.tempDir, sessionId);
  const cookiesArgs = await buildCookiesArgs();

  await ensureDirectories();
  await fs.promises.mkdir(outputDir, { recursive: true });

  try {
    for (const url of urls) {
      if (!isSafeUrl(url)) throw new Error(`URL no permitida: ${url}`);
      const outputTemplate = path.join(outputDir, '%(title).20s.%(ext)s');
      const playlistArgs = enablePlaylist ? [...formats.playlist, '--playlist-items', `1:${config.playlistLimit}`] : [...formats.noPlaylist];

      const args = [
        '--max-filesize', String(config.maxFileSize),
        ...commonFlags,
        ...playlistArgs,
        ...cookiesArgs,
        ...customOptions,
        '-o', outputTemplate,
        url
      ];

      try {
        await safeExecFile(ytDlpPath, args);
        
        const files = await fs.promises.readdir(outputDir);
        
        for (const file of files) {
          const fullPath = path.join(outputDir, file);
          
          try {
            await processDownloadedFile(m, fullPath, file, isVideo);
          } catch (processError) {
            console.error(`PLUGIN DLA Error procesando archivo ${file}: ${processError.message}`);
          }
        }
      } catch (error) {
        const errorMsg = error.stderr || error.message || tradutor.texto8;
        await updateYtDlp(m, errorMsg);
      }
    }
  } finally {
    await fs.promises.rm(outputDir, { recursive: true, force: true }).catch((err) => {
      console.error(`PLUGIN DLA Error limpiando directorio temporal: ${err.message}`);
    });
  }
};

const searchAndDownload = async (m, searchQuery, isVideo = false) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  const sessionId = `yt-dlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const outputDir = path.join(config.tempDir, sessionId);
  const cookiesArgs = await buildCookiesArgs();
  
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
        const args = [
          '--max-filesize', String(config.maxFileSize),
          ...commonFlags,
          '--playlist-items', '1',
          ...formatOptions,
          ...cookiesArgs,
          '-o', outputTemplate,
          `${source}10:${searchQuery}`
        ];
        
        await safeExecFile(ytDlpPath, args);

        const files = await fs.promises.readdir(outputDir);
        
        if (files.length > 0) {
          await Promise.all(
            files.map(file => processDownloadedFile(m, path.join(outputDir, file), file, isVideo))
          );
          success = true;
          break;
        }
      } catch (error) {
        const errorMsg = error.stderr || error.message || tradutor.texto8;
        await updateYtDlp(m, errorMsg);
        
        await fs.promises.rm(outputDir, { recursive: true, force: true }).catch(() => {});
        await fs.promises.mkdir(outputDir, { recursive: true });
      }
    }

    if (!success) {
      console.error(`PLUGIN DLA No se encontraron resultados para ${searchQuery}`);
    }
  } finally {
    await fs.promises.rm(outputDir, { recursive: true, force: true }).catch((err) => {
      console.error(`PLUGIN DLA Error limpiando directorio temporal: ${err.message}`);
    });
  }
};

const handleRequest = async (m) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_yt_dlp_dla

  const input = cleanCommand(m.text.trim());
  
  if (!input) {
    await m.reply(
      tradutor.texto9
    );
    return;
  }

  try {
    const args = input.match(/[^\s"]+|"([^"]*)"/g)?.map(arg => 
      arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
    ) || [];

    const command = args[0];
    const remainingArgs = args.slice(1);
    const urls = remainingArgs.filter(arg => isUrl(arg));

    if (command === 'cookies') {
      // Subir cookies solo lo puede hacer el propietario real.
      if (!isOwner(m)) throw new Error('Solo el propietario puede subir cookies');
      const cookiesIndex = input.toLowerCase().indexOf('cookies');
      if (cookiesIndex !== -1) {
        const cookieText = input.substring(cookiesIndex + 'cookies'.length).trim();
        await uploadCookies(m, cookieText || null);
      } else {
        await uploadCookies(m, null);
      }
      return;
    }
    
    await m.reply(tradutor.texto10);
    
    if (!urls.length) {
      if (input.includes('://')) {
        const inputUrl = input.match(/(https?:\/\/[^\s]+)/)?.[1];
        if (inputUrl) {
          if (!isSafeUrl(inputUrl)) throw new Error(`URL no permitida: ${inputUrl}`);
          const options = input.replace(inputUrl, '').trim();
          await downloadWithYtDlp(m, [inputUrl], [...formats.video, ...parseUserOptions(options)], false, true);
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
      case 'mp3':
        if (urls.length) {
          const userOptions = parseUserOptions(remainingArgs
            .filter(arg => !isUrl(arg))
            .join(' '));
          await downloadWithYtDlp(m, urls, [...formats.audio, ...userOptions], true, false);
        }
        break;

      default:
        const userOptions = parseUserOptions(remainingArgs
          .filter(arg => !isUrl(arg))
          .join(' '));
        await downloadWithYtDlp(m, urls, [...formats.video, ...userOptions], false, true);
        break;
    }
  } catch (error) {
    console.error(`PLUGIN DLA Error en comando dla: ${error.message}`);
    await m.reply(`${tradutor.texto11[0]}${error.message}${tradutor.texto11[1]}`);
  }
};

let handler = (m) => {
  return downloadQueue.add(() => handleRequest(m));
};

handler.help = ['dla [OPTIONS] URL', 'dla vd <consulta>', 'dla mp3 <url>', 'dla cookies [texto]'];
handler.tags = ['tools'];
handler.command = /^(dla)$/i;
handler.owner = false;

export default handler;
