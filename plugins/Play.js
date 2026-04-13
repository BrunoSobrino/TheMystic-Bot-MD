import yts from 'yt-search';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

const handler = async (m, { conn, client, args, text, command }) => {
    const socket = conn || client;
    let query = text || args.join(' ');
    
    const apikey = "causa-0e3eacf90ab7be15";
    
    if (!query) return socket.sendMessage(m.chat, { text: `《✧》 Escribe el nombre o URL del video.\n\n*Ejemplo:* .play Linkin Park` }, { quoted: m });

    try {
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) throw new Error('No se encontró ningún video.');

        const isVideo = /play2|mp4|video/i.test(command);
        const isVoiceNote = /playaudio/i.test(command);
        const type = isVideo ? 'video' : 'audio';

        const captionInfo = `╭━━━〔 🎵 YOUTUBE ${isVideo ? 'VIDEO' : 'AUDIO'} 〕━━━⬣
┃ 📌 *Título:* ${video.title}
┃ ⏱ *Duración:* ${video.timestamp}
┃ 👀 *Vistas:* ${video.views.toLocaleString()}
┃ 👤 *Canal:* ${video.author.name}
┃ 🔗 *Link:* ${video.url}
╰━━━━━━━━━━━━━━━━⬣`.trim();

        await socket.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: captionInfo }, { quoted: m });
        await socket.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?apikey=${apikey}&url=${encodeURIComponent(video.url)}&type=${type}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        const downloadUrl = json.data?.download?.url || json.result?.download || json.url || (json.data && json.data.url);
        if (!downloadUrl) throw new Error('No se pudo obtener el enlace de descarga.');

        // ==========================================
        // LÓGICA DE ENVÍO
        // ==========================================
        if (isVideo) {
            // 1. ENVIAR COMO VIDEO NORMAL
            await socket.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: `🎬 *${video.title}*`,
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`
            }, { quoted: m });

        } else if (isVoiceNote) {
            // 2. ENVIAR COMO NOTA DE VOZ (Conversión a OPUS)
            const tmpMp3 = `./tmp_${Date.now()}.mp3`;
            const tmpOgg = `./tmp_${Date.now()}.ogg`;

            try {
                // Descargar el archivo temporal
                const audioRes = await fetch(downloadUrl);
                const buffer = await audioRes.buffer();
                fs.writeFileSync(tmpMp3, buffer);

                // Convertir a formato oficial de WhatsApp (OPUS)
                await execPromise(`ffmpeg -i ${tmpMp3} -c:a libopus -b:a 48k -vbr on -compression_level 10 -frame_duration 60 -application voip ${tmpOgg}`);

                // Enviar la nota de voz ya convertida
                await socket.sendMessage(m.chat, { 
                    audio: fs.readFileSync(tmpOgg), 
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: m });

            } finally {
                // Borrar archivos de Termux para no gastar memoria
                if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3);
                if (fs.existsSync(tmpOgg)) fs.unlinkSync(tmpOgg);
            }

        } else {
            // 3. ENVIAR COMO AUDIO NORMAL (Botón de Play)
            await socket.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });
        }

        await socket.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        await socket.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        socket.sendMessage(m.chat, { text: `❌ *Error:* ${e.message}` }, { quoted: m });
    }
};

handler.help = ['play', 'play2', 'playaudio', 'mp4', 'mp3', 'video'];
handler.tags = ['downloader'];
handler.command = /^(play|play2|mp3|video|mp4|playaudio)$/i;

export default handler;
