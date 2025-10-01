import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import axios from 'axios';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
import * as uuid from 'uuid';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

var uuidv4 = uuid.default.v4;

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

handler.help = ['sunoai <descripción> | [tags opcionales]'];
handler.tags = ['ai'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic|sunoai|sunoia)$/i;
export default handler;

/* Credits to @NB_SCRIPT ~ en WhatsApp: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L */

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
      return {
        success: true,
        code: 200,
        result: { userId: this.userId }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  create: async function({ title, mood, genre, lyrics, gender }) {
    if (!title || title.trim() === '') {
      return {
        success: false,
        code: 400,
        result: { error: "El título no puede estar vacío" }
      };
    }
    if (!lyrics || lyrics.trim() === '') {
      return {
        success: false,
        code: 400,
        result: { error: "Se requieren letras para generar la canción" }
      };
    }
    if (lyrics.length > 1500) {
      return {
        success: false,
        code: 400,
        result: { error: "Las letras no pueden exceder los 1500 caracteres"}
      };
    }

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
      lyrics: lyrics
    };
    if (mood && mood.trim() !== '') body.mood = mood;
    if (genre && genre.trim() !== '') body.genre = genre;
    if (gender && gender.trim() !== '') body.gender = gender;

    try {
      const response = await axios.post(
        `${this.api.base}${this.api.endpoints.create}`,
        body,
        { headers: header }
      );

      return {
        success: true,
        code: 200,
        result: { songId: response.data.id }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  },

  task: async function(songId) {
    const header = {
      ...this.headers,
      'x-client-id': this.userId
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const statusUpdater = createStatusUpdater();

    try {
      let attempt = 0;
      let found = null;

      while (true) {
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

        found = response.data.datas.find(song => song.id === songId);
        if (!found) {
          statusUpdater.clear();
          return {
            success: false,
            code: 404,
            result: { error: "No se encontró la canción generada" }
          };
        }

        statusUpdater.update(`🔄 [${++attempt}] Status: ${found.status} | Progreso: ${found.url ? '✅ Completado' : '⏳ En proceso...'}`);

        if (found.url) {
          statusUpdater.clear();
          return {
            success: true,
            code: 200,
            result: {
              status: found.status,
              songId: found.id,
              title: found.name,
              username: found.username,
              url: found.url,
              thumbnail: found.thumbnail_url
            }
          };
        }

        await delay(3000);
      }
    } catch (err) {
      statusUpdater.clear();
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: err.message }
      };
    }
  }
};

async function generateMusicWithSonu(prompt, tags = 'pop, romántico') {
    try {
        if (!sonu.userId) {
            const registration = await sonu.register();
            if (!registration.success) {
                throw new Error('No se pudo registrar en el servicio de música');
            }
        }

        const basicLyrics = `Canción generada sobre: ${prompt}`;

        const creation = await sonu.create({
            title: prompt.substring(0, 64) || 'Cancion_IA',
            genre: tags,
            lyrics: basicLyrics,
            mood: 'happy',
            gender: 'male'
        });

        if (!creation.success) {
            throw new Error(creation.result.error || 'Error al crear la canción');
        }

        const taskResult = await sonu.task(creation.result.songId);
        if (!taskResult.success) {
            throw new Error(taskResult.result.error || 'Error al generar la canción');
        }

        return {
            audio_url: taskResult.result.url,
            image_url: taskResult.result.thumbnail || 'https://images.wondershare.es/dc/AI/Inteligencia_Artificial_Musical.png',
            title: prompt.substring(0, 64) || 'Cancion_IA',
            tags: tags,
            lyrics: basicLyrics,
            duration: 180
        };
    } catch (error) {
        console.error('Error en generateMusicWithSonu:', error);
        throw new Error(error.message || 'Error al generar la canción');
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}

const createStatusUpdater = () => {
  let lastMessage = '';
  return {
    update: (message) => {
      process.stdout.write('\r' + ' '.repeat(lastMessage.length));
      process.stdout.write('\r' + message);
      lastMessage = message;
    },
    clear: () => {
      process.stdout.write('\r' + ' '.repeat(lastMessage.length) + '\r');
      lastMessage = '';
    }
  };
};
