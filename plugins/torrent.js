import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, args, usedPrefix, command, db }) => {
    const url = args[0]?.trim();

    // 🔍 VALIDACIÓN MEJORADA DEL TORRENT
    if (!url) {
        return m.reply(`*⚠️ ERROR DE ENLACE*\n\n📋 *Uso:* ${usedPrefix + command} <link_torrent>\n\n💡 *Ejemplo:* ${usedPrefix + command} https://torrent-url.com/file.torrent`);
    }

    if (!url.match(/\.torrent$|magnet:\?/i)) {
        return m.reply(`*❌ URL INVÁLIDA*\n\n🔗 Debe ser un enlace .torrent o magnet link válido`);
    }

    // 🚫 ANTI-SPAM: Verificar cooldown por usuario
    const cooldownKey = `torrent_cooldown_${m.sender}`;
    const now = Date.now();
    const cooldownData = db.data?.cooldowns?.[cooldownKey];
    
    if (cooldownData && (now - cooldownData.lastUsed) < 300000) { // 5 minutos
        const remaining = Math.ceil((300000 - (now - cooldownData.lastUsed)) / 60000);
        return m.reply(`*⏳ COOLDOWN ACTIVO*\n\n⏰ Espera ${remaining} minuto${remaining > 1 ? 's' : ''} antes de usar de nuevo`);
    }

    // 📤 MENSAJE INICIAL CON CANCELACIÓN
    const { key } = await conn.sendMessage(m.chat, { 
        text: `🔄 *CONECTANDO CON TORRENT...*\n\n⏳ Revisa la consola para progreso\n\n⚠️ *Cancelar:* .cancelar` 
    }, { quoted: m });

    // 💾 REGISTRAR EN DB PARA CANCELACIÓN
    if (!db.data.cooldowns) db.data.cooldowns = {};
    db.data.cooldowns[cooldownKey] = { lastUsed: now, engineId: Date.now() };
    db.data.activeTorrents = db.data.activeTorrents || [];
    db.data.activeTorrents.push({ chat: m.chat, key, engineId: Date.now(), sender: m.sender });

    const tmpDir = path.join(__dirname, '../tmp_torrents');
    ensureDir(tmpDir);

    let engine;
    try {
        engine = torrentStream(url, {
            path: tmpDir,
            verify: true,
            trackers: [
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.opentrackr.org:1337',
                'udp://tracker.torrent.eu.org:451/announce',
                'udp://open.demonii.com:1337/announce',
                'udp://p4p.arenabg.com:1337',
                'udp://tracker.cyberia.is:6969/announce'
            ],
            connections: 55,        // Máx conexiones
            uploadsLimit: 15,       // KB/s upload
            downloadsLimit: -1,     // Sin límite download
            maxConnections: 100,
            tmpDir: tmpDir
        });

        // 🛡️ CANCELACIÓN POR USUARIO
        const cancelListener = (msg) => {
            if (msg.text === '.cancelar' && msg.sender === m.sender && msg.chat === m.chat) {
                engine.destroy();
                cleanup();
                conn.sendMessage(m.chat, { delete: key });
                conn.reply(m.chat, '❌ *TORRENT CANCELADO*', msg);
                conn.ev.off('messages.upsert', cancelListener);
            }
        };
        conn.ev.on('messages.upsert', cancelListener);

        engine.on('ready', () => {
            const files = engine.files.filter(f => f.length > 0);
            if (!files.length) throw new Error('No hay archivos válidos en el torrent');

            // 🎯 SELECCIONAR MEJOR ARCHIVO (video prioritario)
            let selectedFile = files.reduce((best, file) => {
                const bestExt = best.name.match(/\.(mp4|mkv|avi|mov|wmv|flv)$/i);
                const currExt = file.name.match(/\.(mp4|mkv|avi|mov|wmv|flv)$/i);
                
                if (!bestExt && currExt) return file;  // Prioridad video
                if (currExt && !bestExt) return best;
                return file.length > best.length ? file : best;
            });

            const totalSize = (selectedFile.length / 1048576).toFixed(2);
            
            // 🚫 LÍMITE DE TAMAÑO (2GB)
            if (selectedFile.length > 2 * 1024 * 1024 * 1024) {
                throw new Error(`Archivo demasiado grande: ${(selectedFile.length / (1024**3)).toFixed(2)} GB (Máx: 2GB)`);
            }

            console.clear();
            console.log('\n' + '='.repeat(60));
            console.log(`🎬 TORRENT STREAMER v2.0`);
            console.log(`📁 Archivo: ${selectedFile.name}`);
            console.log(`⚖️  Tamaño: ${totalSize} MB`);
            console.log(`🎯 Extensión: ${path.extname(selectedFile.name).toUpperCase()}`);
            console.log('='.repeat(60));

            const stream = selectedFile.createReadStream();
            const bridge = new PassThrough();
            let downloaded = 0;
            let startTime = Date.now();

            stream.pipe(bridge);

            // 📊 MONITOR DE PROGRESO AVANZADO
            const progressInterval = setInterval(() => {
                const percent = ((engine.swarm.downloaded / selectedFile.length) * 100).toFixed(1);
                const peers = engine.swarm.wires.length;
                const seeds = engine.swarm.wires.filter(w => w.downloaded > 0).length;
                const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(1);
                
                const elapsed = (Date.now() - startTime) / 1000;
                const avgSpeed = elapsed > 0 ? (engine.swarm.downloaded / elapsed / 1024).toFixed(1) : 0;
                
                let eta = 'Calculando...';
                if (engine.swarm.downloadSpeed() > 0) {
                    const remaining = selectedFile.length - engine.swarm.downloaded;
                    const seconds = remaining / engine.swarm.downloadSpeed();
                    eta = seconds > 3600 
                        ? `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`
                        : `${Math.floor(seconds/60)}m ${Math.floor(seconds%60)}s`;
                }

                process.stdout.write(
                    `\r📊 ${percent}% | ⚡ ${speed}KB/s (Ø${avgSpeed}) | 🌱 ${seeds}/${peers} | ⏰ ${eta} | 📥 ${formatBytes(engine.swarm.downloaded)}`
                );
            }, 1000);

            // 📤 ENVÍO INTELIGENTE SEGÚN TIPO DE ARCHIVO
            const ext = path.extname(selectedFile.name).toLowerCase();
            const isVideo = /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i.test(ext);
            const isAudio = /\.(mp3|wav|flac|aac|m4a|ogg)$/i.test(ext);
            
            let messageConfig = {
                document: { stream: bridge },
                fileName: selectedFile.name,
                caption: `✅ *ARCHIVO DESCARGADO*\n\n📁 *Nombre:* ${selectedFile.name}\n⚖️ *Tamaño:* ${totalSize} MB\n🚀 *Velocidad:* Streaming directo`
            };

            if (isVideo) {
                messageConfig = {
                    video: { stream: bridge },
                    fileName: selectedFile.name,
                    caption: messageConfig.caption
                };
            } else if (isAudio) {
                messageConfig = {
                    audio: { stream: bridge },
                    mimetype: 'audio/mpeg',
                    fileName: selectedFile.name,
                    caption: messageConfig.caption
                };
            }

            const sendPromise = conn.sendMessage(m.chat, messageConfig, { quoted: m });

            sendPromise.then(async () => {
                clearInterval(progressInterval);
                console.log(`\n\n✅ [ÉXITO] Archivo enviado correctamente`);
                await cleanup();
                conn.sendMessage(m.chat, { delete: key });
            }).catch(async (err) => {
                clearInterval(progressInterval);
                console.error('\n❌ Error enviando:', err.message);
                await cleanup();
                conn.reply(m.chat, `❌ *Error al enviar:* ${err.message}`, m);
            });

        });

        engine.on('idle', () => {
            console.log('\n⏳ Motor inactivo, esperando peers...');
        });

        engine.on('error', async (err) => {
            console.error('\n💥 ERROR DEL MOTOR:', err.message);
            await cleanup();
            conn.reply(m.chat, `❌ *Error del torrent:*\n${err.message}`, m);
        });

    } catch (error) {
        console.error('💥 ERROR INICIAL:', error);
        conn.reply(m.chat, `❌ *Error crítico:*\n${error.message}`, m);
        if (engine) engine.destroy();
    }

    // 🧹 FUNCIÓN DE LIMPIEZA
    const cleanup = async () => {
        conn.ev.off('messages.upsert', cancelListener);
        if (engine) {
            engine.removeAllListeners();
            engine.destroy();
        }
        clearTmpDir(tmpDir);
        // Limpiar DB
        db.data.activeTorrents = db.data.activeTorrents.filter(t => t.engineId !== db.data.cooldowns[cooldownKey]?.engineId);
    };
};

// 🛠️ UTILIDADES
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const clearTmpDir = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

handler.help = ['torrent', 'trt'];
handler.tags = ['downloader', 'media'];
handler.command = /^(torrent|trt)$/i;
handler.limit = true;
handler.group = true;

export default handler;
