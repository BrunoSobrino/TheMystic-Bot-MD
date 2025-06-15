import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import tools from '@takanashi-soft/tools';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import mm from 'music-metadata';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { proto, generateWAMessageFromContent } from 'baileys';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;
  
  let additionalText = '';
  if (['test1'].includes(command)) {
    additionalText = 'audio';
  } else if (['test2'].includes(command)) {
    additionalText = 'vídeo';
  }

  const yt_play = await search(args.join(' '));
  const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${yt_play[0].duration.timestamp}\n${tradutor.texto2[3]} ${yt_play[0].views}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
  
  conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

  if (command === 'test1') {
    try {
      const audiodlp = await tools.downloader.ytmp3(yt_play[0].url);
      const downloader = audiodlp.download;
      
      // Obtener letra de la canción
      let lyrics = '';
      try {
        lyrics = await getLyrics(yt_play[0].title, yt_play[0].author.name);
      } catch (e) {
        console.log('No se pudo obtener la letra:', e);
      }
      
      // Descargar la imagen de portada
      let coverBuffer;
      try {
        coverBuffer = await getBuffer(yt_play[0].thumbnail);
      } catch (e) {
        console.log('No se pudo obtener la portada:', e);
      }
      
      // Procesar el archivo para agregar metadatos
      const audioPath = await addMetadataToAudio(downloader, {
        title: yt_play[0].title,
        artist: yt_play[0].author.name,
        album: yt_play[0].title,
        year: new Date(yt_play[0].uploadedAt).getFullYear().toString(),
        genre: 'YouTube',
        lyrics: lyrics,
        cover: coverBuffer
      });
      
      // Leer el archivo de audio procesado
      const audioData = fs.readFileSync(audioPath);
      
      // Generar el mensaje con la estructura completa
      const documentMessage = {
        url: '', // WhatsApp lo completará automáticamente
        mimetype: 'audio/mpeg',
        fileSha256: await generateFileHash(audioData),
        fileLength: audioData.length,
        pageCount: 0,
        mediaKey: randomBytes(32),
        fileName: `${yt_play[0].title}.mp3`.slice(0, 256), // Limitar longitud del nombre
        fileEncSha256: await generateFileHash(audioData),
        directPath: '', // WhatsApp lo completará
        mediaKeyTimestamp: Date.now(),
        jpegThumbnail: coverBuffer ? await resizeImage(coverBuffer, 200, 150) : undefined,
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          forwardingScore: 0,
          isForwarded: false
        },
        thumbnailHeight: 150,
        thumbnailWidth: 200
      };
      
      // Crear el mensaje completo
      const responseMessage = generateWAMessageFromContent(m.chat, {
        documentMessage: proto.Message.DocumentMessage.fromObject(documentMessage)
      }, {
        quoted: m,
        upload: conn.waUploadToServer
      });
      
      // Enviar el mensaje
      await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id });
      
      // Eliminar archivo temporal
      fs.unlinkSync(audioPath);
      
    } catch (error) {
      console.log(error);
      conn.reply(m.chat, tradutor.texto6, m);
    }
  }

  if (command === 'test2') {
    try {
      const videodlp = await tools.downloader.ytmp4(yt_play[0].url);
      const downloader = videodlp.download;
      conn.sendMessage(m.chat, { video: { url: downloader }, mimetype: "video/mp4" }, { quoted: m });
    } catch (error) {
      console.log(error);
      conn.reply(m.chat, tradutor.texto6, m);
    }
  }
};

handler.command = ['test1', 'test2'];
export default handler;


// Función para generar hash SHA256 de un buffer
async function generateFileHash(buffer) {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(buffer).digest();
}

// Función para redimensionar imagen para el thumbnail
async function resizeImage(buffer, width, height) {
  const sharp = (await import('sharp')).default;
  return await sharp(buffer)
    .resize(width, height)
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Función para agregar metadatos al archivo de audio
async function addMetadataToAudio(audioUrl, metadata) {
  const tempPath = join(tmpdir(), `${randomBytes(6).toString('hex')}.mp3`);
  
  // Descargar el audio
  const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
  await writeFile(tempPath, response.data);
  
  // Escribir nuevos metadatos
  await mm.write(tempPath, {
    title: metadata.title,
    artist: metadata.artist,
    album: metadata.album,
    year: metadata.year,
    genre: metadata.genre,
    lyrics: metadata.lyrics ? [{ text: metadata.lyrics }] : [],
    picture: metadata.cover ? [{
      type: 'cover',
      data: metadata.cover,
      format: 'image/jpeg'
    }] : []
  }, {
    keepOriginal: false,
    preservePadding: false
  });
  
  return tempPath;
}

// Función para obtener letras de canciones
async function getLyrics(title, artist) {
  try {
    const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (response.ok) {
      const data = await response.json();
      return data.lyrics || '';
    }
    return '';
  } catch (e) {
    console.error('Error al obtener letra:', e);
    return '';
  }
}

async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
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
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
  });
}

const getBuffer = async (url, options) => {
    options ? options : {};
    const res = await axios({method: 'get', url, headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1,}, ...options, responseType: 'arraybuffer'});
    return res.data;
};
