// Plugin para test de comandos - powered by @BrunoSobrino
// Si vas a robar deja creditos o doname >:v
import yts from 'yt-search';
import { existsSync, mkdirSync, writeFileSync, statSync, unlinkSync, createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import axios from 'axios';
import NodeID3 from 'node-id3';
import { load } from 'cheerio';
const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import("baileys")).default;

const tmpDir = join(process.cwd(), './src/tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

let handler = async (m, { conn, args, usedPrefix, command }) => {
        const idioma = global?.db?.data?.users[m.sender]?.language || global.defaultLenguaje;
        const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}/${m.plugin}.json`));
        const tradutor = _translate._testting;
        
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
        const format = isAudio ? 'mp3' : '720p';

        const downloadResult = await yt.download(video.url, format);
        
        if (!downloadResult || !downloadResult.dlink) throw new Error('No se pudo obtener el enlace de descarga');

        const mediaUrl = downloadResult.dlink;
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
                        text: `🟢 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 🟢\n\nVideo De YouTube: ${video.url}`
                    }
                };

                if (formattedLyrics) {
                    tags.unsynchronisedLyrics = {
                        language: 'spa',
                        text: `🟢 ᴅᴇsᴄᴀʀɢᴀ ᴘᴏʀ @ʙʀᴜɴᴏsᴏʙʀɪɴᴏ 🟢\n\nTitulo: ${video.title}\n\n${formattedLyrics}`
                    };
                }

                const taggedBuffer = NodeID3.write(tags, audioBuffer);

                if (shouldSendAsDocument) {
                    await conn.sendMessage(m.chat, { document: taggedBuffer, fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, { audio: taggedBuffer, fileName: `${sanitizeFileName(video.title)}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
                }

            } catch (audioError) {
                console.error('Audio error:', audioError);
                await m.reply(tradutor.errors.generic.replace('@error', audioError.message));
            }

        } else {
            try {
                const videoBuffer = await fetch(mediaUrl).then(res => res.buffer());
                const videoSize = videoBuffer.length;
                const shouldSendAsDocument = videoSize > VIDEO_SIZE_LIMIT;

                if (shouldSendAsDocument) {
                    const sizeMB = (videoSize / (1024 * 1024)).toFixed(2);
                    await m.reply(tradutor.errors.large_video.replace('@size', sizeMB));
                    
                    await conn.sendMessage(m.chat, { document: videoBuffer, fileName: `${sanitizeFileName(video.title.substring(0, 64))}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
                    
                } else {
                    await conn.sendMessage(m.chat, { video: videoBuffer, caption: video.title, mimetype: 'video/mp4', fileName: `${sanitizeFileName(video.title)}.mp4` }, { quoted: m });
                }

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

const yt = {
    get baseUrl() {
        return {
            origin: 'https://ssvid.net'
        }
    },

    get baseHeaders() {
        return {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': this.baseUrl.origin,
            'referer': this.baseUrl.origin + '/youtube-to-mp3'
        }
    },

    validateFormat: function (userFormat) {
        const validFormat = ['mp3', '360p', '720p', '1080p']
        if (!validFormat.includes(userFormat)) throw Error(`invalid format!. available formats: ${validFormat.join(', ')}`)
    },

    handleFormat: function (userFormat, searchJson) {
        this.validateFormat(userFormat)
        let result
        if (userFormat == 'mp3') {
            result = searchJson.links?.mp3?.mp3128?.k
        } else {
            let selectedFormat
            const allFormats = Object.entries(searchJson.links.mp4)

            const quality = allFormats.map(v => v[1].q).filter(v => /\d+p/.test(v)).map(v => parseInt(v)).sort((a, b) => b - a).map(v => v + 'p')
            if (!quality.includes(userFormat)) {
                selectedFormat = quality[0]
                console.log(`format ${userFormat} gak ada. auto fallback ke best available yaitu ${selectedFormat}`)
            } else {
                selectedFormat = userFormat
            }
            const find = allFormats.find(v => v[1].q == selectedFormat)
            result = find?.[1]?.k
        }
        if (!result) throw Error(`${userFormat} gak ada cuy. aneh`)
        return result
    },

    hit: async function (path, payload) {
        try {
            const body = new URLSearchParams(payload)
            const opts = { headers: this.baseHeaders, body, 'method': 'post' }
            const r = await fetch(`${this.baseUrl.origin}${path}`, opts)
            console.log('hit', path)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
            const j = await r.json()
            return j
        } catch (e) {
            throw Error(`${path}\n${e.message}`)
        }
    },

    download: async function (queryOrYtUrl, userFormat = 'mp3') {
        this.validateFormat(userFormat)

        search = await this.hit('/api/ajax/search', {
            "query": queryOrYtUrl,
            "cf_token": "",
            "vt": "youtube"
        })

        if (search.p == 'search') {
            if (!search?.items?.length) throw Error(`resultado de búsqueda ${queryOrYtUrl} no encontrado`)
            const { v, t } = search.items[0]
            const videoUrl = 'https://www.youtube.com/watch?v=' + v
            console.log(`[found]\ntitle : ${t}\nurl   : ${videoUrl}`)

            search = await this.hit('/api/ajax/search', {
                "query": videoUrl,
                "cf_token": "",
                "vt": "youtube"
            })
        }

        const vid = search.vid
        const k = this.handleFormat(userFormat, search)

        const convert = await this.hit('/api/ajax/convert', {
            k, vid
        })

        if (convert.c_status == 'CONVERTING') {
            let convert2
            const limit = 5
            let attempt = 0
            do {
                attempt++
                console.log(`cek convert ${attempt}/${limit}`)
                convert2 = await this.hit('/api/convert/check?hl=en', {
                    vid,
                    b_id: convert.b_id
                })
                if (convert2.c_status == 'CONVERTED') {
                    return convert2
                }
                await new Promise(re => setTimeout(re, 5000))
            } while (attempt < limit && convert2.c_status == 'CONVERTING')
            throw Error('file belum siap / status belum di ketahui')

        } else {
            return convert
        }
    },
}

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
