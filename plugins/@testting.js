// Plugin para test de comandos - powered by @BrunoSobrino
// Si vas a robar deja creditos o doname >:v
import { searchMusic, getAudioBuffer, getVideoBuffer, getVideoInfo } from '../src/libraries/ytmusic.js';
import fetch from 'node-fetch';
import axios from 'axios';
import NodeID3 from 'node-id3';
import fs from 'fs';
import { spawn } from 'child_process';
import { load } from 'cheerio';
import { tmpdir } from 'os';
import { join } from 'path';
const { generateWAMessageFromContent, prepareWAMessageMedia } = await import("baileys");

const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;
const TMP_DIR = join(process.cwd(), './src/tmp');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const idioma = global?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
    let _translate;
    try {
        _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/${m.plugin}.json`));
    } catch {
        // El archivo por idioma no existe en todos los idiomas: usar el de español.
        _translate = JSON.parse(fs.readFileSync(`./src/languages/es/${m.plugin}.json`));
    }
    const tradutor = _translate._testting;

    try {
        const query = args.join(' ');
        if (!query) return m.reply(tradutor.errors.no_query.replace('@command', usedPrefix + command));

        let video;
        const isYouTubeUrl = isValidYouTubeUrl(query);

        if (isYouTubeUrl) {
            video = await getVideoInfoFromUrl(query);
        } else {
            video = await searchVideo(query);
            if (!video) return m.reply(tradutor.errors.no_results);
        }

        const videoInfoMsg = `${tradutor.video_info.header}\n\n${tradutor.video_info.title.replace('@title', video.title)}\n${tradutor.video_info.author.replace('@author', video.author.name)}\n${tradutor.video_info.duration.replace('@duration', video.duration?.timestamp || '00:00')}\n${tradutor.video_info.views.replace('@views', (video.views || 0).toLocaleString())}\n${tradutor.video_info.published.replace('@published', video.ago || 'Desconocido')}\n${tradutor.video_info.id.replace('@id', video.videoId)}\n${tradutor.video_info.link.replace('@link', video.url)}`.trim();

        conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: videoInfoMsg }, { quoted: m });

        const isAudio = command === 'test';
        const format = isAudio ? 'mp3' : '720p';

        const downloadResult = await ytDownload(video.videoId, format);

        if (!downloadResult || !downloadResult.buffer) throw new Error('No se pudo descargar el archivo');


        if (isAudio) {
            const audioBuffer = downloadResult.buffer;
            const thumbnailBuffer = await fetch(video.thumbnail).then(res => res.arrayBuffer()).then(ab => Buffer.from(ab));

            // Las etiquetas ID3 y la letra solo aplican a MP3. Los streams de
            // YouTube Music suelen ser AAC (.m4a) u Opus, que se mandan tal cual
            // con su mimetype correcto.
            const audioMime = (downloadResult.mimeType || 'audio/mpeg').split(';')[0].trim();
            const audioExt = audioMime.includes('mp4') ? 'm4a' : (audioMime.includes('opus') || audioMime.includes('ogg') || audioMime.includes('webm')) ? 'opus' : 'mp3';
            let taggedBuffer = audioBuffer;
            let fileName = `${sanitizeFileName(video.title.substring(0, 64))}.${audioExt}`;

            if (audioExt === 'mp3') {
                let lyricsData = await Genius.searchLyrics(video.title).catch(() => null);
                if (!lyricsData && !isYouTubeUrl) {
                    lyricsData = await Genius.searchLyrics(query).catch(() => null);
                }

                const formattedLyrics = lyricsData ? formatLyrics(lyricsData.lyrics) : null;

                const tags = {
                    title: video.title,
                    artist: video.author.name,
                    album: 'YouTube Audio',
                    APIC: thumbnailBuffer,
                    year: new Date().getFullYear(),
                    comment: {
                        language: 'spa',
                        text: `🟢 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 🟢\n\nVideo De YouTube: ${video.url}`
                    }
                };

                if (formattedLyrics) {
                    tags.unsynchronisedLyrics = {
                        language: 'spa',
                        text: `🟢 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 🟢\n\nTitulo: ${video.title}\n\n${formattedLyrics}`
                    };
                }

                taggedBuffer = NodeID3.write(tags, audioBuffer);
                fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp3`;
            }

            try {
                const audioSize = taggedBuffer.length;
                const shouldSendAsDocument = audioSize > AUDIO_SIZE_LIMIT;

                if (shouldSendAsDocument) {
                    const documentMedia = await prepareWAMessageMedia({ document: taggedBuffer }, { upload: conn.waUploadToServer });
                    const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: audioMime,
                            jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                            contextInfo: {
                                mentionedJid: [],
                                forwardingScore: 0,
                                isForwarded: false
                            }
                        }
                    }, { quoted: m });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } else {
                    const sentMsg = await conn.sendMessage(m.chat, { audio: taggedBuffer, fileName: `${sanitizeFileName(video.title)}.${audioExt}`, mimetype: audioMime }, { quoted: m });

                    setTimeout(async () => {
                        try {
                            if (sentMsg && sentMsg.message) {
                                const audioMsg = sentMsg.message.audioMessage;
                                const duration = audioMsg?.seconds || 0;


                                if (duration === 0 || !duration) {

                                    try {
                                        const repairedBuffer = await repairAudioBuffer(taggedBuffer, fileName);

                                        if (repairedBuffer) {

                                            const repairedSize = repairedBuffer.length;
                                            const shouldSendRepairedAsDocument = repairedSize > AUDIO_SIZE_LIMIT;

                                            if (!shouldSendRepairedAsDocument) {
                                                await conn.sendMessage(m.chat, { audio: repairedBuffer, fileName: `${sanitizeFileName(video.title)}.mp3`, mimetype: 'audio/mpeg' }, { quoted: sentMsg });
                                            } else {
                                                const documentMedia = await prepareWAMessageMedia({ document: repairedBuffer }, { upload: conn.waUploadToServer });
                                                const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                                                const repairMsg = generateWAMessageFromContent(m.chat, {
                                                    documentMessage: {
                                                        ...documentMedia.documentMessage,
                                                        fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`,
                                                        mimetype: 'audio/mpeg',
                                                        jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                                                        contextInfo: {
                                                            mentionedJid: [],
                                                            forwardingScore: 0,
                                                            isForwarded: false
                                                        }
                                                    }
                                                }, { quoted: sentMsg });

                                                await conn.relayMessage(m.chat, repairMsg.message, { messageId: repairMsg.key.id });
                                            }
                                        } else {
                                            console.log('DEBUG: repairAudioBuffer retornó null o undefined');
                                        }
                                    } catch (repairError) {
                                        console.log('DEBUG: Error en repairAudioBuffer:', repairError.message);
                                    }
                                } else {
                                }
                            } else {
                                console.log('DEBUG: sentMsg o sentMsg.message es undefined');
                            }
                        } catch (verifyError) {
                            console.log('DEBUG: Error en verificación de duración:', verifyError.message);
                        }
                    }, 2000);
                }
            } catch (audioError) {
                const errorMsg = audioError.message || audioError.toString();
                if (errorMsg.includes('Media upload failed') ||
                    errorMsg.includes('ENOSPC') ||
                    errorMsg.includes('no space left') ||
                    errorMsg.includes('Internal Server Error') ||
                    errorMsg.includes('size') ||
                    errorMsg.includes('memory')) {

                    try {
                        const documentMedia = await prepareWAMessageMedia({ document: taggedBuffer }, { upload: conn.waUploadToServer });
                        const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                        const msg = generateWAMessageFromContent(m.chat, {
                            documentMessage: {
                                ...documentMedia.documentMessage,
                                fileName: fileName,
                                mimetype: audioMime,
                                jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                                contextInfo: {
                                    mentionedJid: [],
                                    forwardingScore: 0,
                                    isForwarded: false
                                }
                            }
                        }, { quoted: m });

                        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                    } catch (urlError) {
                        await m.reply(tradutor.errors.generic.replace('@error', 'Error de envío. Intenta nuevamente.'));
                    }
                } else {
                    await m.reply(tradutor.errors.generic.replace('@error', audioError.message));
                }
            }

        } else {
            // Manejo de video: el buffer ya viene descargado y unido
            // (video + audio) por la librería compartida.
            let videoBuffer = null;
            try {
                videoBuffer = downloadResult.buffer;
                const thumbnailBuffer = await fetch(video.thumbnail).then(res => res.arrayBuffer()).then(ab => Buffer.from(ab));

                const videoSize = videoBuffer.length;
                const shouldSendAsDocument = videoSize > VIDEO_SIZE_LIMIT;
                const fileName = `${sanitizeFileName(video.title.substring(0, 64))}.mp4`;

                if (shouldSendAsDocument) {
                    const documentMedia = await prepareWAMessageMedia({ document: videoBuffer }, { upload: conn.waUploadToServer });
                    const thumbnailMedia = await prepareWAMessageMedia({ image: thumbnailBuffer }, { upload: conn.waUploadToServer });

                    const msg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMedia.documentMessage,
                            fileName: fileName,
                            mimetype: 'video/mp4',
                            jpegThumbnail: thumbnailMedia.imageMessage.jpegThumbnail,
                            contextInfo: {
                                mentionedJid: [],
                                forwardingScore: 0,
                                isForwarded: false
                            }
                        }
                    }, { quoted: m });

                    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } else {
                    await conn.sendMessage(m.chat, { video: videoBuffer, caption: video.title, mimetype: 'video/mp4', fileName: `${sanitizeFileName(video.title)}.mp4` }, { quoted: m });
                }

            } catch (videoError) {
                const errorMsg = videoError.message || videoError.toString();
                if (errorMsg.includes('Media upload failed') ||
                    errorMsg.includes('ENOSPC') ||
                    errorMsg.includes('no space left') ||
                    errorMsg.includes('Internal Server Error') ||
                    errorMsg.includes('size') ||
                    errorMsg.includes('memory')) {

                    try {
                        const urlDocumentMedia = await prepareWAMessageMedia({ document: videoBuffer }, { upload: conn.waUploadToServer });
                        const urlThumbnailMedia = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

                        const msg = generateWAMessageFromContent(m.chat, {
                            documentMessage: {
                                ...urlDocumentMedia.documentMessage,
                                fileName: fileName,
                                mimetype: 'video/mp4',
                                jpegThumbnail: urlThumbnailMedia.imageMessage.jpegThumbnail,
                                contextInfo: {
                                    mentionedJid: [],
                                    forwardingScore: 0,
                                    isForwarded: false
                                }
                            }
                        }, { quoted: m });

                        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                    } catch (urlError) {
                        await m.reply(tradutor.errors.generic.replace('@error', 'Error de envío. Intenta nuevamente.'));
                    }
                } else {
                    await m.reply(tradutor.errors.generic.replace('@error', videoError.message));
                }
            }
        }

    } catch (e) {
        console.log('DEBUG: Error general en handler:', e.message);
        await m.reply(tradutor.errors.generic.replace('@error', e.message));
    }
};

handler.help = ['test <query>', 'test2 <query>'];
handler.tags = ['downloader'];
handler.command = /^(test|test2)$/i;
export default handler;

// Descarga con el scraper de YouTube Music (InnerTube). Reemplaza al
// conversor externo anterior, que está caído. Devuelve el enlace directo del
// mejor formato: audio se prefiere AAC (audio/mp4), video se prefiere MP4
// (H.264), que son los que WhatsApp reproduce como audio/video normal.
// Descarga con la librería compartida (src/libraries/ytmusic.js): el audio
// se baja por trozos y el video se baja y se une con su audio con ffmpeg.
// Devuelve el buffer listo para mandar, no un enlace (los enlaces directos
// de googlevideo devuelven 403 sin Range).
async function ytDownload(videoId, userFormat = 'mp3') {
    if (userFormat === 'mp3') {
        const { buffer, mimeType, ext } = await getAudioBuffer(videoId);
        return { buffer, mimeType, ext };
    }
    const { buffer, mimeType } = await getVideoBuffer(videoId);
    return { buffer, mimeType, ext: 'mp4' };
}

async function searchVideo(query) {
    return searchMusic(query, 'songs');
}

function isValidYouTubeUrl(url) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)/i;
    return ytRegex.test(url) && extractVideoId(url);
}

async function getVideoInfoFromUrl(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('URL de YouTube no válida');
        return await getVideoInfo(videoId);
    } catch (error) {
        return getVideoInfoFromYouTubeAPI(url);
    }
}

async function getVideoInfoFromYouTubeAPI(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('ID de video no válido');
        return {
            videoId: videoId,
            url: url,
            title: 'Video de YouTube',
            author: {
                name: 'Canal de YouTube'
            },
            duration: {
                seconds: 0,
                timestamp: '0:00'
            },
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: 0,
            ago: 'Desconocido'
        };

    } catch (error) {
        throw new Error(`Error al procesar URL de YouTube: ${error.message}`);
    }
}

function sanitizeFileName(name) {
    return name.replace(/[\\/:*?"<>|]/g, '');
}

function formatLyrics(lyrics) {
    if (!lyrics) return null;
    return lyrics
        .replace(/^\d+\s+Contributor[s]?.*?Lyrics/i, '')
        .replace(/\[Letra de ".*?"\]/g, '')
        .replace(/\[.*?\s+Lyrics\]/g, '')
        .replace(/\[([^\]]+)\]/g, '\n[$1]\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.match(/^(Embed|You might also like|See.*?Live)/i))
        .join('\n');
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?v=)([^&\n?#]+)/);
    return match ? match[1] : null;
}

const Genius = {
    async searchLyrics(query) {
        try {
            const searchUrl = `https://genius.com/api/search/song?q=${encodeURIComponent(query)}`;
            const searchRes = await axios.get(searchUrl);

            if (!searchRes.data.response?.sections?.[0]?.hits?.length) {
                throw new Error('No se encontraron letras en Genius.');
            }

            const songPath = searchRes.data.response.sections[0].hits[0].result.path;
            const lyricsUrl = `https://genius.com${songPath}`;
            const { data } = await axios.get(lyricsUrl);
            const $ = load(data);

            let lyrics = $('div[class*="Lyrics__Container"]').html();
            if (!lyrics) throw new Error('Letra no disponible en formato estructurado.');

            lyrics = lyrics.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').trim();

            return {
                title: searchRes.data.response.sections[0].hits[0].result.title,
                artist: searchRes.data.response.sections[0].hits[0].result.primary_artist.name,
                url: lyricsUrl,
                lyrics: lyrics
            };

        } catch (error) {
            throw error;
        }
    }
};

async function repairAudioBuffer(audioBuffer, fileName) {

    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
    }

    const inputPath = join(TMP_DIR, `input_${Date.now()}_${fileName}`);
    const outputPath = join(TMP_DIR, `repaired_${Date.now()}_${fileName}`);


    try {
        fs.writeFileSync(inputPath, audioBuffer);

        return new Promise((resolve, reject) => {

            const ffmpeg = spawn('ffmpeg', [
                '-i', inputPath,
                '-c:a', 'libmp3lame',
                '-b:a', '128k',
                '-ac', '2',
                '-ar', '44100',
                '-y',
                outputPath
            ]);

            let stderr = '';

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            ffmpeg.on('close', (code) => {
                try {
                    if (code === 0 && fs.existsSync(outputPath)) {
                        const repairedBuffer = fs.readFileSync(outputPath);

                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);

                        resolve(repairedBuffer);
                    } else {
                        reject(new Error(`FFmpeg process failed with code ${code}: ${stderr}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });

            ffmpeg.on('error', (error) => {
                reject(error);
            });

            setTimeout(() => {
                if (ffmpeg.exitCode === null) {
                    ffmpeg.kill();
                    reject(new Error('FFmpeg timeout'));
                }
            }, 30000);
        });

    } catch (error) {
        console.log('DEBUG: Error en repairAudioBuffer:', error.message);
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (cleanupError) {
        }
        throw error;
    }
}
