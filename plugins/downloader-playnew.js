import path from 'path';
import fs from 'fs';
import pkg from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yts from 'yts-search'; 

const { exec } = pkg;
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const limit1 = 100; // MB
const limit2 = 400; // MB
const limit_a1 = 50; // MB
const limit_a2 = 400; // MB

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;

  const yt_play = await search(args.join(' '));
  let additionalText = (['play', 'play3', 'playdoc'].includes(command)) ? 'audio' : 'vídeo';

  if (!yt_play || !yt_play[0]?.title) return m.reply('> *[❗] Error: Audio/Video not found.*`');

  const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${secondString(yt_play[0].duration.seconds)}\n${tradutor.texto2[3]} ${MilesNumber(yt_play[0].views)}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();

  conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

  if (['play', 'play3', 'playdoc'].includes(command)) {
    try {
      const buff_aud = await downloadMedia(yt_play[0].url, 'audio');
      const size = (buff_aud.byteLength / (1024 * 1024)).toFixed(2); // Size in MB

      if (size >= limit_a2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto3} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }

      const mimetype = 'audio/mpeg';
      const fileName = `${yt_play[0].title}.mp3`;

      if (size >= limit_a1) {
        await conn.sendMessage(m.chat, { document: buff_aud, mimetype, fileName }, { quoted: m });
        return;
      }

      await conn.sendMessage(m.chat, { audio: buff_aud, mimetype, fileName }, { quoted: m });

    } catch (error) {
      console.error('Error fetching audio:', error);
      throw tradutor.texto4;
    }
  }

  if (['play2', 'play4', 'playdoc2'].includes(command)) {
    try {
      const buff_vid = await downloadMedia(yt_play[0].url, 'video');
      const size = (buff_vid.byteLength / (1024 * 1024)).toFixed(2); // Size in MB

      if (size >= limit2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto5} _${yt_play[0].url}_` }, { quoted: m });
        return;
      }

      const mimetype = 'video/mp4';
      const fileName = `${yt_play[0].title}.mp4`;
      const caption = `🎥 Aquí está el video`;

      if (size >= limit1) {
        await conn.sendMessage(m.chat, { document: buff_vid, mimetype, fileName, caption }, { quoted: m });
        return;
      }

      await conn.sendMessage(m.chat, { video: buff_vid, mimetype, fileName, caption }, { quoted: m });

    } catch (error) {
      console.error('Error fetching video:', error);
      throw tradutor.texto6;
    }
  }
};

handler.command = /^(play|play2|play3|play4|playdoc|playdoc2)$/i;
export default handler;

async function search(query, options = {}) {
  const searchResult = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return searchResult.videos;
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
      format: type === 'video' ? 'bestvideo[height<=480]+bestaudio' : 'bestaudio',
      mergeOutputFormat: type === 'video' ? 'mp4' : undefined,
      extractAudio: type === 'audio',
      audioFormat: type === 'audio' ? 'mp3' : undefined,
    };

    const process = exec(url, options, { stdio: ['ignore', 'pipe', 'pipe'] });
    const errors = [];

    process.stderr.on('data', chunk => errors.push(chunk));
    process.on('close', (code) => {
      if (code !== 0 || errors.length > 0) {
        reject(Buffer.concat(errors).toString());
      } else {
        handleFileRead(outputFilePath, type, resolve, reject);
      }
    });

    process.on('error', reject);
  });
}

function handleFileRead(outputFilePath, type, resolve, reject) {
  if (type === 'video') {
    const convertedFilePath = path.join(__dirname, 'temp', `converted_media.mp4`);
    ffmpeg(outputFilePath)
      .output(convertedFilePath)
      .on('end', () => {
        fs.readFile(convertedFilePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            cleanupFiles([outputFilePath, convertedFilePath]);
            resolve(data);
          }
        });
      })
      .on('error', reject)
      .run();
  } else {
    fs.readFile(outputFilePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        cleanupFiles([outputFilePath]);
        resolve(data);
      }
    });
  }
}

function cleanupFiles(files) {
  files.forEach(file => {
    fs.unlink(file, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
    });
  });
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0]
