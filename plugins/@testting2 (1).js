import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import got from 'got';
import NodeID3 from 'node-id3';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        const generatedSongs = await generateMusic(args.join(' '));
        
        if (!generatedSongs || generatedSongs.length === 0) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const song = generatedSongs[0];
        
        const [audioBuffer, thumbnailBuffer] = await Promise.all([
            got(song.audio_url).buffer(),
            got(song.image_url).buffer()
        ]);
               
        const tags = {
            title: song.title,
            artist: 'Suno AI',
            album: 'Generado por IA',
            APIC: thumbnailBuffer,
            year: new Date().getFullYear().toString(),
            comment: {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nGénero: ${song.tags}}`
            }
        };
        
        if (song.lyrics !== null) {
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
const documentMessage = await prepareWAMessageMedia({ document: {
            url: audioPath,
            mimetype: 'audio/mpeg',
            fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
            fileLength: taggedBuffer.length,
            title: song.title.substring(0, 64), 
            ptt: false 
        }
    }, { upload: conn.waUploadToServer, mediaType: 'document' }
);
const mesg = generateWAMessageFromContent(m.chat, {
    documentMessage: {
        ...documentMessage.documentMessage,
        mimetype: 'audio/mpeg',
        title: song.title.substring(0, 64),
        fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
        jpegThumbnail: thumbnailMessage.imageMessage.jpegThumbnail,
        mediaKeyTimestamp: Math.floor(Date.now() / 1000),
    }}, { userJid: conn.user.jid, quoted: m})
                
await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
        
        setTimeout(() => {
            if (existsSync(audioPath)) unlinkSync(audioPath);
        }, 5000);
        
    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply(`❌ Ocurrió un error al generar la canción: ${error.message || error}`);
    }
};
handler.help = ['musicaia <descripción>'];
handler.tags = ['ai', 'music'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

async function generateMusic(prompt) {
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': 'https://suno.com/',
        'Origin': 'https://suno.com'
    };

    const requestData = {
        prompt: prompt,
        title: prompt.substring(0, 50),
        style: "",
        customMode: false,
        instrumental: false
    };

    try {
        const gotOptions = {
            headers: headers,
            timeout: {
                request: 60000,
                response: 60000
            },
            retry: {
                limit: 3,
                methods: ['GET', 'POST'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524]
            },
            hooks: {
                beforeRequest: [
                    options => {
                        const delay = Math.random() * 1000 + 500; // 500-1500ms
                        return new Promise(resolve => setTimeout(() => resolve(), delay));
                    }
                ]
            },
            http2: false,
            decompress: true,
            followRedirect: true,
            maxRedirects: 5,
            throwHttpErrors: false
        };

        const generateResponse = await got.post('https://suno.exomlapi.com/generate', {
            ...gotOptions,
            json: requestData,
            responseType: 'json'
        });

        if (generateResponse.statusCode !== 200) {
            throw new Error(`HTTP ${generateResponse.statusCode}: ${generateResponse.statusMessage}`);
        }

        if (generateResponse.body.status !== 'initiated') {
            throw new Error('No se pudo iniciar la generación de la canción');
        }

        const taskId = generateResponse.body.taskId;
        const token = generateResponse.body.token;

        async function checkStatus() {
            const statusData = { taskId: taskId, token: token };
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000)); // 2-4 segundos
            
            const statusResponse = await got.post('https://suno.exomlapi.com/check-status', {
                ...gotOptions,
                json: statusData,
                responseType: 'json'
            });

            if (statusResponse.statusCode !== 200) {
                throw new Error(`Error al verificar estado: HTTP ${statusResponse.statusCode}`);
            }

            if (statusResponse.body.status === 'TEXT_SUCCESS') {
                return statusResponse.body.results;
            }

            if (statusResponse.body.status === 'error') {
                throw new Error('Error al generar la canción: ' + (statusResponse.body.message || 'Error desconocido'));
            }
            return checkStatus();
        }

        return await checkStatus();

    } catch (error) {
        console.error('Error en generateMusic:', error);
        if (error.response?.statusCode === 403) {
            throw new Error('Acceso bloqueado por sistemas anti-bot. Intenta más tarde.');
        } else if (error.response?.statusCode === 429) {
            throw new Error('Demasiadas peticiones. Espera un momento antes de intentar nuevamente.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            throw new Error('Timeout de conexión. El servicio puede estar ocupado.');
        }
        
        throw new Error(`Error al conectar con el servicio de música: ${error.message}`);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
