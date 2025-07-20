import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import got from 'cloudflare-scraper'; // Using cloudflare-scraper instead of regular got
import NodeID3 from 'node-id3';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        console.log('[HANDLER] Iniciando handler de música AI...');
        
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        console.log(`[HANDLER] Prompt recibido: "${args.join(' ')}"`);
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        
        const generatedSongs = await generateMusic(args.join(' '));
        console.log('[HANDLER] Canciones generadas exitosamente:', generatedSongs?.length || 0);
        
        if (!generatedSongs || generatedSongs.length === 0) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const song = generatedSongs[0];
        console.log('[HANDLER] Datos de la canción:', {
            title: song.title,
            hasAudioUrl: !!song.audio_url,
            hasImageUrl: !!song.image_url,
            hasLyrics: !!song.lyrics,
            tags: song.tags
        });
        
        // Use cloudflare-scraper for downloading files too
        console.log('[HANDLER] Descargando archivos de audio e imagen...');
        const [audioBuffer, thumbnailBuffer] = await Promise.all([
            got(song.audio_url).buffer(),
            got(song.image_url).buffer()
        ]);
        
        console.log('[HANDLER] Archivos descargados:', {
            audioSize: audioBuffer.length,
            thumbnailSize: thumbnailBuffer.length
        });
               
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
        
        console.log('[HANDLER] Aplicando tags ID3...');
        const taggedBuffer = NodeID3.write(tags, audioBuffer);
                
        const tmpDir = tmpdir();
        const audioPath = join(tmpDir, `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`);
        writeFileSync(audioPath, taggedBuffer);
        console.log(`[HANDLER] Archivo temporal creado: ${audioPath}`);
        
        console.log('[HANDLER] Preparando mensajes de WhatsApp...');
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
        
        console.log('[HANDLER] Enviando mensaje...');        
        await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
        
        console.log('[HANDLER] Mensaje enviado exitosamente, programando limpieza...');
        setTimeout(() => {
            if (existsSync(audioPath)) {
                unlinkSync(audioPath);
                console.log('[HANDLER] Archivo temporal eliminado');
            }
        }, 5000);
        
    } catch (error) {
        console.error('[HANDLER] Error en el handler:', error);
        m.reply(`❌ Ocurrió un error al generar la canción: ${error.message || error}`);
    }
};

