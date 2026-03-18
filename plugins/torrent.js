// Plugin Torrent - KanaArima-MD
// Ruta: /data/data/com.termux/files/home/KanaArima-MD/plugins/torrent.js

import https from 'https';
import http from 'http';
import { PassThrough } from 'stream';

/**
 * Función de procesamiento de Stream directo
 * No acumula buffers, solo actúa como puente.
 */
const startStreaming = async (url, from, client) => {
    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        const req = protocol.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Android; Termux) KanaArima-MD/6.0' }
        });

        req.on('response', async (res) => {
            const totalBytes = parseInt(res.headers['content-length'] || '0');
            const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);

            // Seguridad: Límite de 2GB
            if (totalBytes > 2 * 1024 * 1024 * 1024) {
                req.destroy();
                return resolve({ status: false, message: `❌ Archivo demasiado pesado: ${sizeMB}MB` });
            }

            // Creamos el conducto (PassThrough)
            const bridge = new PassThrough();
            res.pipe(bridge);

            try {
                // Enviamos el stream directamente a WhatsApp
                await client.sendMessage(from, {
                    document: { stream: bridge },
                    fileName: `torrent_${Date.now()}.torrent`,
                    mimetype: 'application/x-bittorrent',
                    caption: `✅ *Stream Completo*\n\n📊 *Peso:* ${sizeMB} MB\n🚀 *Metodo:* Zero-RAM Pipeline\n📱 *Entorno:* Termux ESM`
                });
                resolve({ status: true });
            } catch (err) {
                resolve({ status: false, message: `❌ Error en el envío: ${err.message}` });
            }
        });

        req.on('error', (err) => resolve({ status: false, message: `❌ Error de red: ${err.message}` }));
        req.setTimeout(60000, () => { req.destroy(); resolve({ status: false, message: '⏰ Tiempo agotado.' }); });
    });
};

export default {
    name: "torrent",
    aliases: ["trt"], // Esto permite que funcione con .trt y .torrent
    category: "download",
    description: "Descarga archivos torrent por stream directo.",

    async execute(msg, args, client) {
        const from = msg.key.remoteJid;
        const url = args[0]?.trim();

        // Si no hay URL, enviamos el menú de ayuda
        if (!url) {
            return client.sendMessage(from, { 
                text: `*Uso de Comandos:*\n\n.torrent <link>\n.trt <link>\n\n_Ejemplo: .trt https://site.com/file.torrent_` 
            });
        }

        // Validación rápida de extensión
        if (!url.toLowerCase().endsWith('.torrent') && !url.toLowerCase().endsWith('.trt')) {
            return client.sendMessage(from, { text: "⚠️ La URL debe ser un enlace directo a un archivo .torrent" });
        }

        // Mensaje de espera (Loading)
        const { key } = await client.sendMessage(from, { text: "🚀 *Conectando con el servidor...*" });

        const result = await startStreaming(url, from, client);

        if (!result.status) {
            await client.sendMessage(from, { text: result.message });
        }

        // Borramos el mensaje de "Conectando" para no ensuciar el chat
        await client.sendMessage(from, { delete: key });
    }
};
