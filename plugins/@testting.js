import { parseFile } from 'music-metadata';
import NodeID3 from 'node-id3';
import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import tools from '@takanashi-soft/tools';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes, createHash } from 'crypto';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;

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
      
      // Generar hashes necesarios
      const fileSha256 = createHash('sha256').update(audioData).digest();
      const fileEncSha256 = createHash('sha256').update(audioData).digest();
      const mediaKey = randomBytes(32);
      
      // Crear thumbnail (usando node-id3 para extraer la imagen si existe)
      let jpegThumbnail;
      try {
        const tags = NodeID3.read(audioPath);
        if (tags.image && tags.image.imageBuffer) {
          jpegThumbnail = await resizeImage(tags.image.imageBuffer, 200, 150);
        } else if (coverBuffer) {
          jpegThumbnail = await resizeImage(coverBuffer, 200, 150);
        }
      } catch (e) {
        console.log('Error al procesar thumbnail:', e);
      }
      
      // Crear el mensaje de documento
      const documentMessage = {
        url: '',
        mimetype: 'audio/mpeg',
        fileSha256,
        fileLength: audioData.length,
        pageCount: 0,
        mediaKey,
        fileName: `${yt_play[0].title}.mp3`.slice(0, 256),
        fileEncSha256,
        directPath: '',
        mediaKeyTimestamp: Date.now(),
        jpegThumbnail,
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          forwardingScore: 0,
          isForwarded: false
        },
        thumbnailHeight: 150,
        thumbnailWidth: 200
      };
      
      // Generar el mensaje completo
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

// Función para agregar metadatos al archivo de audio usando node-id3
async function addMetadataToAudio(audioUrl, metadata) {
  const tempPath = join(tmpdir(), `${randomBytes(6).toString('hex')}.mp3`);
  
  // Descargar el audio
  const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
  await writeFile(tempPath, response.data);
  
  // Crear tags ID3
  const tags = {
    title: metadata.title,
    artist: metadata.artist,
    album: metadata.album,
    year: metadata.year,
    genre: metadata.genre,
    unsynchronisedLyrics: {
      language: 'spa',
      text: metadata.lyrics || ''
    },
    image: metadata.cover ? {
      mime: 'image/jpeg',
      type: {
        id: 3,
        name: 'front cover'
      },
      description: 'Cover',
      imageBuffer: metadata.cover
    } : undefined
  };
  
  // Escribir metadatos
  NodeID3.write(tags, tempPath);
  
  return tempPath;
}

// Función para redimensionar imagen para el thumbnail
async function resizeImage(buffer, width, height) {
  try {
    const sharp = (await import('sharp')).default;
    return await sharp(buffer)
      .resize(width, height)
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error al redimensionar imagen:', error);
    return undefined;
  }
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

// Función para descargar buffers
async function getBuffer(url, options) {
  try {
    options = options || {};
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (error) {
    console.error('Error al obtener buffer:', error);
    return null;
  }
}

// Función de búsqueda en YouTube
async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

handler.command = ['test1', 'test2'];

export default handler;
