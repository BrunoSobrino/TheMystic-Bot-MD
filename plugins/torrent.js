import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const cooldowns = new Map();
const activeEngines = new WeakMap();

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return m.reply(`⚠️ *ERROR DE ENLACE*\n\n📋 Uso: ${usedPrefix + command} <link_torrent>\n\n💡 Ejemplo: ${usedPrefix + command} magnet:?xt=urn:btih:...`);
    }

    if (!url.match(/\.torrent$|magnet:\?/i)) {
        return m.reply(`❌ *URL INVÁLIDA*\n\n🔗 El enlace debe ser un archivo .torrent o un magnet link.`);
    }

    // --- Control de Cooldown ---
    const cooldownKey = `torrent_${m.sender}`;
    const now = Date.now();
    if (cooldowns.has(cooldownKey) && (now - cooldowns.get(cooldownKey).lastUsed) < 300000) {
        const remaining = Math.ceil((300000 - (now - cooldowns.get(cooldownKey).lastUsed)) / 60000);
        return m.reply(`⏳ *ESPERA:* Faltan ${remaining} minuto${remaining > 1 ? 's' : ''} para volver a usar este comando.`);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `🔄 *INICIANDO MOTOR TORRENT...*\n\n📡 Conectando con pares (peers)...\n⏱️ Tiempo estimado: 15-40 seg.` 
    }, { quoted: m });

    cooldowns.set(cooldownKey, { lastUsed: now });
    
    // Crear carpeta temporal única con ID aleatorio para evitar conflictos de Node.js
    const sessionId = randomBytes(4).toString('hex');
    const userTmpDir = path.join('./tmp_torrents', `session_${sessionId}`);
    
    if (!fs.existsSync('./tmp_torrents')) fs.mkdirSync('./tmp_torrents');
    fs.mkdirSync(userTmpDir, { recursive: true });

    let engine = null;
    let progressInterval = null;
    let bridge = null;
    let fileStream = null;

    // Función de limpieza "suave" para evitar el ERR_INTERNAL_ASSERTION
    const safeCleanup = async () => {
        try {
            if (progressInterval) clearInterval(progressInterval);
            
            // 1. Desconectar streams antes de cerrar el motor
            if (fileStream) fileStream.unpipe();
            if (bridge) {
                bridge.end();
                bridge.destroy();
            }
            
            if (engine) {
                // Removemos los listeners para evitar triggers durante el cierre
                engine.removeAllListeners();
                engine.destroy(() => {
                    engine = null;
                });
            }
            
            activeEngines.delete(m);

            // 2. Borrado diferido (Delay): Da tiempo a Node.js para liberar los descriptores de archivo
            setTimeout(() => {
                try {
                    if (fs.existsSync(userTmpDir)) {
                        fs.rmSync(userTmpDir, { recursive: true, force: true });
                    }
                } catch (e) { /* Ignorar errores de borrado tardío */ }
            }, 10000); 

        } catch (e) {
            console.error('⚠️ Error en limpieza:', e.message);
        }
    };

    try {
        engine = torrentStream(url, {
            path: userTmpDir,
            verify: true,
            trackers: [
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://9.rarbg.com:2810/announce',
                'udp://tracker.openbittorrent.com:6969/announce',
                'http://tracker.openbittorrent.com:80/announce',
                'udp://exodus.desync.com:6969/announce',
                'udp://tracker.torrent.eu.org:451/announce'
            ],
            connections: 30, // Límite para no saturar el ancho de banda del VPS
            uploadsLimit: 2
        });

        activeEngines.set(m, engine);

        // Timeout por si el torrent no tiene semillas (45 segundos)
        const torrentTimeout = setTimeout(() => {
            if (engine && (!engine.files || engine.files.length === 0)) {
                safeCleanup();
                conn.reply(m.chat, '❌ *TIEMPO AGOTADO:* No hay suficientes semillas (seeds) para iniciar la descarga.', m);
            }
        }, 45000);

        engine.on('ready', () => {
            clearTimeout(torrentTimeout);
            
            const files = engine.files.filter(f => f.length > 0);
            if (!files.length) throw new Error('El torrent está vacío.');

            // Seleccionar el archivo más grande (generalmente el video)
            let selectedFile = files.reduce((prev, curr) => (prev.length > curr.length) ? prev : curr);
            const totalSizeMB = (selectedFile.length / (1024 * 1024)).toFixed(2);
            
            // Límite de seguridad: 1.5GB
            if (selectedFile.length > 1500 * 1024 * 1024) {
                safeCleanup();
                return conn.reply(m.chat, `⚠️ *ARCHIVO MUY GRANDE:* El límite es de 1.5GB. Este archivo pesa ${(selectedFile.length / (1024**3)).toFixed(2)} GB.`, m);
            }

            fileStream = selectedFile.createReadStream();
            bridge = new PassThrough();
            fileStream.pipe(bridge);

            // Reporte de progreso en consola (opcional)
            progressInterval = setInterval(() => {
                if (engine.swarm) {
                    const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(1);
                    const peers = engine.swarm.wires.length;
                    process.stdout.write(`\r📥 [TORRENT] Descargando: ${selectedFile.name} | ${speed} KB/s | Peers: ${peers}`);
                }
            }, 3000);

            const ext = path.extname(selectedFile.name).toLowerCase();
            const isVideo = /\.(mp4|mkv|avi|mov|flv|webm)$/i.test(ext);
            const isAudio = /\.(mp3|wav|flac|aac|m4a|ogg)$/i.test(ext);
            
            let messageConfig = {
                document: { stream: bridge },
                fileName: selectedFile.name,
                caption: `✅ *DESCARGA EXITOSA*\n\n📁 *Nombre:* ${selectedFile.name}\n⚖️ *Tamaño:* ${totalSizeMB} MB`
            };

            if (isVideo) {
                messageConfig = { video: { stream: bridge }, fileName: selectedFile.name, caption: messageConfig.caption };
            } else if (isAudio) {
                messageConfig = { audio: { stream: bridge }, mimetype: 'audio/mpeg', fileName: selectedFile.name };
            }

            conn.sendMessage(m.chat, messageConfig, { quoted: m }).then(async () => {
                await safeCleanup();
                conn.sendMessage(m.chat, { delete: key });
            }).catch(async (err) => {
                console.error('Error al enviar mensaje:', err);
                await safeCleanup();
            });
        });

        engine.on('error', async (err) => {
            console.error('Error en el motor:', err);
            await safeCleanup();
            conn.reply(m.chat, `❌ *ERROR INTERNO:* ${err.message}`, m);
        });

    } catch (error) {
        console.error('Error en handler:', error);
        conn.reply(m.chat, `❌ *ERROR:* ${error.message}`, m);
        await safeCleanup();
    }
};

handler.help = ['torrent', 'trt'];
handler.tags = ['downloader'];
handler.command = /^(torrent|trt)$/i;
handler.limit = true;

export default handler;
                             
