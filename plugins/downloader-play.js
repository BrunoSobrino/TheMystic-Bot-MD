import path from 'path';
import fs from 'fs';
import pkg from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yts from 'yt-search'; // Asegúrate de importar yts para la búsqueda

const { exec } = pkg;
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let limit1 = 100; // Límite inferior para audio
let limit2 = 400; // Límite superior para video
let limit_a1 = 50; // Límite inferior para tamaño de audio
let limit_a2 = 400; // Límite superior para tamaño de audio

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;

  const yt_play = await search(args.join(' '));
  let additionalText = '';
  if (['play', 'play3', 'playdoc'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2', 'play4', 'playdoc2'].includes(command)) {
    additionalText = 'vídeo';
  }

  if (!yt_play || !yt_play[0]?.title) return m.reply('> *[❗] Error: Audio/Video not found.*`');
  
  const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${secondString(yt_play[0].duration.seconds)}\n${tradutor.texto2[3]} ${MilesNumber(yt_play[0].views)}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();

  conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

  if (['play', 'play3', 'playdoc'].includes(command)) {
    try {
      const buff_aud = await downloadMedia(yt_play[0].url, 'audio');
      const fileSizeInBytes = buff_aud.byteLength;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      const size = fileSizeInMB.toFixed(2);

      if (size >= limit_a2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto3} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }
      if (size >= limit_a1) {
        await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3` }, { quoted: m });
        return;
      }
      await conn.sendMessage(m.chat, { audio: buff_aud, mimetype: 'audio/mpeg', fileName: `${yt_play[0].title}.mp3` }, { quoted: m });
      return;

    } catch (error) {
      console.error('Error fetching audio:', error);
      throw tradutor.texto4;
    }
  }

  if (['play2', 'play4', 'playdoc2'].includes(command)) {
    try {
      const buff_vid = await downloadMedia(yt_play[0].url, 'video');
      const fileSizeInBytes2 = buff_vid.byteLength;
      const fileSizeInMB2 = fileSizeInBytes2 / (1024 * 1024);
      const size2 = fileSizeInMB2.toFixed(2);

      if (size2 >= limit2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto5} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }
      if (size2 >= limit1) {
        await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: `${yt_play[0].title}.mp4`, caption: `🎥 Aquí está el video ` }, { quoted: m });
        return;
      }
      await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: `${yt_play[0].title}.mp4`, caption: `🎥 Aquí está el video ` }, { quoted: m });
      return;

    } catch (error) {
      console.error('Error fetching video:', error);
      throw tradutor.texto6;
    }
  }
};

handler.command = /^(play|play2|play3|play4|playdoc|playdoc2)$/i;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

async function downloadMedia(url, type) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const outputFilePath = path.join(tempDir, `media.${type === 'audio' ? 'mp3' : 'mp4'}`);
    const options = {
      noPlaylist: true,
      output: outputFilePath,
      format: type === 'video' ? 'bestvideo[height<=480]+bestaudio' : 'bestaudio', // Reducir calidad de video a 480p
      mergeOutputFormat: type === 'video' ? 'mp4' : undefined
    };

    if (type === 'audio') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
    }

    const process = exec(url, options, { stdio: ['ignore', 'pipe', 'pipe'] });
    const errors = [];

    process.stderr.on('data', chunk => errors.push(chunk));
    process.on('close', (code) => {
      if (code !== 0 || errors.length > 0) {
        reject(Buffer.concat(errors).toString());
      } else {
        fs.readFile(outputFilePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
            fs.unlink(outputFilePath, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
          }
        });
      }
    });
    process.on('error', reject);
  });
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? 'd ' : 'd ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? 'h ' : 'h ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? 'm ' : 'm ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? 's' : 's') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

const getBuffer = async (url, options) => {
  options ? options : {};
  const res = await axios({
    method: 'get',
    url,
    headers: {
      'DNT': 1,
      'Upgrade-Insecure-Request': 1,
    },
    ...options,
    responseType: 'arraybuffer'
  });
  return res.data;
};