handler.help = ['musicaia <descripción>'];
handler.tags = ['ai', 'music'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

async function generateMusic(prompt) {
    console.log(`[GENERATE_MUSIC] Iniciando generación de música para prompt: "${prompt}"`);
    
    const requestData = {
        prompt: prompt,
        title: prompt.substring(0, 50),
        style: "",
        customMode: false,
        instrumental: false
    };

    console.log('[GENERATE_MUSIC] Datos de la petición:', requestData);

    try {
        console.log('[GENERATE_MUSIC] Iniciando bypass de Cloudflare con cloudflare-scraper...');
        
        const startTime = Date.now();
        
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

        const requestTime = Date.now() - startTime;
        console.log(`[GENERATE_MUSIC] Petición inicial completada en ${requestTime}ms`);
        console.log(`[GENERATE_MUSIC] Status Code: ${generateResponse.statusCode}`);
        console.log(`[GENERATE_MUSIC] Headers recibidos:`, Object.keys(generateResponse.headers || {}));

        if (!generateResponse.body) {
            console.error('[GENERATE_MUSIC] ERROR: Respuesta vacía del servidor');
            throw new Error('Respuesta vacía del servidor');
        }

        const responseBody = generateResponse.body;
        console.log('[GENERATE_MUSIC] Respuesta del servidor:', JSON.stringify(responseBody, null, 2));

        if (!responseBody || responseBody.status !== 'initiated') {
            console.error('[GENERATE_MUSIC] ERROR: Estado inválido en respuesta:', responseBody?.status);
            throw new Error(`No se pudo iniciar la generación de la canción. Estado: ${responseBody?.status || 'desconocido'}`);
        }

        const taskId = responseBody.taskId;
        const token = responseBody.token;

        console.log(`[GENERATE_MUSIC] Generación iniciada exitosamente:`);
        console.log(`[GENERATE_MUSIC] - TaskID: ${taskId}`);
        console.log(`[GENERATE_MUSIC] - Token: ${token ? '***' + token.slice(-4) : 'N/A'}`);

        async function checkStatus(attempt = 1) {
            console.log(`[CHECK_STATUS] Iniciando verificación de estado - Intento ${attempt}`);
            
            // Delay progresivo entre verificaciones
            const delay = Math.random() * 3000 + 3000 + (attempt * 1000); // 3-6s + incremento por intento
            console.log(`[CHECK_STATUS] Esperando ${Math.round(delay/1000)}s antes de verificar...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            try {
                const checkStartTime = Date.now();
                
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

                const checkTime = Date.now() - checkStartTime;
                console.log(`[CHECK_STATUS] Petición de estado completada en ${checkTime}ms`);
                console.log(`[CHECK_STATUS] Status Code: ${statusResponse.statusCode}`);

                if (!statusResponse.body) {
                    console.error('[CHECK_STATUS] ERROR: Respuesta vacía al verificar estado');
                    throw new Error('Respuesta vacía al verificar estado');
                }

                const status = statusResponse.body.status;
                console.log(`[CHECK_STATUS] Estado actual: "${status}" (Intento ${attempt})`);
                
                // Log additional data if available
                if (statusResponse.body.message) {
                    console.log(`[CHECK_STATUS] Mensaje del servidor: ${statusResponse.body.message}`);
                }
                
                if (statusResponse.body.progress) {
                    console.log(`[CHECK_STATUS] Progreso: ${statusResponse.body.progress}`);
                }

                if (status === 'TEXT_SUCCESS') {
                    console.log('[CHECK_STATUS] ¡Generación completada exitosamente!');
                    console.log(`[CHECK_STATUS] Resultados obtenidos:`, statusResponse.body.results ? statusResponse.body.results.length : 0);
                    
                    // Log details of results
                    if (statusResponse.body.results && statusResponse.body.results.length > 0) {
                        statusResponse.body.results.forEach((result, index) => {
                            console.log(`[CHECK_STATUS] Resultado ${index + 1}:`, {
                                title: result.title,
                                hasAudioUrl: !!result.audio_url,
                                hasImageUrl: !!result.image_url,
                                duration: result.duration,
                                tags: result.tags
                            });
                        });
                    }
                    
                    return statusResponse.body.results;
                }

                if (status === 'error') {
                    console.error('[CHECK_STATUS] ERROR: Error reportado por el servidor:', statusResponse.body.message);
                    throw new Error('Error al generar la canción: ' + (statusResponse.body.message || 'Error desconocido'));
                }

                if (status === 'failed' || status === 'cancelled') {
                    console.error(`[CHECK_STATUS] ERROR: Generación ${status}:`, statusResponse.body.message);
                    throw new Error(`Generación ${status}: ${statusResponse.body.message || 'La generación no se completó'}`);
                }

                // Limitar intentos para evitar bucles infinitos
                if (attempt > 25) {
                    console.error('[CHECK_STATUS] ERROR: Tiempo de espera agotado después de 25 intentos');
                    throw new Error('Tiempo de espera agotado para la generación de música (más de 25 intentos)');
                }

                // Estados válidos para continuar
                const validContinueStates = ['initiated', 'processing', 'queued', 'pending', 'in_progress'];
                if (!validContinueStates.includes(status)) {
                    console.warn(`[CHECK_STATUS] WARN: Estado desconocido "${status}", continuando verificación...`);
                }

                console.log(`[CHECK_STATUS] Continuando verificación... Estado: "${status}"`);
                // Continuar verificando el estado
                return checkStatus(attempt + 1);

            } catch (error) {
                console.error(`[CHECK_STATUS] Error en intento ${attempt}:`, error.message);
                console.error(`[CHECK_STATUS] Error code: ${error.code}`);
                console.error(`[CHECK_STATUS] Error response status: ${error.response?.statusCode}`);
                
                if (attempt < 5 && (error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
                    console.log(`[CHECK_STATUS] Timeout detectado en intento ${attempt}, reintentando...`);
                    return checkStatus(attempt + 1);
                }
                
                console.error(`[CHECK_STATUS] Error no recuperable, finalizando verificación`);
                throw error;
            }
        }

        console.log('[GENERATE_MUSIC] Iniciando proceso de verificación de estado...');
        return await checkStatus();

    } catch (error) {
        console.error('[GENERATE_MUSIC] Error en generateMusic:', error);
        console.error('[GENERATE_MUSIC] Error stack:', error.stack);
        console.error('[GENERATE_MUSIC] Error code:', error.code);
        console.error('[GENERATE_MUSIC] Error response status:', error.response?.statusCode);
        console.error('[GENERATE_MUSIC] Error response body:', error.response?.body);
        
        // Manejo específico de errores
        if (error.message.includes('captcha') || error.message.includes('challenge')) {
            console.error('[GENERATE_MUSIC] ERROR TIPO: Cloudflare requiere verificación manual');
            throw new Error('Cloudflare requiere verificación manual. Intenta más tarde.');
        } else if (error.response?.statusCode === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
            console.error('[GENERATE_MUSIC] ERROR TIPO: Acceso denegado (403)');
            throw new Error('Acceso denegado. El servicio puede estar temporalmente bloqueado.');
        } else if (error.response?.statusCode === 429 || error.message.includes('429') || error.message.includes('Too Many Requests')) {
            console.error('[GENERATE_MUSIC] ERROR TIPO: Demasiadas peticiones (429)');
            throw new Error('Demasiadas peticiones. Espera 10 minutos antes de intentar nuevamente.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            console.error('[GENERATE_MUSIC] ERROR TIPO: Timeout de conexión');
            throw new Error('Timeout de conexión. El servicio puede estar sobrecargado.');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.error('[GENERATE_MUSIC] ERROR TIPO: No se pudo resolver DNS');
            throw new Error('No se pudo resolver la dirección del servidor. Verifica tu conexión.');
        }
        
        console.error('[GENERATE_MUSIC] ERROR TIPO: Error genérico');
        throw new Error(`Error al generar música: ${error.message}`);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}
