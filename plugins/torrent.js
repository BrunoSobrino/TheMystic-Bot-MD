// Plugin: Torrent Streamer para KanaArima-MD
// Ruta sugerida: plugins/torrent.js

import https from 'https';
import http from 'http';
import { PassThrough } from 'stream';

const streamTorrent = async (url, from, client) => {
    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        const req = protocol.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Android; Termux) KanaArima-MD/6.0' }
        });

        req.on('response', async (res) => {
            const totalBytes = parseInt(res.headers['content-length'] || '0');
            const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);

            if (totalBytes > 2000 * 1024 * 1024) { // Límite 2GB
                req.destroy();
                return resolve({ status: false, message: `❌ Muy pesado: ${sizeMB}MB` });
            }

            const bridge = new PassThrough();
            res.pipe(bridge);

            try {
                await client.sendMessage(from, {
                    document: { stream: bridge },
                    fileName: `torrent_${Date.now()}.torrent`,
                    mimetype: 'application/x-bittorrent',
                    caption: `✅ *Torrent Streamed*\n📊 *Peso:* ${sizeMB} MB`
                });
                resolve({ status: true });
            } catch (err) {
                resolve({ status: false, message: `❌ Error: ${err.message}` });
            }
        });

        req.on('error', (err) => resolve({ status: false, message: `❌ Red: ${err.message}` }));
        req.setTimeout(60000, () => { req.destroy(); resolve({ status: false, message: '⏰ Timeout' }); });
    });
};

export default {
    name: "torrent",
    command: ["torrent", "trt"], // Asegúrate de que tu bot use 'command' o 'command' para el registro
    alias: ["torrent", "trt"],
    category: "download",
    description: "Envía un archivo torrent vía stream.",

    async execute(msg, args, client) {
        // En muchos bots de Termux, 'from' se obtiene de msg.chat o msg.key.remoteJid
        const from = msg.chat || msg.key.remoteJid;
        
        // Extraer la URL de los argumentos o del texto directamente
        const text = args.join(" ");
        const url = text.match(/https?:\/\/[^\s]+/gi)?.[0];

        if (!url) {
            return client.sendMessage(from, { 
                text: `💡 *Uso:* .torrent <enlace>\nEjemplo: .trt https://nyaa.si/download/123.torrent` 
            });
        }

        const { key } = await client.sendMessage(from, { text: "⏳ *Procesando Torrent...*" });

        const result = await streamTorrent(url, from, client);

        if (!result.status) {
            await client.sendMessage(from, { text: result.message });
        }

        await client.sendMessage(from, { delete: key });
    }
};
