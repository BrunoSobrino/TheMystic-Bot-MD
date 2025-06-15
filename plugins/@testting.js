const { proto, generateWAMessageFromContent, generateWAMessageContent } = (await import("baileys")).default;
import NodeID3 from 'node-id3';
import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import tools from '@takanashi-soft/tools';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'path';
import { randomBytes, createHash } from 'crypto';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  // Obtener idioma y textos traducidos
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;

  // Buscar en YouTube
  const yt_play = await search(args.join(' '));
  if (!yt_play || !yt_play[0]) throw tradutor.texto6;

  // Mostrar información del video
  const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${yt_play[0].duration.timestamp}\n${tradutor.texto2[3]} ${yt_play[0].views}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}`.trim();
  
  await conn.sendMessage(m.chat, { 
    image: { url: yt_play[0].thumbnail }, 
    caption: texto1 
  }, { quoted: m });

  if (command === 'test1') {
    try {
      // Descargar audio
      const audiodlp = await tools.downloader.ytmp3(yt_play[0].url);
      const downloader = audiodlp.download;
      
      // Obtener metadatos adicionales
      let lyrics = '';
      try {
        lyrics = await getLyrics(yt_play[0].title, yt_play[0].author.name);
      } catch (e) {
        console.log('No se pudo obtener la letra:', e);
      }
      
      let coverBuffer;
      try {
        coverBuffer = await getBuffer(yt_play[0].thumbnail);
      } catch (e) {
        console.log('No se pudo obtener la portada:', e);
      }
      
      // Procesar el archivo con metadatos
      const audioPath = await addMetadataToAudio(downloader, {
        title: yt_play[0].title,
        artist: yt_play[0].author.name,
        album: yt_play[0].title,
        year: new Date(yt_play[0].uploadedAt).getFullYear().toString(),
        genre: 'YouTube',
        lyrics: lyrics,
        cover: coverBuffer
      });
      
      // Leer el archivo procesado
      const audioData = fs.readFileSync(audioPath);
            
      // Generar hashes y metadatos
      const fileSha256 = createHash('sha256').update(audioData).digest();
      const fileEncSha256 = createHash('sha256').update(audioData).digest();
      const mediaKey = randomBytes(32);
      const jpegThumbnail = coverBuffer ? await resizeImage(coverBuffer, 200, 150) : undefined;
      
      // Crear mensaje de documento
      const documentMessage = proto.Message.DocumentMessage.fromObject({
        url: '',
        mimetype: 'audio/mpeg',
        fileSha256: fileSha256,
        fileLength: audioData.length.toString(),
        mediaKey: mediaKey,
        fileName: `${yt_play[0].title}.mp3`.slice(0, 256),
        fileEncSha256: fileEncSha256,
        directPath: '',
        mediaKeyTimestamp: Math.floor(Date.now() / 1000).toString(),
        jpegThumbnail: jpegThumbnail,
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          forwardingScore: 0,
          isForwarded: false
        },
        thumbnailHeight: 150,
        thumbnailWidth: 200
      });
      
      // Generar y enviar mensaje
      const responseMessage = generateWAMessageFromContent(m.chat, {
        documentMessage: documentMessage
      }, {
        quoted: m,
        upload: conn.waUploadToServer
      });
      
      await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id });
      
      // Limpiar archivo temporal
      fs.unlinkSync(audioPath);
      
    } catch (error) {
      console.error('Error en test1:', error);
      conn.reply(m.chat, tradutor.texto6, m);
    }
  } 
  else if (command === 'test2') {
    try {
      // Descargar video
      const videodlp = await tools.downloader.ytmp4(yt_play[0].url);
      const downloader = videodlp.download;
      
      // Importar Baileys dinámicamente
      const { proto, generateWAMessageFromContent } = (await import("baileys")).default;
      
      // Generar mensaje de video
      const videoMessage = {
        video: { url: downloader },
        mimetype: "video/mp4",
        caption: yt_play[0].title,
        jpegThumbnail: await getBuffer(yt_play[0].thumbnail),
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          forwardingScore: 0,
          isForwarded: false
        }
      };
      
      // Generar y enviar mensaje
      const responseMessage = generateWAMessageFromContent(m.chat, {
        videoMessage: proto.Message.VideoMessage.fromObject(videoMessage)
      }, {
        quoted: m,
        upload: conn.waUploadToServer
      });
      
      await conn.relayMessage(m.chat, responseMessage.message, { messageId: responseMessage.key.id });
      
    } catch (error) {
      console.error('Error en test2:', error);
      conn.reply(m.chat, tradutor.texto6, m);
    }
  }
};

// Función para agregar metadatos al audio
async function addMetadataToAudio(audioUrl, metadata) {
  const tempPath = `${tmpdir()}/${randomBytes(6).toString('hex')}.mp3`;
  
  // Descargar audio
  const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
  await writeFile(tempPath, response.data);
  
  // Configurar tags ID3
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
    APIC: metadata.cover ? {
      type: 3, // Front cover
      data: metadata.cover,
      description: 'Cover'
    } : undefined
  };
  
  // Escribir metadatos
  const success = NodeID3.write(tags, tempPath);
  if (!success) throw new Error('Error al escribir metadatos');
  
  return tempPath;
}

// Función para redimensionar imagen
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

// Función para obtener letras
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
  try {
    const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
    return search.videos;
  } catch (error) {
    console.error('Error en búsqueda YouTube:', error);
    return [];
  }
}

handler.help = ['test1', 'test2'];
handler.tags = ['downloader'];
handler.command = ['test1', 'test2'];

export default handler;
