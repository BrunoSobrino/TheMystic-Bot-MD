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
        
        // Use regular got for downloading files
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
        console.log('Iniciando generación de música...');
        
        // Lista de User Agents rotativos
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0'
        ];
        
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const randomIP = generateRandomIP();
        
        // Configuración de headers optimizada
        const baseHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': randomUserAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Linux"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://suno.com/',
            'Origin': 'https://suno.com',
            'X-Forwarded-For': randomIP,
            'X-Real-IP': randomIP,
            'X-Originating-IP': randomIP
        };

        // Intentar diferentes estrategias
        let generateResponse;
        
        // Estrategia 1: got con configuración básica
        try {
            console.log('Intentando con got básico...');
            generateResponse = await got.post('https://suno.exomlapi.com/generate', {
                json: requestData,
                headers: baseHeaders,
                timeout: {
                    request: 30000,
                    connect: 10000
                },
                retry: {
                    limit: 2,
                    methods: ['POST']
                },
                responseType: 'json',
                followRedirect: true,
                maxRedirects: 3,
                dnsCache: true,
                keepAlive: true
            });
        } catch (error1) {
            console.log('Got básico falló:', error1.message);
            
            // Estrategia 2: got con proxy simulado
            try {
                console.log('Intentando con headers extendidos...');
                await sleep(Math.random() * 2000 + 1000); // Delay aleatorio
                
                generateResponse = await got.post('https://suno.exomlapi.com/generate', {
                    json: requestData,
                    headers: {
                        ...baseHeaders,
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Custom-Header': generateRandomString(),
                        'X-Client-Version': '1.0.0'
                    },
                    timeout: {
                        request: 45000,
                        connect: 15000
                    },
                    retry: {
                        limit: 3,
                        methods: ['POST'],
                        statusCodes: [408, 413, 429, 500, 502, 503, 504]
                    },
                    responseType: 'json',
                    followRedirect: true,
                    maxRedirects: 5
                });
            } catch (error2) {
                console.log('Estrategia 2 falló:', error2.message);
                
                // Estrategia 3: Usando curl simulation
                try {
                    console.log('Intentando simulación de curl...');
                    await sleep(Math.random() * 3000 + 2000);
                    
                    generateResponse = await got.post('https://suno.exomlapi.com/generate', {
                        json: requestData,
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'curl/7.68.0',
                            'Accept': '*/*',
                            'Connection': 'keep-alive'
                        },
                        timeout: {
                            request: 60000
                        },
                        retry: {
                            limit: 1
                        },
                        responseType: 'json'
                    });
                } catch (error3) {
                    console.log('Todas las estrategias fallaron');
                    throw new Error(`No se pudo conectar al servicio después de varios intentos. Último error: ${error3.message}`);
                }
            }
        }

        if (!generateResponse || !generateResponse.body) {
            throw new Error('Respuesta vacía del servidor');
        }

        const responseBody = generateResponse.body;
        console.log('Respuesta del servidor:', JSON.stringify(responseBody, null, 2));

        if (!responseBody || responseBody.status !== 'initiated') {
            throw new Error('No se pudo iniciar la generación de la canción: ' + (responseBody?.message || 'Status: ' + responseBody?.status));
        }

        const taskId = responseBody.taskId;
        const token = responseBody.token;

        console.log(`Generación iniciada. TaskID: ${taskId}`);

        // Función para verificar el estado
        async function checkStatus(attempt = 1) {
            const delay = Math.random() * 3000 + 4000 + (attempt * 1500);
            console.log(`Esperando ${Math.round(delay/1000)}s antes del intento ${attempt}...`);
            await sleep(delay);
            
            try {
                const statusResponse = await got.post('https://suno.exomlapi.com/check-status', {
                    json: { taskId: taskId, token: token },
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUserAgent,
                        'Accept': 'application/json, text/plain, */*',
                        'Referer': 'https://suno.com/',
                        'X-Request-ID': Math.random().toString(36).substring(2, 15),
                        'X-Attempt': attempt.toString(),
                        'X-Forwarded-For': generateRandomIP()
                    },
                    timeout: {
                        request: 30000,
                        connect: 10000
                    },
                    retry: {
                        limit: 2,
                        statusCodes: [408, 413, 429, 500, 502, 503, 504]
                    },
                    responseType: 'json'
                });

                if (!statusResponse || !statusResponse.body) {
                    throw new Error('Respuesta vacía al verificar estado');
                }

                const status = statusResponse.body.status;
                console.log(`Estado actual: ${status} (Intento ${attempt})`);

                if (status === 'TEXT_SUCCESS') {
                    console.log('¡Generación completada!');
                    return statusResponse.body.results;
                }

                if (status === 'error') {
                    throw new Error('Error al generar la canción: ' + (statusResponse.body.message || 'Error desconocido'));
                }

                if (status === 'failed' || status === 'cancelled') {
                    throw new Error(`Generación ${status}: ${statusResponse.body.message || 'La generación no se completó'}`);
                }

                // Limitar intentos
                if (attempt > 30) {
                    throw new Error('Tiempo de espera agotado para la generación de música (más de 30 intentos)');
                }

                // Estados válidos para continuar: 'initiated', 'processing', 'queued'
                return checkStatus(attempt + 1);

            } catch (error) {
                console.log(`Error en intento ${attempt}:`, error.message);
                
                if (attempt < 5 && (
                    error.code === 'ETIMEDOUT' || 
                    error.code === 'ECONNRESET' || 
                    error.code === 'ENOTFOUND' ||
                    error.message.includes('timeout')
                )) {
                    console.log(`Reintentando debido a error de red...`);
                    return checkStatus(attempt + 1);
                }
                throw error;
            }
        }

        return await checkStatus();

    } catch (error) {
        console.error('Error en generateMusic:', error);
        
        // Manejo específico de errores
        if (error.message.includes('ECONNREFUSED')) {
            throw new Error('No se pudo conectar al servicio. El servidor puede estar caído o bloqueado.');
        } else if (error.message.includes('captcha') || error.message.includes('challenge')) {
            throw new Error('Servicio requiere verificación. Intenta más tarde.');
        } else if (error.response?.statusCode === 403 || error.message.includes('403')) {
            throw new Error('Acceso denegado. Intenta con otro prompt o espera unos minutos.');
        } else if (error.response?.statusCode === 429 || error.message.includes('429')) {
            throw new Error('Demasiadas peticiones. Espera 10-15 minutos antes de intentar nuevamente.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            throw new Error('Timeout de conexión. El servicio puede estar sobrecargado, intenta más tarde.');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            throw new Error('No se pudo resolver la dirección del servidor. Verifica tu conexión.');
        }
        
        throw new Error(`Error al generar música: ${error.message}`);
    }
}

// Funciones auxiliares
function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}

function generateRandomIP() {
    return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

function generateRandomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
