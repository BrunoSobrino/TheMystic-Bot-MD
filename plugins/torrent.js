// Plugin: Torrent Streamer para KanaArima-MD
// Descripción: Descarga archivos .torrent directamente a WhatsApp sin usar RAM ni Disco.

import https from 'https';
import http from 'http';
import { PassThrough } from 'stream';

const T = '```';

const CONFIG = {
    MAX_SIZE: 2 * 1024 * 1024 * 1024, // Límite de 2GB
    SUPPORTED_EXT: ['.torrent', '.trt']
};

/**
 * Lógica de Streaming sin acumulación de memoria
 */
const streamTorrent = async (url, from, client) => {
    const isHttps = url.startsWith('https');
    const protocol = isHttps ? https : http;

    return new Promise((resolve) => {
        const req = protocol.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Termux; Android) KanaArima-MD/6.0' }
        });

        req.on('response', async (res) => {
            const totalBytes = parseInt(res.headers['content-length'] || '0');
            const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);

            // Validación de tamaño
            if (totalBytes > CONFIG.MAX_SIZE) {
                req.destroy();
                return resolve({ status: false, message: `❌ El archivo es demasiado grande (${sizeMB}MB). Límite: 2GB.` });
            }

            // Creamos el túnel de datos (PassThrough)
            const bridge = new PassThrough();
            res.pipe(bridge);

            try {
                // Enviamos el flujo directamente a la API de WhatsApp
                await client.sendMessage(from, {
                    document: { stream: bridge },
                    fileName: `torrent_${Date.now()}.torrent`,
                    mimetype: 'application/x-bittorrent',
                    caption: `✅ *Torrent Procesado*\n\n📊 *Peso:* ${sizeMB} MB\n🚀 *Método:* Stream Pipeline\n⚡ *Entorno:* Termux (No RAM)`
                });
                resolve({ status: true });
            } catch (err) {
                resolve({ status: false, message: `❌ Error al enviar: ${err.message}` });
            }
        });

        req.on('error', (err) => resolve({ status: false, message: `❌ Error de conexión: ${err.message}` }));
        req.setTimeout(60000, () => { req.destroy(); resolve({ status: false, message: '⏰ Tiempo de espera agotado.' }); });
    });
};

export default {
    name: "torrent",
    aliases: ["trt"],
    category: "download",
    description: "Envía un archivo .torrent mediante streaming directo.",
    
    async execute(msg, args, client) {
        const from = msg.key.remoteJid;
        const url = args[0]?.trim();

        if (!url) {
            return client.sendMessage(from, { 
                text: `💡 *Uso Correcto:*\n.torrent <enlace_directo_torrent>\n\nEjemplo:\n${T}.torrent https://nyaa.si/download/123.torrent${T}` 
            });
        }

        // Validar extensión
        const isValid = CONFIG.SUPPORTED_EXT.some(ext => url.toLowerCase().endsWith(ext));
        if (!isValid) {
            return client.sendMessage(from, { text: "❌ La URL debe terminar en `.torrent` o `.trt`" });
        }

        const { key } = await client.sendMessage(from, { text: "📥 *Iniciando pipeline de datos...*" });

        const result = await streamTorrent(url, from, client);

        if (!result.status) {
            await client.sendMessage(from, { text: result.message });
        }

        // Borrar el mensaje de "Iniciando" para limpiar el chat
        await client.sendMessage(from, { delete: key });
    }
};
        
