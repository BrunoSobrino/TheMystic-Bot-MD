import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import axios from 'axios';
import fetch from 'node-fetch';
import NodeID3 from 'node-id3';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw '*[❗] Por favor, ingresa una descripción para generar la canción.*';
        
        m.reply("*[❗] Ey! Espera un poco, nuestra IA creativa está trabajando a todo ritmo para componer tu canción perfecta, esto puede demorar unos momentos, cuando esté lista se te enviará.*");
        const generatedSongs = await generateMusic(args.join(' '));
        
        if (!generatedSongs || generatedSongs.length === 0) throw '❌ No se pudo generar la canción. Intenta con otro prompt.';
        
        const song = generatedSongs[0];
        
        const [audioBuffer, thumbnailBuffer] = await Promise.all([
            fetch(song.audio_url).then(res => res.buffer()),
            fetch(song.image_url).then(res => res.buffer())
        ]);
               
        const tags = {
            title: song.title,
            artist: 'Suno AI',
            album: 'Generado por IA',
            APIC: thumbnailBuffer,
            year: new Date().getFullYear().toString(),
            comment: {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nGénero: ${song.tags}}`
            }
        };
        
        if (song.lyrics !== null) {
            tags.unsynchronisedLyrics = {
                language: 'spa',
                text: `👑 By @BrunoSobrino 👑\n\nTítulo: ${song.title}\n\n${song.lyrics}`.substring(0, 5000)
            };
        }
        
        const taggedBuffer = NodeID3.write(tags, audioBuffer);
                
        const tmpDir = tmpdir();
        const audioPath = join(tmpDir, `${song.title.replace(/[^a-z0-9]/gi, '_')}.mp3`);
        writeFileSync(audioPath, taggedBuffer);
        
const thumbnailMessage = await prepareWAMessageMedia({ image: { url: song.image_url } }, { upload: conn.waUploadToServer });
const documentMessage = await prepareWAMessageMedia({ document: {
            url: audioPath,
            mimetype: 'audio/mpeg',
            fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
            fileLength: taggedBuffer.length,
            title: song.title.substring(0, 64), 
            ptt: false 
        }
    }, { upload: conn.waUploadToServer, mediaType: 'document' }
);
const mesg = generateWAMessageFromContent(m.chat, {
    documentMessage: {
        ...documentMessage.documentMessage,
        mimetype: 'audio/mpeg',
        title: song.title.substring(0, 64),
        fileName: `${sanitizeFileName(song.title.substring(0, 64))}.mp3`, 
        jpegThumbnail: thumbnailMessage.imageMessage.jpegThumbnail,
        mediaKeyTimestamp: Math.floor(Date.now() / 1000),
    }}, { userJid: conn.user.jid, quoted: m})
                
await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
        
        setTimeout(() => {
            if (existsSync(audioPath)) unlinkSync(audioPath);
        }, 5000);
        
    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply(`❌ Ocurrió un error al generar la canción: ${error.message || error}`);
    }
};
handler.help = ['musicaia <descripción>'];
handler.tags = ['ai', 'music'];
handler.command = /^(musicaia|musicaai|aimusic|genmusic)$/i;
export default handler;

async function generateMusic(prompt) {
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Referer': 'https://suno.com/'
    };
    const requestData = {
        prompt: prompt,
        title: prompt.substring(0, 50),
        style: "",
        customMode: false,
        instrumental: false
    };
    try {
        const generateResponse = await axios.post(
            'https://suno.exomlapi.com/generate',
            requestData, { headers: headers, timeout: 60000 });
        if (generateResponse.data.status !== 'initiated') throw new Error('No se pudo iniciar la generación de la canción');
        const taskId = generateResponse.data.taskId;
        const token = generateResponse.data.token;
        async function checkStatus() {
            const statusData = { taskId: taskId, token: token };
            const statusResponse = await axios.post('https://suno.exomlapi.com/check-status', statusData, { headers: headers, timeout: 30000 });
            if (statusResponse.data.status === 'TEXT_SUCCESS') return statusResponse.data.results;
            if (statusResponse.data.status === 'error') throw new Error('Error al generar la canción: ' + (statusResponse.data.message || 'Error desconocido'));
            await new Promise(resolve => setTimeout(resolve, 3000));
            return checkStatus();
        }
        return await checkStatus();
    } catch (error) {
        console.error('Error en generateMusic:', error);
        throw new Error(`Error al conectar con el servicio de música: ${error.message}`);
    }
}

function sanitizeFileName(str) {
    return str.replace(/[\/\\|:*?"<>]/g, '').trim();
}