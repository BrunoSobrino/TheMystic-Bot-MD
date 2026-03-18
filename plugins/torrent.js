import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';

const cooldowns = new Map();
const activeEngines = new WeakMap();

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return m.reply(`⚠️ ERROR DE ENLACE\n\n📋 Uso: ${usedPrefix + command} <link_torrent>\n\n💡 Ejemplo: ${usedPrefix + command} https://torrent-url.com/file.torrent`);
    }

    if (!url.match(/\.torrent$|magnet:\?/i)) {
        return m.reply(`❌ URL INVÁLIDA\n\n🔗 Debe ser un enlace .torrent o magnet link válido`);
    }

    const cooldownKey = `torrent_${m.sender}`;
    const now = Date.now();
    const userCooldown = cooldowns.get(cooldownKey);
    
    if (userCooldown && (now - userCooldown.lastUsed) < 300000) {
        const remaining = Math.ceil((300000 - (now - userCooldown.lastUsed)) / 60000);
        return m.reply(`⏳ COOLDOWN ACTIVO\n\n⏰ Espera ${remaining} minuto${remaining > 1 ? 's' : ''}`);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `🔄 CONECTANDO CON TORRENT...\n\n⏳ Revisa la consola para progreso\n⚠️ Cancelar: .cancelar` 
    }, { quoted: m });

    cooldowns.set(cooldownKey, { lastUsed: now });
    
    const tmpDir = './tmp_torrents';
    ensureDir(tmpDir);

    let engine;
    let progressInterval;

    try {
        engine = torrentStream(url, {
            path: tmpDir,
            verify: true,
            trackers: [
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.opentrackr.org:1337',
                'udp://tracker.torrent.eu.org:451/announce',
                'udp://open.demonii.com:1337/announce',
                'udp://p4p.arenabg.com:1337'
            ],
            connections: 50,
            uploadsLimit: 10,
            maxConnections: 80
        });

        activeEngines.set(m, engine);

        engine.on('ready', () => {
            const files = engine.files.filter(f => f.length > 0);
            if (!files.length) throw new Error('No hay archivos válidos');

            let selectedFile = files.reduce((best, file) => {
                const bestExt = best.name.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i);
                const currExt = file.name.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i);
                if (!bestExt && currExt) return file;
                return file.length > best.length ? file : best;
            });

            const totalSize = (selectedFile.length / 1048576).toFixed(2);
            
            if (selectedFile.length > 2 * 1024 * 1024 * 1024) {
                throw new Error(`Archivo muy grande: ${(selectedFile.length / (1024**3)).toFixed(2)} GB`);
            }

            console.log('\n' + '='.repeat(50));
            console.log(`TORRENT STREAMER`);
            console.log(`${selectedFile.name}`);
            console.log(`${totalSize} MB`);
            console.log(`${path.extname(selectedFile.name).toUpperCase()}`);
            console.log('='.repeat(50));

            const stream = selectedFile.createReadStream();
            const bridge = new PassThrough();
            const startTime = Date.now();

            stream.pipe(bridge);

            progressInterval = setInterval(() => {
                try {
                    const percent = ((engine.swarm.downloaded / selectedFile.length) * 100).toFixed(1);
                    const peers = engine.swarm.wires.length;
                    const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(1);
                    
                    const elapsed = (Date.now() - startTime) / 1000;
                    const avgSpeed = elapsed > 0 ? (engine.swarm.downloaded / elapsed / 1024).toFixed(1) : 0;
                    
                    let eta = 'Calculando...';
                    if (engine.swarm.downloadSpeed() > 0) {
                        const remaining = selectedFile.length - engine.swarm.downloaded;
                        const seconds = remaining / engine.swarm.downloadSpeed();
                        eta = seconds > 60 ? `${Math.floor(seconds/60)}m ${Math.floor(seconds%60)}s` : `${Math.floor(seconds)}s`;
                    }

                    process.stdout.write(
                        `\r${percent}% | ${speed}KB/s (Ø${avgSpeed}) | ${peers} peers | ${eta}`
                    );
                } catch (e) {
                    // Ignorar errores de progreso
                }
            }, 1500);

            const ext = path.extname(selectedFile.name).toLowerCase();
            const isVideo = /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i.test(ext);
            const isAudio = /\.(mp3|wav|flac|aac|m4a|ogg)$/i.test(ext);
            
            let messageConfig = {
                document: { stream: bridge },
                fileName: selectedFile.name,
                caption: `✅ ARCHIVO DESCARGADO\n\n📁 Nombre: ${selectedFile.name}\n⚖️ Tamaño: ${totalSize} MB`
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

            conn.sendMessage(m.chat, messageConfig, { quoted: m }).then(async () => {
                console.log(`\n✅ Archivo enviado correctamente`);
                await safeCleanup();
                conn.sendMessage(m.chat, { delete: key });
            }).catch(async (err) => {
                console.error('\n❌ Error enviando:', err.message);
                await safeCleanup();
                conn.reply(m.chat, `❌ Error al enviar: ${err.message}`, m);
            });
        });

        engine.on('error', async (err) => {
            console.error('\n❌ ERROR:', err.message);
            await safeCleanup();
            conn.reply(m.chat, `❌ Error: ${err.message}`, m);
        });

    } catch (error) {
        console.error('❌ ERROR INICIAL:', error.message);
        conn.reply(m.chat, `❌ Error: ${error.message}`, m);
        safeCleanup();
    }

    const safeCleanup = async () => {
        try {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            if (engine) {
                engine.destroy();
                engine = null;
            }
            activeEngines.delete(m);
            clearTmpDir(tmpDir);
        } catch (e) {
            console.log('⚠️ Error en cleanup:', e.message);
        }
    };
};

const ensureDir = (dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (e) {
        console.log('⚠️ Error creando directorio:', e.message);
    }
};

const clearTmpDir = (dirPath) => {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    } catch (e) {
        // Ignorar errores de limpieza
    }
};

// Cleanup global cada 30 minutos
setInterval(() => {
    const now = Date.now();
    for (let [key, data] of cooldowns.entries()) {
        if (now - data.lastUsed > 1800000) { // 30 minutos
            cooldowns.delete(key);
        }
    }
}, 1800000);

handler.help = ['torrent', 'trt'];
handler.tags = ['downloader'];
handler.command = /^(torrent|trt)$/i;
handler.limit = true;

export default handler;
