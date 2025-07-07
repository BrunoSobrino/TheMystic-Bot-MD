// Plugin para test de comandos - powered by @BrunoSobrino
import yts from 'yt-search';
import { Innertube, UniversalCache, Utils } from "youtubei.js";
import axios from 'axios';
import { ID3Writer } from 'browser-id3-writer';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    const datas = global;
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins.descargas_play;

    if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;
      
    let additionalText = '';
    if (['test1'].includes(command)) {
        additionalText = 'audio';
    } else if (['test2'].includes(command)) {
        additionalText = 'vídeo';
    }

    const yt_play = await search(args.join(' '));
    if (!yt_play || yt_play.length === 0) throw tradutor.texto6;

    const videoInfo = yt_play[0];
    const texto1 = `${tradutor.texto2[0]} ${videoInfo.title}\n` +
                  `${tradutor.texto2[1]} ${videoInfo.ago}\n` +
                  `${tradutor.texto2[2]} ${videoInfo.duration.timestamp}\n` +
                  `${tradutor.texto2[3]} ${videoInfo.views}\n` +
                  `${tradutor.texto2[4]} ${videoInfo.author.name}\n` +
                  `${tradutor.texto2[5]} ${videoInfo.videoId}\n` +
                  `${tradutor.texto2[6]} ${videoInfo.type}\n` +
                  `${tradutor.texto2[7]} ${videoInfo.url}\n` +
                  `${tradutor.texto2[8]} ${videoInfo.author.url}\n\n` +
                  `${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();

    conn.sendMessage(m.chat, { image: { url: videoInfo.thumbnail }, caption: texto1 }, { quoted: m });

    try {
        const result = await downloadYT(videoInfo.url);
        if (result.error) throw new Error(result.message);

        if (command === 'test1') {
            conn.sendMessage(m.chat, { audio: result.data.audio.buffer, mimetype: 'audio/mpeg', fileName: `${videoInfo.title}.mp3` }, { quoted: m });
        } else if (command === 'test2') {
            conn.sendMessage(m.chat, { video: result.data.video.buffer, mimetype: 'video/mp4', fileName: `${videoInfo.title}.mp4` }, { quoted: m });
        }
    } catch (error) {
        console.error(error);
    }
};
handler.help = ['test1', 'test2'];
handler.tags = ['testing'];
handler.command = ['test1', 'test2'];
export default handler;

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
    return search.videos;
}

const VALID_QUERY_DOMAINS = new Set(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','gaming.youtube.com']);
const VALID_PATH_DOMAINS = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

const getURLVideoID = (link) => {
    try {
        if (!link || typeof link !== 'string') throw new Error('Invalid URL provided');
        const parsed = new URL(link.trim());
        let id = parsed.searchParams.get('v');
        if (VALID_PATH_DOMAINS.test(link.trim()) && !id) {
            const paths = parsed.pathname.split('/');
            id = parsed.hostname === 'youtu.be' ? paths[1] : paths[2];
        } else if (parsed.hostname && !VALID_QUERY_DOMAINS.has(parsed.hostname)) {
            throw new Error('Not a YouTube domain');
        }
        if (!id) throw new Error(`No video id found: "${link}"`);
        id = id.substring(0, 11);
        if (!/^[\w-]{11}$/.test(id)) throw new Error('Invalid video ID format');
        return id;
    } catch (error) {
        console.error('URL parsing error:', error);
        throw error;
    }
};

const getDownloadUrls = async (videoId, quality = 'best') => {
    const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
    const info = await yt.getInfo(videoId);
    const audioStream = info.chooseFormat({ type: 'audio', quality: 'best' });
    const videoStream = info.chooseFormat({ type: 'video+audio', quality: quality });
    return {
        audioUrl: audioStream.decipher(yt.session.player),
        videoUrl: videoStream.decipher(yt.session.player),
        audioMeta: {
            mimetype: audioStream.mime_type,
            bitrate: audioStream.bitrate
        },
        videoMeta: {
            mimetype: videoStream.mime_type,
            quality: videoStream.quality_label,
            fps: videoStream.fps
        }
    };
};

const getImageBuffer = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: TIMEOUT });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error getting image buffer:', error);
        return null;
    }
};

const addAudioMetadata = async (audioBuffer, videoInfo) => {
    try {
        const writer = new ID3Writer(audioBuffer);
        const thumbnail = await getImageBuffer(videoInfo.thumbnail);
        writer
            .setFrame("TIT2", videoInfo.title)
            .setFrame("TPE1", [videoInfo.author])
            .setFrame("TALB", "YouTube Download")
            .setFrame("TCON", ["YouTube"])
            .setFrame("TYER", new Date(videoInfo.uploadDate).getFullYear().toString())
            .setFrame("APIC", {
                type: 3,
                data: thumbnail || Buffer.from(''),
                description: `Descarga de ${videoInfo.url}`,
            });
        writer.addTag();
        return Buffer.from(writer.arrayBuffer);
    } catch (error) {
        console.error('Error adding audio metadata:', error);
        return audioBuffer; 
    }
};

async function downloadYT(input) {
    try {
        const isURL = input.startsWith('http://') || input.startsWith('https://');
        if (!isURL) {
            const results = await yts(input);
            const videos = results.all
                .filter(result => result.type === 'video')
                .map(video => ({
                    title: video.title,
                    url: video.url,
                    duration: video.duration,
                    thumbnail: video.thumbnail,
                    views: video.views,
                    author: video.author.name,
                    videoId: video.videoId
                }))
                .slice(0, 10); 
            return { type: 'search_results', data: videos };
        }
        const videoId = getURLVideoID(input);
        const videoInfo = await yts({ videoId });
        const baseInfo = {
            title: videoInfo.title,
            description: videoInfo.description,
            duration: videoInfo.seconds,
            uploadDate: videoInfo.uploaddate,
            views: videoInfo.views,
            thumbnail: videoInfo.thumbnail,
            author: videoInfo.author.name,
            url: `https://youtu.be/${videoId}`,
            videoId
        };
        const qualityLevels = ['best', 'high', 'medium', 'low'];
        let lastError = null;
        for (const quality of qualityLevels) {
            try {
                const { audioUrl, videoUrl, audioMeta, videoMeta } = await getDownloadUrls(videoId, quality);
                const [audioResponse, videoResponse] = await Promise.all([ axios.get(audioUrl, { responseType: 'arraybuffer', timeout: TIMEOUT }), axios.get(videoUrl, { responseType: 'arraybuffer', timeout: TIMEOUT }) ]);
                let audioBuffer = Buffer.from(audioResponse.data);
                let videoBuffer = Buffer.from(videoResponse.data);
                audioBuffer = await addAudioMetadata(audioBuffer, baseInfo);
                return {
                    type: 'download',
                    info: baseInfo,
                    data: {
                        video: {
                            buffer: videoBuffer,
                            downloadUrl: videoUrl,
                            mimetype: videoMeta.mimetype,
                            size: videoBuffer.length,
                            quality: videoMeta.quality,
                            fps: videoMeta.fps,
                            metadata: {
                                title: baseInfo.title,
                                author: baseInfo.author,
                                duration: baseInfo.duration,
                                quality: videoMeta.quality
                            }
                        },
                        audio: {
                            buffer: audioBuffer,
                            downloadUrl: audioUrl,
                            mimetype: audioMeta.mimetype,
                            size: audioBuffer.length,
                            bitrate: audioMeta.bitrate,
                            metadata: {
                                title: baseInfo.title,
                                author: baseInfo.author,
                                duration: baseInfo.duration,
                                album: "YouTube Download",
                                year: new Date(baseInfo.uploadDate).getFullYear(),
                                cover: baseInfo.thumbnail
                            }
                        }
                    }
                };
            } catch (error) {
                lastError = error;
                console.warn(`Failed with quality ${quality}, trying next...`, error.message);
                continue;
            }
        }
        throw lastError || new Error('All download attempts failed');
    } catch (error) {
        console.error('YouTube download error:', error);
        return {
            error: true,
            message: error.message.includes('size limit') ? 'El video es demasiado grande (límite 100MB)' : 
                   error.message.includes('stream') ? 'Error al procesar el video' : 
                   'Error al descargar el video',
            details: error.message
        };
    }
}
