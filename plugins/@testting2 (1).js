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
    // Generar user agents aleatorios más realistas
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Generar un sessionId único para simular una sesión real
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': randomUserAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Session-Id': sessionId,
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
        // Configuración muy avanzada para evadir anti-bots
        const gotOptions = {
            timeout: {
                request: 90000,
                response: 90000
            },
            retry: {
                limit: 2,
                methods: ['GET', 'POST'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
                calculateDelay: ({computedValue}) => {
                    return computedValue * 2 + Math.random() * 3000; // Delay exponencial + aleatorio
                }
            },
            hooks: {
                beforeRequest: [
                    async (options) => {
                        // Delay inicial más largo para simular carga de página
                        const delay = Math.random() * 3000 + 2000; // 2-5 segundos
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        // Rotar headers aleatoriamente
                        if (Math.random() > 0.5) {
                            options.headers['X-Forwarded-For'] = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                        }
                    }
                ],
                beforeRetry: [
                    async (options) => {
                        // Delay más largo antes de reintentar
                        const retryDelay = Math.random() * 5000 + 5000; // 5-10 segundos
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        
                        // Cambiar User-Agent en cada retry
                        options.headers['User-Agent'] = userAgents[Math.floor(Math.random() * userAgents.length)];
                    }
                ]
            },
            http2: false,
            decompress: true,
            followRedirect: true,
            maxRedirects: 3,
            throwHttpErrors: false,
            // Simular conexión más lenta
            agent: {
                keepAlive: false
            }
        };

        // Paso 1: Simular visita a la página principal (opcional)
        try {
            await got.get('https://suno.com/', {
                headers: {
                    'User-Agent': randomUserAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: { request: 15000 },
                throwHttpErrors: false
            });
            
            // Delay después de "cargar" la página
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        } catch (e) {
            // Ignorar errores de la visita inicial
        }

        // Paso 2: Realizar la petición principal
        const generateResponse = await got.post('https://suno.exomlapi.com/generate', {
            ...gotOptions,
            headers: headers,
            json: requestData,
            responseType: 'json'
        });

        if (generateResponse.statusCode === 403) {
            throw new Error('Acceso bloqueado por sistemas anti-bot. Intenta más tarde.');
        } else if (generateResponse.statusCode === 429) {
            throw new Error('Demasiadas peticiones. Espera un momento antes de intentar nuevamente.');
        } else if (generateResponse.statusCode !== 200) {
            throw new Error(`HTTP ${generateResponse.statusCode}: ${generateResponse.statusMessage || 'Error desconocido'}`);
        }

        if (!generateResponse.body || generateResponse.body.status !== 'initiated') {
            throw new Error('No se pudo iniciar la generación de la canción');
        }

        const taskId = generateResponse.body.taskId;
        const token = generateResponse.body.token;

        async function checkStatus(attempt = 1) {
            const statusData = { taskId: taskId, token: token };
            
            // Delay más largo y variable entre verificaciones
            const baseDelay = Math.random() * 4000 + 3000; // 3-7 segundos
            const exponentialDelay = attempt * 1000; // Incrementa con cada intento
            await new Promise(resolve => setTimeout(resolve, baseDelay + exponentialDelay));
            
            const statusResponse = await got.post('https://suno.exomlapi.com/check-status', {
                ...gotOptions,
                headers: {
                    ...headers,
                    'X-Request-ID': Math.random().toString(36).substring(2, 15),
                    'X-Attempt': attempt.toString()
                },
                json: statusData,
                responseType: 'json'
            });

            if (statusResponse.statusCode === 403) {
                throw new Error('Acceso bloqueado durante verificación de estado.');
            } else if (statusResponse.statusCode === 429) {
                // Esperar más tiempo si hay rate limiting
                await new Promise(resolve => setTimeout(resolve, 10000));
                return checkStatus(attempt + 1);
            } else if (statusResponse.statusCode !== 200) {
                if (attempt < 5) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return checkStatus(attempt + 1);
                }
                throw new Error(`Error al verificar estado: HTTP ${statusResponse.statusCode}`);
            }

            if (statusResponse.body.status === 'TEXT_SUCCESS') {
                return statusResponse.body.results;
            }

            if (statusResponse.body.status === 'error') {
                throw new Error('Error al generar la canción: ' + (statusResponse.body.message || 'Error desconocido'));
            }

            // Limitar intentos para evitar bucles infinitos
            if (attempt > 20) {
                throw new Error('Tiempo de espera agotado para la generación de música');
            }

            // Continuar verificando el estado
            return checkStatus(attempt + 1);
        }

        return await checkStatus();

    } catch (error) {
        console.error('Error en generateMusic:', error);
        
        // Manejo específico de errores
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new Error('Servicio temporalmente no disponible. El proveedor ha bloqueado el acceso.');
        } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            throw new Error('Demasiadas peticiones. Espera 5 minutos antes de intentar nuevamente.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            throw new Error('Timeout de conexión. El servicio puede estar ocupado.');
        }
        
        throw new Error(`Error al generar música: ${error.message}`);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
