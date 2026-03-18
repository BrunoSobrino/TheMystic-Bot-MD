// Plugin Torrent WHATSAPP - PURE STREAM (ESM Version)
// 0% RAM Accumulation - Compatible con KanaArima-MD

import https from 'https';
import http from 'http';
import { PassThrough } from 'stream';

const T = '```';

const CONFIG = {
    MAX_MEMORY_LIMIT: 2 * 1024 * 1024 * 1024, // 2GB
    SUPPORTED_EXT: ['.torrent', '.trt']
};

class PureStreamTorrent {
    isValidTorrentUrl(url) {
        return CONFIG.SUPPORTED_EXT.some(ext => url.toLowerCase().endsWith(ext));
    }

    getProtocol(url) {
        return url.startsWith('https') ? https : http;
    }

    async streamToWhatsApp(url, from, client) {
        try {
            if (!this.isValidTorrentUrl(url)) {
                return { status: false, message: `❌ URL inválida\n\nEjemplo: .torrent https://site.com/file.torrent` };
            }

            const bridge = new PassThrough();
            
            const req = this.getProtocol(url).get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android) TorrentBot/3.0' }
            });

            return new Promise((resolve) => {
                req.on('response', async (res) => {
                    const totalBytes = parseInt(res.headers['content-length'] || '0');
                    const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);

                    if (totalBytes > CONFIG.MAX_MEMORY_LIMIT) {
                        req.destroy();
                        return resolve({ status: false, message: `❌ Excede el límite de 2GB (Archivo: ${sizeMB}MB)` });
                    }

                    // Flujo directo: Red -> Bridge -> WhatsApp
                    res.pipe(bridge);

                    try {
                        await client.sendMessage(from, {
                            document: { stream: bridge },
                            fileName: `torrent_${Date.now()}.torrent`,
                            mimetype: 'application/x-bittorrent',
                            caption: `✅ *Torrent Streamed*\n\n📊 *Tamaño:* ${sizeMB}MB\n🚀 *Modo:* ESM Pure Stream\n⚡ *Status:* Sin archivos temporales`
                        }, { quoted: null });

                        resolve({ status: true });
                    } catch (err) {
                        resolve({ status: false, message: `❌ Error en el pipeline: ${err.message}` });
                    }
                });

                req.on('error', (err) => resolve({ status: false, message: `❌ Error de red: ${err.message}` }));
                
                req.setTimeout(300000, () => {
                    req.destroy();
                    resolve({ status: false, message: '⏰ Timeout de conexión (5 min)' });
                });
            });

        } catch (error) {
            return { status: false, message: `❌ Error crítico: ${error.message}` };
        }
    }
}

const streamer = new PureStreamTorrent();

// Exportación compatible con el cargador de plugins de KanaArima-MD
export default {
    name: "torrent",
    aliases: ['trt'],
    category: "download",
    description: "Descarga torrents directamente a WhatsApp sin usar RAM.",

    async execute(msg, args, client) {
        const from = msg.key.remoteJid;
        const url = args[0]?.trim();

        if (!url) {
            return client.sendMessage(from, { 
                text: `${T}⚠️ Proporciona una URL de un archivo .torrent${T}` 
            });
        }

        const loading = await client.sendMessage(from, { text: "🔄 Procesando stream de torrent..." });

        const result = await streamer.streamToWhatsApp(url, from, client);

        if (!result.status) {
            await client.sendMessage(from, { text: result.message });
        }
        
        // Limpieza del mensaje de carga
        await client.sendMessage(from, { delete: loading.key });
    }
};
