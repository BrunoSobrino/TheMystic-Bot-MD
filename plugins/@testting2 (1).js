import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import got from 'got'; // Back to regular got with advanced strategies
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

    // Lista de User Agents diversificados
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];

    const strategies = [
        {
            name: 'Estrategia Básica con Headers Modernos',
            config: () => {
                const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
                return {
                    json: requestData,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUA,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
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
                        request: 90000,
                        connect: 15000
                    },
                    retry: {
                        limit: 2,
                        methods: ['POST']
                    },
                    followRedirect: true,
                    maxRedirects: 3
                };
            }
        },
        {
            name: 'Estrategia con Headers Extendidos',
            config: () => {
                const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
                const randomIP = generateRandomIP();
                return {
                    json: requestData,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUA,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,fr;q=0.7',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': '"Windows"',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'cross-site',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'Referer': 'https://suno.com/',
                        'Origin': 'https://suno.com',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Forwarded-For': randomIP,
                        'X-Real-IP': randomIP,
                        'X-Client-IP': randomIP,
                        'X-Request-ID': generateRandomString(16),
                        'X-Session-ID': generateRandomString(32)
                    },
                    timeout: {
                        request: 120000,
                        connect: 20000
                    },
                    retry: {
                        limit: 3,
                        methods: ['POST'],
                        statusCodes: [408, 413, 429, 500, 502, 503, 504, 520, 521, 522, 524]
                    },
                    followRedirect: true,
                    maxRedirects: 5,
                    dnsCache: true,
                    keepAlive: true
                };
            }
        },
        {
            name: 'Estrategia Minimalista (cURL-like)',
            config: () => ({
                json: requestData,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'curl/7.68.0',
                    'Accept': '*/*',
                    'Connection': 'keep-alive'
                },
                timeout: {
                    request: 180000,
                    connect: 30000
                },
                retry: {
                    limit: 1
                },
                followRedirect: false
            })
        },
        {
            name: 'Estrategia con Delay y Headers Aleatorios',
            config: () => {
                const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
                const platforms = ['"Windows"', '"macOS"', '"Linux"'];
                const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
                
                return {
                    json: requestData,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': randomUA,
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Sec-Ch-Ua': '"Chromium";v="120", "Not_A Brand";v="8"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': randomPlatform,
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        'Referer': 'https://suno.com/create',
                        'Origin': 'https://suno.com',
                        'X-Timestamp': Date.now().toString(),
                        'X-Random': Math.random().toString(36).substring(2)
                    },
                    timeout: {
                        request: 150000,
                        connect: 25000
                    },
                    retry: {
                        limit: 2,
                        methods: ['POST']
                    }
                };
            }
        }
    ];

    let generateResponse;
    let lastError;

    // Intentar cada estrategia
    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        
        try {
            console.log(`[GENERATE_MUSIC] Probando ${strategy.name} (${i + 1}/${strategies.length})...`);
            
            // Delay aleatorio entre intentos (excepto el primero)
            if (i > 0) {
                const delay = Math.random() * 3000 + 2000; // 2-5 segundos
                console.log(`[GENERATE_MUSIC] Esperando ${Math.round(delay/1000)}s antes del siguiente intento...`);
                await sleep(delay);
            }
            
            const startTime = Date.now();
            const config = strategy.config();
            
            console.log(`[GENERATE_MUSIC] Headers configurados:`, Object.keys(config.headers || {}).join(', '));
            
            generateResponse = await got.post('https://suno.exomlapi.com/generate', config);
            
            const requestTime = Date.now() - startTime;
            console.log(`[GENERATE_MUSIC] ✅ ${strategy.name} exitosa en ${requestTime}ms`);
            console.log(`[GENERATE_MUSIC] Status Code: ${generateResponse.statusCode}`);
            break;
            
        } catch (error) {
            console.log(`[GENERATE_MUSIC] ❌ ${strategy.name} falló: ${error.message}`);
            console.log(`[GENERATE_MUSIC] Error code: ${error.code}, Status: ${error.response?.statusCode}`);
            lastError = error;
            
            // Si es el último intento, no continuar
            if (i === strategies.length - 1) {
                console.error('[GENERATE_MUSIC] Todas las estrategias fallaron');
                throw lastError;
            }
        }
    }

    if (!generateResponse || !generateResponse.body) {
        console.error('[GENERATE_MUSIC] ERROR: Respuesta vacía después de todos los intentos');
        throw new Error('No se pudo obtener respuesta del servidor después de múltiples intentos');
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
        const baseDelay = 4000 + (attempt * 1500); // Incremento progresivo
        const randomDelay = Math.random() * 2000; // Factor aleatorio
        const totalDelay = baseDelay + randomDelay;
        
        console.log(`[CHECK_STATUS] Esperando ${Math.round(totalDelay/1000)}s antes de verificar...`);
        await sleep(totalDelay);
        
        // Usar estrategia aleatoria para check-status también
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        try {
            const checkStartTime = Date.now();
            
            const statusResponse = await got.post('https://suno.exomlapi.com/check-status', {
                json: { taskId: taskId, token: token },
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': randomUA,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                    'Referer': 'https://suno.com/',
                    'Origin': 'https://suno.com',
                    'X-Request-ID': generateRandomString(12),
                    'X-Attempt': attempt.toString(),
                    'X-Timestamp': Date.now().toString()
                },
                timeout: {
                    request: 90000,
                    connect: 15000
                },
                retry: {
                    limit: 2,
                    statusCodes: [408, 413, 429, 500, 502, 503, 504, 520, 521, 522, 524]
                },
                followRedirect: true,
                maxRedirects: 3
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
            if (attempt > 30) {
                console.error('[CHECK_STATUS] ERROR: Tiempo de espera agotado después de 30 intentos');
                throw new Error('Tiempo de espera agotado para la generación de música (más de 30 intentos)');
            }

            // Estados válidos para continuar
            const validContinueStates = ['initiated', 'processing', 'queued', 'pending', 'in_progress', 'running'];
            if (!validContinueStates.includes(status)) {
                console.warn(`[CHECK_STATUS] WARN: Estado desconocido "${status}", continuando verificación...`);
            }

            console.log(`[CHECK_STATUS] Continuando verificación... Estado: "${status}"`);
            return checkStatus(attempt + 1);

        } catch (error) {
            console.error(`[CHECK_STATUS] Error en intento ${attempt}:`, error.message);
            console.error(`[CHECK_STATUS] Error code: ${error.code}`);
            console.error(`[CHECK_STATUS] Error response status: ${error.response?.statusCode}`);
            
            if (attempt < 5 && (
                error.code === 'ETIMEDOUT' || 
                error.code === 'ECONNRESET' || 
                error.message.includes('timeout') ||
                error.response?.statusCode >= 500
            )) {
                console.log(`[CHECK_STATUS] Error recuperable en intento ${attempt}, reintentando...`);
                return checkStatus(attempt + 1);
            }
            
            console.error(`[CHECK_STATUS] Error no recuperable, finalizando verificación`);
            throw error;
        }
    }

    console.log('[GENERATE_MUSIC] Iniciando proceso de verificación de estado...');
    return await checkStatus();
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
