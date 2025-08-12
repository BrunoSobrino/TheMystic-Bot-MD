// Plugin para test de comandos - powered by @BrunoSobrino
// Si vas a robar deja creditos o doname >:v
import yts from 'yt-search';
import { existsSync, mkdirSync, writeFileSync, statSync, unlinkSync, createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import axios from 'axios';
import NodeID3 from 'node-id3';
import ffmpeg from 'fluent-ffmpeg';
import { load } from 'cheerio';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const ytDownloader = createYoutubeDownloader();
const tmpDir = join(process.cwd(), './src/tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function cleanupResources() {
    try {
        if (global.gc) {
            global.gc();
        }
    } catch (e) {
        console.error('Cleanup error:', e);
    }
}

const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

let handler = async (m, { conn, args, usedPrefix, command }) => {
        const idioma = global?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
        const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/${m.plugin}.json`));
        const tradutor = _translate._testting;
    
    cleanupResources();
    
    try {

        const query = args.join(' ');
        if (!query) return m.reply(tradutor.errors.no_query.replace('@command', usedPrefix + command));

        let video;
        const isYouTubeUrl = isValidYouTubeUrl(query);
        
        if (isYouTubeUrl) {
            video = await getVideoInfoFromUrl(query);
        } else {
            const { videos } = await yts(query);
            if (!videos || videos.length === 0) return m.reply(tradutor.errors.no_results);
            video = videos[0];
        }

        const videoInfoMsg = `${tradutor.video_info.header}\n\n${tradutor.video_info.title.replace('@title', video.title)}\n${tradutor.video_info.author.replace('@author', video.author.name)}\n${tradutor.video_info.duration.replace('@duration', video.duration?.timestamp || '00:00')}\n${tradutor.video_info.views.replace('@views', (video.views || 0).toLocaleString())}\n${tradutor.video_info.published.replace('@published', video.ago || 'Desconocido')}\n${tradutor.video_info.id.replace('@id', video.videoId)}\n${tradutor.video_info.link.replace('@link', video.url)}`.trim();

        if (command !== 'ytmp3' && command !== 'ytmp4') { conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: videoInfoMsg }, { quoted: m }) }

        const isAudio = command === 'test' || command === 'play' || command === 'ytmp3';

        const mediaUrl = await getY2MetaLink(video.url, isAudio);
        const timestamp = Date.now();
        const id = `${video.videoId}_${timestamp}`;

        if (isAudio) {
            try {
                const [audioBuffer, thumbnailBuffer] = await Promise.all([
                    fetch(mediaUrl).then(res => res.buffer()),
                    fetch(video.thumbnail).then(res => res.buffer())
                ]);

                const audioSize = audioBuffer.length;
                const shouldSendAsDocument = audioSize > AUDIO_SIZE_LIMIT;

                if (shouldSendAsDocument) {
                    const sizeMB = (audioSize / (1024 * 1024)).toFixed(2);
                    await m.reply(tradutor.errors.large_audio.replace('@size', sizeMB));
                    
                    // ENVÍO DIRECTO COMO DOCUMENTO - SIN prepareWAMessageMedia
                    await conn.sendMessage(m.chat, {
                        document: taggedBuffer,
                        fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`,
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: video.title.substring(0, 64),
                                body: `${video.author.name} • Audio de YouTube`,
                                thumbnailUrl: video.thumbnail,
                                sourceUrl: video.url,
                                mediaType: 2,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m });
                    
                    return; // IMPORTANTE: Salir aquí para evitar el código de abajo
                }

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
                        text: `👑 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 👑\n\nVideo De YouTube: ${video.url}`
                    }
                };

                if (formattedLyrics) {
                    tags.unsynchronisedLyrics = {
                        language: 'spa',
                        text: `👑 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 👑\n\nTitulo: ${video.title}\n\n${formattedLyrics}`
                    };
                }

                const taggedBuffer = NodeID3.write(tags, audioBuffer);

                if (shouldSendAsDocument) {
                    // ENVÍO SIMPLE COMO DOCUMENTO PARA ARCHIVOS GRANDES
                    await conn.sendMessage(m.chat, {
                        document: taggedBuffer,
                        fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`,
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            externalAdReply: {
                                title: video.title.substring(0, 64),
                                body: `${video.author.name} • Audio de YouTube`,
                                thumbnailUrl: video.thumbnail,
                                sourceUrl: video.url,
                                mediaType: 2,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m });
                // ENVÍO NORMAL PARA ARCHIVOS PEQUEÑOS (CÓDIGO ORIGINAL)
                const audioPath = join(tmpDir, `${video.videoId}.mp3`);
                writeFileSync(audioPath, taggedBuffer);

                try {
                    const thumbnailMessage = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });
                    const documentMessage = await prepareWAMessageMedia({ 
                        document: {
                            url: audioPath,
                            mimetype: 'audio/mpeg',
                            fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`, 
                            fileLength: taggedBuffer.length,
                            title: video.title.substring(0, 64), 
                            ptt: false 
                        }
                    }, { upload: conn.waUploadToServer, mediaType: 'document' });

                    const mesg = generateWAMessageFromContent(m.chat, {
                        documentMessage: {
                            ...documentMessage.documentMessage,
                            mimetype: 'audio/mpeg',
                            title: video.title.substring(0, 64),
                            fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`, 
                            jpegThumbnail: thumbnailMessage.imageMessage.jpegThumbnail,
                            mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                        }
                    }, { userJid: conn.user.jid, quoted: m });
                    
                    await conn.relayMessage(m.chat, mesg.message, { messageId: mesg.key.id });
                } catch (mediaError) {
                    cleanupResources();
                    if (mediaError.message.includes('Media upload failed') || mediaError.message.includes('upload failed') || mediaError.message.includes('ENOSPC') || mediaError.code === 'ENOSPC') {
                        await conn.sendMessage(m.chat, {
                            document: readFileSync(audioPath),
                            fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`,
                            mimetype: 'audio/mpeg'
                        }, { quoted: m });
                    } else {
                        throw mediaError;
                    }
                }

                setTimeout(() => {
                    if (existsSync(audioPath)) unlinkSync(audioPath);
                }, 5000);

            } catch (audioError) {
                console.error('Audio error:', audioError);
                await m.reply(tradutor.errors.generic.replace('@error', audioError.message));
            }

        } else {
            // VIDEO PROCESSING
            try {
                const [videoBuffer, videoMetadata, thumbnailBuffer] = await Promise.all([
                    fetch(mediaUrl).then(res => res.buffer()),
                    Promise.resolve({
                        title: video.title,
                        author: video.author.name,
                        duration: video.duration,
                        thumbnail: video.thumbnail,
                        url: video.url
                    }),
                    fetch(video.thumbnail).then(res => res.buffer())
                ]);

                const videoSize = videoBuffer.length;
                const shouldSendAsDocument = videoSize > VIDEO_SIZE_LIMIT;

                if (shouldSendAsDocument) {
                    const sizeMB = (videoSize / (1024 * 1024)).toFixed(2);
                    await m.reply(tradutor.errors.large_video.replace('@size', sizeMB));
                    
                    // ENVÍO SIMPLE COMO DOCUMENTO PARA VIDEOS GRANDES
                    await conn.sendMessage(m.chat, {
                        document: videoBuffer,
                        fileName: `${sanitizeFileName(videoMetadata.title.substring(0, 64))}.mp4`,
                        mimetype: 'video/mp4',
                        contextInfo: {
                            externalAdReply: {
                                title: videoMetadata.title.substring(0, 64),
                                body: `${videoMetadata.author} • Video de YouTube`,
                                thumbnailUrl: video.thumbnail,
                                sourceUrl: video.url,
                                mediaType: 2,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m });
                    
                } else {
                // ENVÍO NORMAL PARA VIDEOS PEQUEÑOS (CON FFMPEG) - CÓDIGO ORIGINAL
                const rawPath = join(tmpDir, `${id}_raw.mp4`);
                const fixedPath = join(tmpDir, `${id}_fixed.mp4`);

                writeFileSync(rawPath, videoBuffer);

                const stats = statSync(rawPath);
                if (stats.size === 0) throw new Error("Empty file");

                await new Promise((resolve, reject) => {
                    ffmpeg(rawPath)
                        .outputOptions([
                            '-c copy',
                            '-avoid_negative_ts make_zero',
                            '-fflags +genpts',
                            '-movflags +faststart',
                            '-map_metadata -1',
                            '-threads 0'
                        ])
                        .on('end', resolve)
                        .on('error', reject)
                        .save(fixedPath);
                });

                const fixedVideoBuffer = readFileSync(fixedPath);

                await conn.sendMessage(m.chat, { 
                    video: fixedVideoBuffer, 
                    caption: videoMetadata.title, 
                    mimetype: 'video/mp4', 
                    fileName: `${sanitizeFileName(videoMetadata.title)}.mp4` 
                }, { quoted: m });

                setTimeout(() => {
                    [rawPath, fixedPath].forEach(path => {
                        if (existsSync(path)) unlinkSync(path);
                    });
                }, 1000);

            } catch (videoError) {
                console.error('Video error:', videoError);
                await m.reply(tradutor.errors.generic.replace('@error', videoError.message));
            } finally {
                cleanupResources();
            }
        }

    } catch (e) {
        console.error(`Error in ${command}:`, e);
        await m.reply(tradutor.errors.generic.replace('@error', e.message));
    }
};

handler.help = ['test <query>', 'test2 <query>'];
handler.tags = ['downloader'];
handler.command = /^(test|test2|play|play2|ytmp3|ytmp4)$/i;
export default handler;

function isValidYouTubeUrl(url) {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)/i;
    return ytRegex.test(url) && extractVideoId(url);
}

