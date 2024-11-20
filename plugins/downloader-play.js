import path from 'path';
import yts from 'yt-search';
import pkg from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const { exec } = pkg;
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let limit1 = 100;
let limit2 = 400;
let limit_a1 = 50;
let limit_a2 = 400;

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) {
    conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
    return;
  }

  const yt_play = await search(args.join(' '));
  let additionalText = '';
  if (['play', 'play3', 'playdoc'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2', 'play4', 'playdoc2'].includes(command)) {
    additionalText = 'vídeo';
  }

  if (!yt_play || !yt_play[0]?.title) return m.reply('> *[❗] Error: Audio/Video not found.*`');

  conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });

  if (['play', 'play3', 'playdoc'].includes(command)) {
    try {
      const buff_aud = await downloadMedia(yt_play[0].url, 'audio');
      const fileSizeInMB = (buff_aud.byteLength / (1024 * 1024)).toFixed(2);

      if (fileSizeInMB >= limit_a2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto3} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: buff_aud,
          mimetype: 'audio/mpeg',
          fileName: `${yt_play[0].title}.mp3`,
          ptt: true, // Enviar como grabación de voz
        },
        { quoted: m }
      );
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw tradutor.texto4;
    }
  }

  if (['play2', 'play4', 'playdoc2'].includes(command)) {
    try {
      const buff_vid = await downloadMedia(yt_play[0].url, 'video');
      const fileSizeInMB2 = (buff_vid.byteLength / (1024 * 1024)).toFixed(2);

      if (fileSizeInMB2 >= limit2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto5} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }

      if (fileSizeInMB2 >= limit1 && fileSizeInMB2 <= limit2) {
        await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: `${yt_play[0].title}.mp4`, caption: `🎥 Aquí está el video ` }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: `${yt_play[0].title}.mp4`, caption: `🎥 Aquí está el video ` }, { quoted: m });
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      throw tradutor.texto6;
    }
  }
};

handler.command = /^(play|play2|play3|play4|playdoc|playdoc2)$/i;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
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
      format: type === 'video' ? 'bestvideo[height<=420]+bestaudio' : 'bestaudio',
      mergeOutputFormat: type === 'video' ? 'mp4' : undefined,
      quiet: true
    };

    if (type === 'audio') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.audioQuality = '5'; // Reduce calidad
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
