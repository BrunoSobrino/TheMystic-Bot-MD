import WebTorrent from 'webtorrent';
import { PassThrough } from 'stream';

const client = new WebTorrent();

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return conn.reply(m.chat, `*⚠️ ERROR DE ENLACE*\n\nUso: ${usedPrefix + command} <link_torrent>`, m);
    }

    // Mensaje de Carga con tu decoración
    const { key } = await conn.sendMessage(m.chat, { 
        text: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  *PROCESANDO TORRENT...*\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ` 
    }, { quoted: m });

    // Iniciar el motor de búsqueda P2P
    client.add(url, (torrent) => {
        // Seleccionamos el archivo más grande (el video/contenido real)
        const file = torrent.files.reduce((prev, curr) => prev.length > curr.length ? prev : curr);
        const sizeMB = (file.length / 1048576).toFixed(2);
        
        // Evitar que el bot colapse por archivos de más de 2GB
        if (file.length > 2048 * 1048576) {
            torrent.destroy();
            return conn.reply(m.chat, `❌ *ARCHIVO DEMASIADO GRANDE*\n\nPeso: ${sizeMB} MB\nLímite: 2048 MB`, m);
        }

        const stream = file.createReadStream();
        const bridge = new PassThrough();
        stream.pipe(bridge);

        // Envío del archivo real
        conn.sendMessage(m.chat, {
            document: { stream: bridge },
            fileName: file.name,
            mimetype: 'video/mp4', // Cambia según el archivo, pero mp4 es estándar
            caption: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  ✅ *DESCARGA EXITOSA*\n║ \n║  📂 *FILE:* ${file.name}\n║  ⚖️ *PESO:* ${sizeMB} MB\n║  🚀 *MODO:* P2P STREAM\n║  💎 *COSTO:* GRATIS\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ`
        }, { quoted: m }).then(() => {
            conn.sendMessage(m.chat, { delete: key });
            torrent.destroy(); // Limpiar caché de Termux inmediatamente
        });

        // Log en la consola de Termux para monitorear
        torrent.on('download', () => {
            process.stdout.write(`\r📥 [TORRENT] Descargando: ${(torrent.progress * 100).toFixed(1)}% | ${sizeMB}MB`);
        });
    });

    client.on('error', (err) => {
        conn.sendMessage(m.chat, { delete: key });
        conn.reply(m.chat, `❌ *FALLO EN EL MOTOR P2P*\n\n${err.message}`, m);
    });
};

handler.help = ['torrent', 'trt'];
handler.tags = ['download'];
handler.command = /^(torrent|trt)$/i;
handler.limit = false; 

export default handler;
