import https from 'https';
import http from 'http';
import { PassThrough } from 'stream';

/**
 * Plugin Torrent Streamer - Versión Gratuita (Sin Diamantes)
 * Sistema: 100% Stream Pipeline (Zero RAM)
 */

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    // 1. Validación de URL
    if (!url) {
        return conn.reply(m.chat, `💡 *Uso:* ${usedPrefix + command} <enlace_torrent>\n\nEjemplo:\n.trt https://nyaa.si/download/123.torrent`, m);
    }

    if (!url.toLowerCase().endsWith('.torrent')) {
        return conn.reply(m.chat, '⚠️ Solo se permiten enlaces directos que terminen en *.torrent*', m);
    }

    // 2. Mensaje de espera (Loading)
    const { key } = await conn.sendMessage(m.chat, { text: '⏳ *Iniciando descarga por Stream...*' }, { quoted: m });

    try {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.get(url, (res) => {
            // Validar estado de la respuesta
            if (res.statusCode !== 200) {
                conn.sendMessage(m.chat, { delete: key });
                return conn.reply(m.chat, `❌ El servidor respondió con error: ${res.statusCode}`, m);
            }

            const totalBytes = parseInt(res.headers['content-length'] || 0);
            const sizeMB = (totalBytes / 1048576).toFixed(2);
            
            // Tubería de datos (Pipeline)
            const bridge = new PassThrough();
            res.pipe(bridge);

            // 3. Envío directo a WhatsApp
            conn.sendMessage(m.chat, {
                document: { stream: bridge },
                fileName: `torrent_${Date.now()}.torrent`,
                mimetype: 'application/x-bittorrent',
                caption: `✅ *Stream Finalizado*\n\n📊 *Peso:* ${sizeMB} MB\n🚀 *Modo:* 0% RAM Accumulation\n💎 *Costo:* Gratis (Sin diamantes)`
            }, { quoted: m }).then(() => {
                // Limpieza del mensaje de espera
                conn.sendMessage(m.chat, { delete: key });
            });
        });

        req.on('error', (e) => {
            conn.sendMessage(m.chat, { delete: key });
            conn.reply(m.chat, `❌ Error de conexión: ${e.message}`, m);
        });

        req.setTimeout(60000, () => {
            req.destroy();
            conn.sendMessage(m.chat, { delete: key });
            conn.reply(m.chat, '⏰ Tiempo de espera agotado (Timeout).', m);
        });

    } catch (e) {
        conn.reply(m.chat, `❌ Error crítico: ${e.message}`, m);
    }
};

// --- CONFIGURACIÓN DEL HANDLER AL FINAL ---
handler.help = ['torrent', 'trt'];
handler.tags = ['download'];
handler.command = /^(torrent|trt)$/i; // Registra .torrent y .trt

// Propiedades de acceso (Sin diamantes)
handler.limit = false;   // <--- AQUÍ: Desactiva el costo de diamantes
handler.register = false; // Permite que lo usen aunque no estén registrados
handler.premium = false;  // No requiere ser usuario premium

export default handler;
