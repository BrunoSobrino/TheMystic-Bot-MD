import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return conn.reply(m.chat, `*⚠️ ERROR DE ENLACE*\n\nUso: ${usedPrefix + command} <link_torrent>`, m);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  *CONECTANDO P2P...*\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ\n\n_Mira la terminal para ver el progreso real._` 
    }, { quoted: m });

    try {
        const engine = torrentStream(url, {
            path: './tmp_torrents', // Carpeta local en el proyecto
            verify: true,
            trackers: [
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://p4p.arenabg.com:1337/announce',
                'udp://tracker.torrent.eu.org:451/announce'
            ]
        });

        // --- MONITOR DE TERMINAL ---
        engine.on('ready', () => {
            const file = engine.files.reduce((prev, curr) => prev.length > curr.length ? prev : curr);
            const totalSize = (file.length / 1048576).toFixed(2);

            console.log('\n╔═════════════════════════════════════════╗');
            console.log(`║ 📁 ARCHIVO: ${file.name.substring(0, 25)}...`);
            console.log(`║ ⚖️ TAMAÑO: ${totalSize} MB`);
            console.log('╚═════════════════════════════════════════╝');

            const stream = file.createReadStream();
            const bridge = new PassThrough();
            stream.pipe(bridge);

            // Evento de descarga por pieza para ver progreso en consola
            let downloaded = 0;
            engine.on('download', (index) => {
                downloaded += engine.bitfield.buffer.length; // Estimación de bytes
                const percent = ((engine.swarm.downloaded / file.length) * 100).toFixed(2);
                const peers = engine.swarm.wires.length;
                const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(2);

                // Imprime línea de progreso en la terminal de Termux
                process.stdout.write(
                    `\r🚀 [TORRENT] ${percent}% | 📶 Peers: ${peers} | ⚡ Speed: ${speed} KB/s | 📥 ${file.name.substring(0, 15)}...`
                );
            });

            // Envío a WhatsApp
            conn.sendMessage(m.chat, {
                document: { stream: bridge },
                fileName: file.name,
                mimetype: 'video/mp4',
                caption: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  ✅ *CONTENIDO ENVIADO*\n║ \n║  📂 *FILE:* ${file.name}\n║  ⚖️ *PESO:* ${totalSize} MB\n║  🚀 *MODO:* Termux Stream\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ`
            }, { quoted: m }).then(() => {
                console.log('\n✅ [SUCCESS] Archivo enviado y motor cerrado.');
                conn.sendMessage(m.chat, { delete: key });
                engine.destroy();
            });
        });

        engine.on('error', (err) => {
            console.error('\n❌ [TORRENT ERROR]:', err.message);
            conn.reply(m.chat, `❌ *ERROR:* ${err.message}`, m);
            engine.destroy();
        });

    } catch (e) {
        console.error('\n❌ [CRITICAL ERROR]:', e);
        conn.reply(m.chat, `❌ *ERROR CRÍTICO:* ${e.message}`, m);
    }
};

handler.help = ['torrent', 'trt'];
handler.tags = ['download'];
handler.command = /^(torrent|trt)$/i;
handler.limit = false; 

export default handler;