async function getVideoInfoFromUrl(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('URL de YouTube no válida');
        const videoInfo = await yts({ videoId: videoId });
        
        if (!videoInfo || !videoInfo.title) {
            throw new Error('No se pudo obtener información del video');
        }
        return {
            videoId: videoId,
            url: `https://youtu.be/${videoId}`,
            title: videoInfo.title,
            author: {
                name: videoInfo.author.name
            },
            duration: {
                seconds: videoInfo.seconds,
                timestamp: videoInfo.timestamp
            },
            thumbnail: videoInfo.thumbnail,
            views: videoInfo.views,
            ago: videoInfo.ago
        };
        
    } catch (error) {
        console.error('Error en getVideoInfoFromUrl:', error);
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

async function getY2MetaLink(url, isAudio = false) {
    try {
        const formatId = isAudio ? "128kbps" : "720p";
        const result = await ytDownloader.convert(url, formatId);
        return result.link || result.url || result.downloadUrl;
    } catch (e) {
        console.error("Error en getY2MetaLink:", e);
        throw new Error("No se pudo obtener el enlace de descarga");
    }
}

function createYoutubeDownloader() {
    const defaultHeaders = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    };

    async function requestJson(description, url, headers, method = "get", body) {
        try {
            const response = await fetch(url, { headers, method, body });
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}\n${await response.text() || null}`);
            }
            return await response.json();
        } catch (err) {
            throw new Error(`fetch failed: ${description}\nbecause: ${err.message}`);
        }
    }

    async function search(query) {
        if (!query || typeof query !== "string") {
            throw new Error("Consulta inválida o vacía");
        }
        const headers = {
            ...defaultHeaders,
            "origin": "https://v2.www-y2mate.com",
            "referer": "https://v2.www-y2mate.com/"
        };
        const json = await requestJson(
            "search",
            `https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`,
            headers
        );
        return json;
    }

    async function getKey() {
        const headers = {
            "content-type": "application/json",
            "origin": "https://iframe.y2meta-uk.com",
            "referer": "https://iframe.y2meta-uk.com/",
            ...defaultHeaders
        };
        const json = await requestJson(
            "get sacred key",
            "https://api.mp3youtube.cc/v2/sanity/key",
            headers
        );
        return json;
    }

    function handleFormat(link, formatId) {
        const listFormat = ["128kbps", "320kbps", "144p", "240p", "360p", "720p", "1080p"];
        if (!link || !formatId) throw new Error("Faltan parámetros de formato");
        if (!listFormat.includes(formatId)) {
            throw new Error(`${formatId} no es un formato válido. Disponibles: ${listFormat.join(", ")}`);
        }
        const match = formatId.match(/(\d+)(\w+)/);
        const format = match[2] === "kbps" ? "mp3" : "mp4";
        return {
            link,
            format,
            audioBitrate: format === "mp3" ? match[1] : 128,
            videoQuality: format === "mp4" ? match[1] : 720,
            filenameStyle: "pretty",
            vCodec: "h264"
        };
    }

    async function convert(youtubeUrl, formatId) {
        const { key } = await getKey();
        const headers = {
            "content-type": "application/x-www-form-urlencoded",
            "Key": key,
            "origin": "https://iframe.y2meta-uk.com",
            "referer": "https://iframe.y2meta-uk.com/",
            ...defaultHeaders
        };

        const payload = handleFormat(youtubeUrl, formatId);
        const body = new URLSearchParams(payload);
        const json = await requestJson(
            "convert",
            "https://api.mp3youtube.cc/v2/converter",
            headers,
            "post",
            body
        );
        json.chosenFormat = formatId;
        return json;
    }
    return { search, getKey, convert, handleFormat };
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)([^&\n?#]+)/);
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
        }
    }
};
