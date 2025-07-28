import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import axios from 'axios';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
import { v4 as uuidv4 } from 'uuid';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*\n\n*Uso:* /musicaia descripción | tags opcionales\n*Ejemplo:* /musicaia canción de amor | pop, romántico, acústico';
        
        const input = args.join(' ');
        const [prompt, customTags] = input.split('|').map(part => part.trim());
        
        if (!prompt) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        
        // Generar la canción con la API Sonu
        const song = await generateMusicWithSonu(prompt, customTags || 'pop, romántico');
        
        if (!song) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const [audioBuffer, thumbnailBuffer] = await Promise.all([
            fetch(song.audio_url).then(res => res.buffer()),
            fetch(song.image_url).then(res => res.buffer())
        ]);
               
        const tags = {
            title: song.title,
            artist: 'IA Musical',
            album: 'Generado por IA',
            APIC: {
                mime: 'image/png',
                type: {
                    id: 3,
                    name: 'front cover'
                },
                description: 'Cover Art',
                imageBuffer: thumbnailBuffer
            },
            year: new Date().getFullYear().toString(),
            genre: song.tags,
            comment: {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nGénero: ${song.tags}\nDuración: ${song.duration}s`
            }
        };
        
        if (song.lyrics) {
            tags.unsynchronisedLyrics = {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nTítulo: ${song.title}\n\n${song.lyrics}`.substring(0, 5000)
            };
        }
        
        const taggedBuffer = NodeID3.write(tags, audioBuffer);
                
        const tmpDir = tmpdir();
        const audioPath = join(tmpDir, `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`);
        writeFileSync(audioPath, taggedBuffer);
        
        const thumbnailMessage = await prepareWAMessageMedia({ image: { url: song.image_url } }, { upload: conn.waUploadToServer });
        const documentMessage = await prepareWAMessageMedia({ 
            document: {
                url: audioPath,
                mimetype: 'audio/mpeg',
                fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
                fileLength: taggedBuffer.length,
                title: song.title.substring(0, 64), 
                ptt: false 
            }
        }, { upload: conn.waUploadToServer, mediaType: 'document' });

        const mesg = generateWAMessageFromContent(m.chat, {
            documentMessage: {
                ...documentMessage.documentMessage,
                mimetype: 'audio/mpeg',
                title: song.title.substring(0, 64),
                fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
                jpegThumbnail: thumbnailMessage.imageMessage.jpegThumbnail,
                mediaKeyTimestamp: Math.floor(Date.now() / 1000),
            }
        }, { userJid: conn.user.jid, quoted: m });
                
        await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
        
        setTimeout(() => {
            if (existsSync(audioPath)) unlinkSync(audioPath);
        }, 5000);
        
    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply(`❌ Ocurrió un error al generar la canción: ${error.message || error}`);
    }
};

handler.help = ['musicaia <descripción> | [tags opcionales]'];
handler.tags = ['ai'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

// Credits for NB SCRIPT ~ Canal en WhatsApp: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L 
const sonu = {
  api: {
    base: 'https://musicai.apihub.today/api/v1',
    endpoints: {
      register: '/users',
      create: '/song/create',
      checkStatus: '/song/user'
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    'content-type': 'application/json',
    'accept': 'application/json',
    'x-platform': 'android',
    'x-app-version': '1.0.0',
    'x-country': 'ID',
    'accept-language': 'id-ID',
    'x-client-timezone': 'Asia/Jakarta'
  },

  deviceId: uuidv4(),
  userId: null,
  fcmToken: 'eqnTqlxMTSKQL5NQz6r5aP:APA91bHa3CvL5Nlcqx2yzqTDAeqxm_L_vIYxXqehkgmTsCXrV29eAak6_jqXv5v1mQrdw4BGMLXl_BFNrJ67Em0vmdr3hQPVAYF8kR7RDtTRHQ08F3jLRRI',

  register: async function() {
    const msgId = uuidv4();
    const time = Date.now().toString();
    const header = {
      ...this.headers,
      'x-device-id': this.deviceId,
      'x-request-id': msgId,
      'x-message-id': msgId,
      'x-request-time': time
    };

    try {
      const response = await axios.put(
        `${this.api.base}${this.api.endpoints.register}`,
        {
          deviceId: this.deviceId,
          fcmToken: this.fcmToken
        },
        { headers: header }
      );
      this.userId = response.data.id;
      return true;
    } catch (err) {
      console.error('Error en registro Sonu:', err);
      return false;
    }
  },

  create: async function({ title, genre, lyrics }) {
    const msgId = uuidv4();
    const time = Date.now().toString();
    const header = {
      ...this.headers,
      'x-device-id': this.deviceId,
      'x-client-id': this.userId,
      'x-request-id': msgId,
      'x-message-id': msgId,
      'x-request-time': time
    };

    const body = {
      type: 'lyrics',
      name: title,
      lyrics: lyrics || `Canción generada sobre: ${title}`,
      genre: genre || 'pop'
    };

    try {
      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.create}`,
        body,
        { headers: header }
      );
      return response.data.id;
    } catch (err) {
      console.error('Error al crear canción Sonu:', err);
      throw err;
    }
  },

  checkStatus: async function(songId) {
    const header = {
      ...this.headers,
      'x-client-id': this.userId
    };

    try {
      const response = await axios.get(
        `${this.api.base}${this.api.endpoints.checkStatus}`,
        {
          params: {
            userId: this.userId,
            isFavorite: false,
            page: 1,
            searchText: ''
          },
          headers: header
        }
      );

      const songData = response.data.datas.find(song => song.id === songId);
      if (!songData) return null;

      return {
        url: songData.url,
        thumbnail: songData.thumbnail_url,
        status: songData.status
      };
    } catch (err) {
      console.error('Error al verificar estado Sonu:', err);
      throw err;
    }
  }
};

async function generateMusicWithSonu(prompt, tags = 'pop, romántico') {
    try {
        if (!sonu.userId && !await sonu.register()) throw new Error('No se pudo registrar en el servicio de música');

        const songId = await sonu.create({
            title: prompt.substring(0, 64) || 'Cancion_IA',
            genre: tags,
            lyrics: `Canción generada sobre: ${prompt}`
        });

        let attempts = 0;
        let songData = null;
        
        while (attempts < 20) { 
            songData = await sonu.checkStatus(songId);
            if (songData && songData.url) break;
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
        }

        if (!songData || !songData.url) throw new Error('La canción no se generó en el tiempo esperado');

        return {
            audio_url: songData.url,
            image_url: songData.thumbnail || 'https://images.wondershare.es/dc/AI/Inteligencia_Artificial_Musical.png',
            title: prompt.substring(0, 64) || 'Cancion_IA',
            tags: tags,
            duration: 180
        };
    } catch (error) {
        console.error('Error en generateMusicWithSonu:', error);
        throw error;
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
