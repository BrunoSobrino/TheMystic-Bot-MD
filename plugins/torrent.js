import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return conn.reply(m.chat, `*⚠️ ERROR DE ENLACE*\n\nUso: ${usedPrefix + command} <link_torrent>`, m);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  *BUSCANDO SEMILLAS...*\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ` 
    }, { quoted: m });

    try {
        // Iniciamos el motor de stream (sin guardar en disco permanentemente)
        const engine = torrentStream(url, {
            path: '/sdcard/Download/Torrents/tmp' // Carpeta temporal en tu celular
        });

        engine.on('ready', () => {
            // Seleccionar el archivo más grande
            const file = engine.files.reduce((prev, curr) => prev.length > curr.length ? prev : curr);
            const sizeMB = (file.length / 1048576).toFixed(2);

            if (file.length > 2000 * 1048576) {
                engine.destroy();
                return conn.reply(m.chat, `❌ *DEMASIADO GRANDE*\n\nPeso: ${sizeMB} MB`, m);
            }

            const stream = file.createReadStream();
            const bridge = new PassThrough();
            stream.pipe(bridge);

            conn.sendMessage(m.chat, {
                document: { stream: bridge },
                fileName: file.name,
                mimetype: 'video/mp4',
                caption: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  ✅ *CONTENIDO ENVIADO*\n║ \n║  📂 *FILE:* ${file.name}\n║  ⚖️ *PESO:* ${sizeMB} MB\n║  🚀 *MODO:* Torrent-Stream\n║  💎 *COSTO:* Gratis\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ`
            }, { quoted: m }).then(() => {
                conn.sendMessage(m.chat, { delete: key });
                engine.destroy(); // Mata el proceso y limpia
            });
        });

        engine.on('error', (err) => {
            conn.reply(m.chat, `❌ *ERROR:* ${err.message}`, m);
            engine.destroy();
        });

    } catch (e) {
        conn.reply(m.chat, `❌ *ERROR CRÍTICO:* ${e.message}`, m);
    }
};

handler.help = ['torrent', 'trt'];
handler.tags = ['download'];
handler.command = /^(torrent|trt)$/i;
handler.limit = false; 

export default handler;
