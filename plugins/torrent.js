import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';

const cooldowns = new Map();
const activeEngines = new WeakMap();

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return m.reply(`⚠️ *ERROR DE ENLACE*\n\n📋 Uso: ${usedPrefix + command} <link_torrent>\n\n💡 Ejemplo: ${usedPrefix + command} magnet:?xt=urn:btih:...`);
    }

    if (!url.match(/\.torrent$|magnet:\?/i)) {
        return m.reply(`❌ *URL INVÁLIDA*\n\n🔗 Debe ser un enlace .torrent o magnet link válido.`);
    }

    // --- Sistema de Cooldown ---
    const cooldownKey = `torrent_${m.sender}`;
    const now = Date.now();
    const userCooldown = cooldowns.get(cooldownKey);
    
    if (userCooldown && (now - userCooldown.lastUsed) < 300000) {
        const remaining = Math.ceil((300000 - (now - userCooldown.lastUsed)) / 60000);
        return m.reply(`⏳ *COOLDOWN ACTIVO*\n\n⏰ Espera ${remaining} minuto${remaining > 1 ? 's' : ''} para pedir otro torrent.`);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `🔄 *CONECTANDO CON EL ENJAMBRE...*\n\n⏳ Buscando peers (esto puede tardar unos segundos)\n⚠️ Cancelar: Use .cancelar (si implementado)` 
    }, { quoted: m });

    cooldowns.set(cooldownKey, { lastUsed: now });
    
    // Directorio temporal único por usuario para evitar errores de Node.js Internals
    const userId = m.sender.replace(/[^0-9]/g, '');
    const userTmpDir = path.join('./tmp_torrents', `${userId}_${Date.now()}`);
    ensureDir(userTmpDir);

    let engine = null;
    let progressInterval = null;
    let bridge = null;
    let fileStream = null;

    const safeCleanup = async () => {
        try {
            if (progressInterval) clearInterval(progressInterval);
            
            // Cerrar streams antes de destruir el motor
            if (fileStream) fileStream.unpipe();
            if (bridge) bridge.destroy();
            
            if (engine) {
                engine.remove(() => {}); 
                engine.destroy();
                engine = null;
            }
            
            activeEngines.delete(m);
            // Pequeño delay para asegurar que Node soltó los archivos antes de borrar
            setTimeout(() => clearTmpDir(userTmpDir), 2000);
        } catch (e) {
            console.log('⚠️ Error en cleanup:', e.message);
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
                'udp://opentracker.i2p.rocks:6969/announce',
                'udp://tracker.torrent.eu.org:451/announce'
            ],
            connections: 30, // Reducido para evitar saturar el bot
            uploadsLimit: 5
        });

        activeEngines.set(m, engine);

        // Timeout por si el torrent está muerto (30 segundos)
        const torrentTimeout = setTimeout(() => {
            if (engine && !engine.files.length) {
                safeCleanup();
                conn.reply(m.chat, '❌ *TIEMPO AGOTADO:* No se encontraron semillas (seeds) para este torrent.', m);
            }
        }, 40000);

        engine.on('ready', () => {
            clearTimeout(torrentTimeout);
            const files = engine.files.filter(f => f.length > 0);
            if (!files.length) throw new Error('El torrent no contiene archivos válidos.');

            // Seleccionar el archivo más pesado (generalmente la película/serie)
            let selectedFile = files.reduce((prev, current) => (prev.length > current.length) ? prev : current);

            const totalSizeMB = (selectedFile.length / (1024 * 1024)).toFixed(2);
            
            // Limite de seguridad: 1.5GB (ajustable según tu servidor)
            if (selectedFile.length > 1.5 * 1024 * 1024 * 1024) {
                throw new Error(`El archivo es demasiado grande (${(selectedFile.length / (1024**3)).toFixed(2)} GB). El límite es 1.5GB.`);
            }

            fileStream = selectedFile.createReadStream();
            bridge = new PassThrough();
            const startTime = Date.now();

            fileStream.pipe(bridge);

            // Registro de progreso en consola
            progressInterval = setInterval(() => {
                const downloaded = engine.swarm.downloaded;
                const percent = ((downloaded / selectedFile.length) * 100).toFixed(1);
                const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(1);
                process.stdout.write(`\r📥 Descargando: ${percent}% | Speed: ${speed} KB/s | Peers: ${engine.swarm.wires.length}`);
            }, 2000);

            const ext = path.extname(selectedFile.name).toLowerCase();
            const isVideo = /\.(mp4|mkv|avi|mov|flv|webm)$/i.test(ext);
            const isAudio = /\.(mp3|wav|flac|aac|m4a|ogg)$/i.test(ext);
            
            let messageConfig = {
                document: { stream: bridge },
                fileName: selectedFile.name,
                caption: `✅ *ARCHIVO COMPLETADO*\n\n📁 *Nombre:* ${selectedFile.name}\n⚖️ *Tamaño:* ${totalSizeMB} MB`
            };

            if (isVideo) {
                messageConfig = { video: { stream: bridge }, fileName: selectedFile.name, caption: messageConfig.caption };
            } else if (isAudio) {
                messageConfig = { audio: { stream: bridge }, mimetype: 'audio/mpeg', fileName: selectedFile.name };
            }

            conn.sendMessage(m.chat, messageConfig, { quoted: m }).then(async () => {
                console.log(`\n✅ Enviado: ${selectedFile.name}`);
                await safeCleanup();
                conn.sendMessage(m.chat, { delete: key });
            }).catch(async (err) => {
                console.error('\n❌ Error al enviar:', err);
                await safeCleanup();
            });
        });

        engine.on('error', async (err) => {
            console.error('Motor Error:', err);
            await safeCleanup();
            conn.reply(m.chat, `❌ *ERROR DEL MOTOR:* ${err.message}`, m);
        });

    } catch (error) {
        console.error('Error Inicial:', error);
        conn.reply(m.chat, `❌ *ERROR:* ${error.message}`, m);
        await safeCleanup();
    }
};

// --- Funciones de Utilidad ---

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function clearTmpDir(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    } catch (e) {
        console.log(`No se pudo borrar temporal: ${dirPath}`);
    }
}

// Limpieza de cooldowns cada 30 min
setInterval(() => {
    const now = Date.now();
    for (let [key, data] of cooldowns.entries()) {
        if (now - data.lastUsed > 1800000) cooldowns.delete(key);
    }
}, 1800000);

handler.help = ['torrent', 'trt'];
handler.tags = ['downloader'];
handler.command = /^(torrent|trt)$/i;
handler.limit = true;

export default handler;
                  
