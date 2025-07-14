import yts from 'yt-search';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

const tmpDir = join(process.cwd(), '../tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

let handler = async (m, { conn, args, usedPrefix }) => {
    try {
        const [type, ...queryArgs] = args;
        const query = queryArgs.join(' ');
        if (!query) return m.reply(`[ ✎ ] Ejemplo: ${usedPrefix}audio Beggin You`);

        const { videos } = await yts(query);
        if (!videos || videos.length === 0) return m.reply('No se encontraron resultados.');

        const video = videos[0];
        const mediaUrl = await getDownloadLink(video.url, type === 'audio');
        
        if (type === 'audio') {
            const audioBuffer = await fetch(mediaUrl).then(res => res.buffer());
            const thumbnailBuffer = await fetch(video.thumbnail).then(res => res.buffer());
            const tags = {
                title: video.title,
                artist: video.author.name,
                APIC: thumbnailBuffer,
                year: new Date().getFullYear(),
            };
            const taggedBuffer = NodeID3.write(tags, audioBuffer);
            await conn.sendMessage(m.chat, {
                audio: taggedBuffer, 
                fileName: `${sanitizeFileName(video.title)}.mp3`,
                mimetype: 'audio/mpeg',
            }, { quoted: m });
        } 
        else if (type === 'video') {
            const videoBuffer = await fetch(mediaUrl).then(res => res.buffer());
            await conn.sendMessage(m.chat, {
                video: videoBuffer, 
                caption: `*${video.title}*`, 
                mimetype: 'video/mp4', 
                fileName: `${sanitizeFileName(video.title)}.mp4`
            }, { quoted: m });
        } 
        else {
            return m.reply(`El tipo debe ser "audio" o "video".`);
        }
    } catch (e) {
        console.error(e);
        m.reply(`*Error: ${e.message}*`);
    }
};

handler.help = ['audio <búsqueda>', 'video <búsqueda>'];
handler.tags = ['downloader'];
handler.command = ["audio", "video"];
export default handler;

function sanitizeFileName(name) {
    return name.replace(/[\\/:*?"<>|]/g, '');
}

async function getDownloadLink(url, isAudio) {
    const fetchUrl = isAudio ? 
        `https://api.mp3youtube.cc/v2/youtube/download?url=${encodeURIComponent(url)}&format=mp3` : 
        `https://api.mp3youtube.cc/v2/youtube/download?url=${encodeURIComponent(url)}&format=mp4`;
    
    const response = await fetch(fetchUrl);
    const data = await response.json();
    return data.link || data.url || data.downloadUrl;
}
