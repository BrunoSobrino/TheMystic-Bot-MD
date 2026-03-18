// Plugin Torrent WHATSAPP - PIPELINE + STREAMS MEMORY
// 100% RAM - Sin archivos temporales

const { pipeline } = require('stream/promises');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const T = '```';

const CONFIG = {
    MAX_MEMORY: 2 * 1024 * 1024 * 1024, // 2GB RAM
    DOWNLOAD_DIR: '/sdcard/Download/Torrents/',
    SUPPORTED_EXT: ['.torrent', '.trt']
};

class MemoryTorrentStreamer {
    constructor() {
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        exec(`mkdir -p ${CONFIG.DOWNLOAD_DIR}`, () => {});
    }

    isValidTorrentUrl(url) {
        return CONFIG.SUPPORTED_EXT.some(ext => 
            url.toLowerCase().endsWith(ext)
        );
    }

    getProtocolAgent(url) {
        return url.startsWith('https') ? https.globalAgent : http.globalAgent;
    }

    async streamToWhatsApp(url, from, client, msg) {
        try {
            if (!this.isValidTorrentUrl(url)) {
                return {
                    status: false,
                    message: `❌ URL inválida\n\n📝 .torrent https://nyaa.si/download/xxx.torrent`
                };
            }

            // 💾 Backup storage (opcional)
            await execAsync('termux-setup-storage');

            // 📊 Progress Stream
            const progressStream = new PassThrough();
            let totalBytes = 0;
            let downloadedBytes = 0;

            progressStream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                process.stdout.write(`\r📥 ${percent}% (${(downloadedBytes/1024/1024).toFixed(1)}MB)`);
            });

            // 🎯 Memory Buffer
            const memoryBuffer = [];
            let bufferSize = 0;

            // 📥 Download Stream
            const req = (url.startsWith('https') ? https : http).get(url, {
                agent: this.getProtocolAgent(url),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android) TorrentBot/1.0'
                }
            });

            return new Promise((resolve) => {
                req.on('response', async (res) => {
                    totalBytes = parseInt(res.headers['content-length'] || '0');

                    if (totalBytes > CONFIG.MAX_MEMORY) {
                        req.destroy();
                        resolve({
                            status: false,
                            message: `❌ Demasiado grande: ${(totalBytes/1024/1024).toFixed(1)}MB\n📏 Límite: 2GB`
                        });
                        return;
                    }

                    // 🔄 STREAM → MEMORY
                    res.pipe(progressStream);

                    res.on('data', (chunk) => {
                        memoryBuffer.push(chunk);
                        bufferSize += chunk.length;

                        // 🧹 GC cada 100MB
                        if (bufferSize > 100 * 1024 * 1024) {
                            global.gc?.();
                        }
                    });

                    res.on('end', async () => {
                        try {
                            // ✅ CONCATENAR MEMORY BUFFER
                            const finalBuffer = Buffer.concat(memoryBuffer);
                            const sizeMB = (finalBuffer.length / 1024 / 1024).toFixed(2);

                            // 📁 BACKUP DISCO (opcional)
                            const safeName = `torrent_${Date.now()}_${Math.random().toString(36).slice(2)}.torrent`;
                            const backupPath = path.join(CONFIG.DOWNLOAD_DIR, safeName);
                            fs.writeFileSync(backupPath, finalBuffer);

                            // 🎉 ENVIAR WHATSAPP
                            await client.sendMessage(from, {
                                document: finalBuffer,
                                fileName: safeName,
                                mimetype: 'application/x-bittorrent',
                                caption: `✅ *Torrent STREAMED!*\n\n📊 *Tamaño:* ${sizeMB}MB\n💾 *RAM usada:* ${(bufferSize/1024/1024).toFixed(2)}MB\n📁 *Backup:* ${CONFIG.DOWNLOAD_DIR}\n\n⚡ *100% Memory Pipeline*`
                            });

                            // 🧹 LIMPIEZA
                            memoryBuffer.length = 0;
                            global.gc?.();

                            resolve({ status: true });

                        } catch (err) {
                            resolve({ status: false, message: `❌ Error stream: ${err.message}` });
                        }
                    });
                });

                req.on('error', (err) => {
                    resolve({ status: false, message: `❌ Conexión: ${err.message}` });
                });

                // ⏰ Timeout 2min
                req.setTimeout(120000, () => {
                    req.destroy();
                    resolve({ status: false, message: '⏰ Timeout (2min)' });
                });
            });
        } catch (error) {
            return { status: false, message: `❌ ${error.message}` };
        }
    }
}

const memoryStreamer = new MemoryTorrentStreamer();

module.exports = {
    name: "torrent",

    async execute(msg, args, client) {
        const from = msg.key.remoteJid;

        if (args.length === 0) {
            return client.sendMessage(from, { 
                text: T + 
`⚡ TORRENT STREAM → WHATSAPP MEMORY

📋 .torrent <URL>
📋 .trt <URL>

🌐 https://nyaa.si/download/xxx.torrent

🚀 100% RAM PIPELINE
💾 SIN ARCHIVOS TEMPORALES
📏 2GB MÁXIMO` + T 
            });
        }

        const url = args.join(' ').trim();

        // 💬 Mensaje inicio
        const loadingMsg = await client.sendMessage(from, { 
            text: `🔄 Streaming torrent...\n📡 ${url.substring(0, 40)}...` 
        });

        const result = await memoryStreamer.streamToWhatsApp(url, from, client, msg);

        // 🗑️ Eliminar loading
        await client.sendMessage(from, { delete: loadingMsg.key });

        if (!result.status) {
            await client.sendMessage(from, { text: result.message });
        }
    },

    aliases: ['trt'],
    description: "⚡ Torrent → WhatsApp MEMORY STREAM (2GB)"
};
