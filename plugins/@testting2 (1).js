import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import got from 'cloudflare-scraper'; // Using cloudflare-scraper instead of regular got
import NodeID3 from 'node-id3';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        const generatedSongs = await generateMusic(args.join(' '));
        
        if (!generatedSongs || generatedSongs.length === 0) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const song = generatedSongs[0];
        
        // Use cloudflare-scraper for downloading files too
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

handler.help = ['musicaia <descripción>'];
handler.tags = ['ai', 'music'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

async function generateMusic(prompt) {
    const requestData = {
        prompt: prompt,
        title: prompt.substring(0, 50),
        style: "",
        customMode: false,
        instrumental: false
    };

    try {
        console.log('Iniciando bypass de Cloudflare con cloudflare-scraper...');
        
        // Using cloudflare-scraper with modern async/await syntax
        const generateResponse = await got.post('https://suno.exomlapi.com/generate', {
            json: requestData,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'no-cache',
                'Referer': 'https://suno.com/',
                'Origin': 'https://suno.com'
            },
            timeout: {
                request: 90000
            },
            retry: {
                limit: 2,
                methods: ['POST']
            }
        });

        const responseBody = generateResponse.body;
        if (!responseBody || responseBody.status !== 'initiated') {
            throw new Error('No se pudo iniciar la generación de la canción');
        }

        const taskId = responseBody.taskId;
        const token = responseBody.token;

        console.log(`Generación iniciada. TaskID: ${taskId}`);

        async function checkStatus(attempt = 1) {
            // Delay progresivo entre verificaciones
            const delay = Math.random() * 3000 + 3000 + (attempt * 1000); // 3-6s + incremento por intento
            await new Promise(resolve => setTimeout(resolve, delay));
            
            try {
                const statusResponse = await got.post('https://suno.exomlapi.com/check-status', {
                    json: { taskId: taskId, token: token },
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                        'Referer': 'https://suno.com/',
                        'X-Request-ID': Math.random().toString(36).substring(2, 15),
                        'X-Attempt': attempt.toString()
                    },
                    timeout: {
                        request: 60000
                    },
                    retry: {
                        limit: 1
                    }
                });

                const status = statusResponse.body.status;
                console.log(`Estado actual: ${status} (Intento ${attempt})`);

                if (status === 'TEXT_SUCCESS') {
                    return statusResponse.body.results;
                }

                if (status === 'error') {
                    throw new Error('Error al generar la canción: ' + (statusResponse.body.message || 'Error desconocido'));
                }

                // Limitar intentos para evitar bucles infinitos
                if (attempt > 25) {
                    throw new Error('Tiempo de espera agotado para la generación de música');
                }

                // Continuar verificando el estado
                return checkStatus(attempt + 1);

            } catch (error) {
                if (attempt < 5 && (error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
                    console.log(`Timeout en intento ${attempt}, reintentando...`);
                    return checkStatus(attempt + 1);
                }
                throw error;
            }
        }

        return await checkStatus();

    } catch (error) {
        console.error('Error en generateMusic:', error);
        
        // Manejo específico de errores
        if (error.message.includes('captcha') || error.message.includes('challenge')) {
            throw new Error('Cloudflare requiere verificación manual. Intenta más tarde.');
        } else if (error.response?.statusCode === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new Error('Acceso denegado. El servicio puede estar temporalmente bloqueado.');
        } else if (error.response?.statusCode === 429 || error.message.includes('429') || error.message.includes('Too Many Requests')) {
            throw new Error('Demasiadas peticiones. Espera 10 minutos antes de intentar nuevamente.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            throw new Error('Timeout de conexión. El servicio puede estar sobrecargado.');
        }
        
        throw new Error(`Error al generar música: ${error.message}`);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
