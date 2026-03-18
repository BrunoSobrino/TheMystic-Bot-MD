import torrentStream from 'torrent-stream';
import { PassThrough } from 'stream';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0]?.trim();

    if (!url) {
        return conn.reply(m.chat, `*⚠️ ERROR DE ENLACE*\n\nUso: ${usedPrefix + command} <link_torrent>`, m);
    }

    const { key } = await conn.sendMessage(m.chat, { 
        text: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  *CONECTANDO...*\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ` 
    }, { quoted: m });

    try {
        const engine = torrentStream(url, {
            path: './tmp_torrents',
            verify: true,
            trackers: [
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://p4p.arenabg.com:1337/announce'
            ]
        });

        engine.on('ready', () => {
            const file = engine.files.reduce((prev, curr) => prev.length > curr.length ? prev : curr);
            const totalSize = (file.length / 1048576).toFixed(2);

            console.log(`\n📦 [START] ${file.name} | ${totalSize} MB`);

            const stream = file.createReadStream();
            const bridge = new PassThrough();
            stream.pipe(bridge);

            // Monitor simplificado (Menos carga para el procesador)
            let lastLog = 0;
            engine.on('download', () => {
                const now = Date.now();
                if (now - lastLog > 1000) { // Solo actualiza la terminal cada 1 segundo
                    const percent = ((engine.swarm.downloaded / file.length) * 100).toFixed(1);
                    const speed = (engine.swarm.downloadSpeed() / 1024).toFixed(2);
                    process.stdout.write(`\r🚀 [TERMUX] ${percent}% | ⚡ ${speed} KB/s | 📶 Peers: ${engine.swarm.wires.length} `);
                    lastLog = now;
                }
            });

            // Envío forzado como DOCUMENTO
            conn.sendMessage(m.chat, {
                document: { stream: bridge },
                fileName: file.name,
                mimetype: 'application/octet-stream',
                caption: `╔═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╗˖ꉂ📥ﮩ٨ـﮩﮩ٨ـ☣︎⃤꩜\n║  ✅ *DOCUMENTO LISTO*\n║ \n║  📂 *ARCHIVO:* ${file.name}\n║  ⚖️ *TAMAÑO:* ${totalSize} MB\n╚═̷͠═̷͝═̷̈́═̷͋═̷͘═̷͊═̷͝═̷╝🔋⃤૮⇀ﻌ↼აⳊ`
            }, { quoted: m }).then(() => {
                console.log(`\n✅ [FIN] ${file.name} enviado.`);
                conn.sendMessage(m.chat, { delete: key });
                engine.destroy();
            }).catch((err) => {
                console.error('❌ Error enviando:', err);
                engine.destroy();
            });
        });

        engine.on('error', (err) => {
            console.error('❌ Engine Error:', err);
            engine.destroy();
        });

    } catch (e) {
        console.error('❌ Error Crítico:', e);
        conn.reply(m.chat, `❌ *ERROR:* ${e.message}`, m);
    }
};

handler.help = ['torrent', 'trt'];
handler.tags = ['download'];
handler.command = /^(torrent|trt)$/i;
handler.limit = false; 

export default handler;
