// Helpers compartidos para descargar de YouTube. Los usan
// downloader-play.js (play/play2), @testting.js (ytmp3/ytmp4),
// search-yts.js (ytsearch) y downloader-playlist.js (playlist).
//
// Orden de descarga (audio y video):
// 1º convertytmp3, 2º OmDown, 3º ytultra, 4º ab-downloader (el de su web),
// 5º scraper de YouTube Music (ayashiiiyo, cliente VISIONOS para el player;
// acepta cookies de YouTube opcionales en ytmusic.txt junto a la librería).
//
// Por qué existe este archivo:
// - Los enlaces de googlevideo NO se pueden mandar directos a WhatsApp:
//   sin Range devuelven 403, y Baileys los descarga sin Range. Hay que
//   bajar el archivo en el bot y mandar el buffer.
// - googlevideo solo sirve trozos de 1 MB por petición y rechaza el rango
//   que cubre todo el archivo, así que la descarga es por trozos con
//   verificación de tamaño (nunca se manda un archivo incompleto).
// - El player solo da video SIN audio (formatos adaptativos), así que
//   play2 une el video (MP4/H.264) con el audio (AAC) con ffmpeg.
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { search as ayaSearch, getAudioStream as ayaAudio, getTrack as ayaTrack, getInnertubeConfig as ayaConfig } from './ytmusic-scraper.mjs';
import { ytmp3 as convertYtmp3 } from './ytmp3.js';
import { OmDownloader } from './omdown.js';
import abDownloader from 'ab-downloader';
const { youtube: abYoutube } = abDownloader;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CHUNK_SIZE = 1024 * 1024; // 1 MB: lo máximo que sirve googlevideo por petición
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export function bestThumb(thumbs = []) {
    return (thumbs[thumbs.length - 1] || thumbs[0] || {}).url || null;
}

// "4:27" -> 267 segundos.
function parseDuration(text) {
    if (!text || typeof text !== 'string') return 0;
    const parts = text.trim().split(':').map((n) => parseInt(n, 10));
    if (parts.some((n) => Number.isNaN(n))) return 0;
    return parts.reduce((acc, n) => acc * 60 + n, 0);
}

// "2.4B plays" / "1.2M views" / "345K" -> número.
function parsePlays(text) {
    if (!text || typeof text !== 'string') return 0;
    const m = text.replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
    if (!m) return 0;
    const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1;
    return Math.round(parseFloat(m[1]) * mult);
}

// Normaliza un resultado del scraper con todos los campos que usan los
// plugins (tarjeta de info, lista de playlist y búsqueda).
export function normalizeVideo(pick) {
    const artist = pick.artists?.[0];
    const seconds = parseDuration(pick.duration);
    return {
        videoId: pick.videoId,
        url: `https://music.youtube.com/watch?v=${pick.videoId}`,
        title: pick.title || '',
        type: pick.type || 'video',
        author: {
            name: artist?.name || 'YouTube Music',
            url: artist?.id?.startsWith('UC') ? `https://music.youtube.com/channel/${artist.id}` : '',
        },
        duration: { seconds, timestamp: pick.duration || '0:00' },
        timestamp: pick.duration || '0:00',
        thumbnail: pick.thumbnail || bestThumb(pick.thumbnails),
        views: parsePlays(pick.plays),
        ago: '',
    };
}

// Primer resultado de la búsqueda (canción para play, video para play2).
// Si el filtro no da resultados, se reintenta sin filtro.
export async function searchMusic(query, filter = 'songs') {
    for (const f of [filter, 'all']) {
        try {
            const res = await ayaSearch(query, { filter: f });
            const items = Array.isArray(res) ? res : [res?.topResult, ...(res?.songs ?? []), ...(res?.videos ?? [])];
            const pick = items.find((i) => i && (i.type === 'song' || i.type === 'video') && i.videoId) || null;
            if (pick) return normalizeVideo(pick);
        } catch (e) {
            console.log(`❌ Búsqueda YouTube Music (${f}) falló:`, e.message);
        }
    }
    return null;
}

// Lista de resultados de la búsqueda (hasta `limit`).
export async function searchMusicList(query, filter = 'videos', limit = 20) {
    for (const f of [filter, 'all']) {
        try {
            const res = await ayaSearch(query, { filter: f });
            const all = Array.isArray(res) ? res : [res?.topResult, ...(res?.songs ?? []), ...(res?.videos ?? [])];
            const items = all.filter((i) => i && (i.type === 'song' || i.type === 'video') && i.videoId);
            if (!items.length) continue;
            return items.slice(0, limit).map(normalizeVideo);
        } catch (e) {
            console.log(`❌ Búsqueda YouTube Music (${f}) falló:`, e.message);
        }
    }
    return [];
}

// Audio: se prefiere AAC (audio/mp4, itag 140), que WhatsApp reproduce como
// audio normal; si no hay, el mejor disponible (normalmente Opus).
export function pickAudioFormat(item) {
    const mp4 = (item?.audio ?? []).filter((f) => f.mimeType?.startsWith('audio/mp4')).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    return mp4[0] || item?.best || null;
}

// Video: se prefiere MP4 con H.264 (avc1) de 720p o menos, que WhatsApp
// reproduce; el mejor por bitrate suele ser AV1/WebM y no sirve. Son
// formatos SIN audio: el audio se une después con ffmpeg.
export function pickVideoFormat(item) {
    const mp4 = (item?.video ?? []).filter((f) => f.mimeType?.startsWith('video/mp4'));
    const avc = mp4.filter((f) => f.codecs?.includes('avc1'));
    const byBitrateDesc = (a, b) => (b.bitrate || 0) - (a.bitrate || 0);
    const hd = avc.filter((f) => (f.height || 0) <= 720).sort(byBitrateDesc);
    if (hd[0]) return hd[0];
    const anyAvc = avc.sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0));
    if (anyAvc[0]) return anyAvc[0];
    const anyMp4 = mp4.sort(byBitrateDesc);
    return anyMp4[0] || item?.bestVideo || null;
}

function chunkSize(total) {
    if (!total || total <= 0) return CHUNK_SIZE;
    if (total > CHUNK_SIZE) return CHUNK_SIZE;
    // Un solo trozo nunca puede ser todo el archivo (googlevideo lo rechaza).
    return Math.max(1, Math.ceil(total / 2));
}

// Descarga un enlace de googlevideo por trozos de 1 MB. Devuelve el Buffer
// completo. Lanza error si algún trozo falla o el tamaño final no coincide
// con el esperado: nunca se devuelve un archivo incompleto.
export async function downloadMedia(url, contentLength, maxBytes = MAX_AUDIO_BYTES) {
    const chunks = [];
    let downloaded = 0;
    let total = contentLength || 0;
    let size = chunkSize(total);
    let guard = 0;
    while (true) {
        if (++guard > 500) throw new Error('Descarga demasiado larga');
        const end = total ? Math.min(downloaded + size - 1, total - 1) : downloaded + size - 1;
        const res = await fetch(url, { headers: { Range: `bytes=${downloaded}-${end}`, 'User-Agent': UA } });
        if (res.status !== 206) throw new Error(`Descarga falló en el byte ${downloaded} (HTTP ${res.status})`);
        const range = res.headers.get('content-range') || '';
        const m = range.match(/\/(\d+)\s*$/);
        if (m) total = parseInt(m[1], 10);
        const buf = Buffer.from(await res.arrayBuffer());
        if (!buf.length) throw new Error('Descarga vacía');
        chunks.push(buf);
        downloaded += buf.length;
        if (downloaded > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
        if (total && downloaded >= total) break;
        if (!total) throw new Error('No se pudo determinar el tamaño del archivo');
        size = CHUNK_SIZE;
    }
    const out = Buffer.concat(chunks);
    if (total && out.length !== total) throw new Error(`Descarga incompleta: ${out.length}/${total} bytes`);
    return out;
}

// Igual que downloadMedia, pero escribe los trozos en un archivo en vez de
// juntarlos en memoria (para videos grandes antes de unirlos con ffmpeg).
export async function downloadMediaToFile(url, contentLength, filePath, maxBytes = MAX_VIDEO_BYTES) {
    const fd = fs.openSync(filePath, 'w');
    try {
        let downloaded = 0;
        let total = contentLength || 0;
        let size = chunkSize(total);
        let guard = 0;
        while (true) {
            if (++guard > 500) throw new Error('Descarga demasiado larga');
            const end = total ? Math.min(downloaded + size - 1, total - 1) : downloaded + size - 1;
            const res = await fetch(url, { headers: { Range: `bytes=${downloaded}-${end}`, 'User-Agent': UA } });
            if (res.status !== 206) throw new Error(`Descarga falló en el byte ${downloaded} (HTTP ${res.status})`);
            const range = res.headers.get('content-range') || '';
            const m = range.match(/\/(\d+)\s*$/);
            if (m) total = parseInt(m[1], 10);
            const buf = Buffer.from(await res.arrayBuffer());
            if (!buf.length) throw new Error('Descarga vacía');
            fs.writeSync(fd, buf);
            downloaded += buf.length;
            if (downloaded > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
            if (total && downloaded >= total) break;
            if (!total) throw new Error('No se pudo determinar el tamaño del archivo');
            size = CHUNK_SIZE;
        }
        if (total && downloaded !== total) throw new Error(`Descarga incompleta: ${downloaded}/${total} bytes`);
    } finally {
        fs.closeSync(fd);
    }
}

function runFfmpeg(args, timeoutMs = 180000) {
    return new Promise((resolve, reject) => {
        let stderr = '';
        let done = false;
        const ff = spawn('ffmpeg', args);
        const timer = setTimeout(() => {
            if (!done) { done = true; try { ff.kill(); } catch {} reject(new Error('ffmpeg tardó demasiado')); }
        }, timeoutMs);
        ff.stderr.on('data', (d) => { stderr += d.toString(); });
        ff.on('error', (err) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            reject(new Error(err.code === 'ENOENT' ? 'ffmpeg no disponible en el servidor' : `ffmpeg falló al arrancar: ${err.message}`));
        });
        ff.on('close', (code) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg falló (código ${code}): ${stderr.slice(-500)}`));
        });
    });
}

// Une el video (sin audio) con el audio (AAC) en un solo MP4 con ffmpeg
// (copia los streams, sin re-codificar). Devuelve el Buffer del video final.
export async function muxVideoAudio(videoUrl, videoLen, audioUrl, audioLen) {
    const dir = fs.mkdtempSync(path.join(process.cwd(), 'src', 'tmp', 'ytm-'));
    const videoPath = path.join(dir, 'video.mp4');
    const audioPath = path.join(dir, 'audio.m4a');
    const outPath = path.join(dir, 'out.mp4');
    try {
        await downloadMediaToFile(videoUrl, videoLen, videoPath);
        await downloadMediaToFile(audioUrl, audioLen, audioPath);
        await runFfmpeg(['-y', '-i', videoPath, '-i', audioPath, '-c', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-shortest', outPath]);
        const out = fs.readFileSync(outPath);
        if (!out.length) throw new Error('ffmpeg produjo un archivo vacío');
        return out;
    } finally {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
}

// OmDown (2ª opción): resuelve el video en omdown.site y baja el formato
// elegido con las cookies de la MISMA sesión (los enlaces van bloqueados
// a la sesión que los resolvió; con otra sesión dan 403).
function pickOmdownFormat(formats, want) {
    const hay = (f, re) => re.test(`${f.id || ''} ${f.label || ''} ${f.quality || ''} ${f.kind || ''} ${f.ext || ''}`);
    const ext = (f) => (f.ext || '').toLowerCase().replace(/^\./, '');
    if (want === 'audio') {
        return formats.find(f => f.kind === 'audio' && ext(f) === 'mp3')
            || formats.find(f => f.kind === 'audio')
            || formats.find(f => hay(f, /audio/i) && !hay(f, /video/i) && ext(f) === 'mp3')
            || formats.find(f => hay(f, /audio/i) && !hay(f, /video/i))
            || formats.find(f => /^(mp3|m4a|ogg|opus)$/.test(ext(f)))
            || formats[0];
    }
    return formats.find(f => hay(f, /audio_video|audio\+video/i) && ext(f) === 'mp4')
        || formats.find(f => hay(f, /audio_video|audio\+video/i))
        || formats.find(f => f.kind === 'video' && ext(f) === 'mp4' && hay(f, /720p|1080p|480p/i))
        || formats.find(f => f.kind === 'video' && ext(f) === 'mp4')
        || formats.find(f => f.kind === 'video')
        || formats.find(f => ext(f) === 'mp4')
        || formats[0];
}

function mimeForExt(ext, want) {
    const e = (ext || '').toLowerCase().replace(/^\./, '');
    if (want === 'audio') {
        if (e === 'm4a') return { mimeType: 'audio/mp4', ext: 'm4a' };
        if (e === 'ogg' || e === 'opus') return { mimeType: 'audio/ogg', ext: 'opus' };
        return { mimeType: 'audio/mpeg', ext: 'mp3' };
    }
    if (e === 'webm') return { mimeType: 'video/webm', ext: 'webm' };
    return { mimeType: 'video/mp4', ext: 'mp4' };
}

async function getMediaBufferViaOmdown(videoId, want) {
    const om = new OmDownloader();
    const url = `https://youtube.com/watch?v=${videoId}`;
    let info = await om.resolve(url, { platform: 'YouTube' });
    const usable = (inf) => (inf.formats || []).filter(f => typeof f.downloadUrl === 'string' && f.downloadUrl.startsWith('http'));
    let formats = usable(info);
    if (!formats.length) throw new Error('OmDown no devolvió formatos descargables');
    let fmt = pickOmdownFormat(formats, want);
    let buffer;
    try {
        buffer = await om.downloadBuffer(fmt.downloadUrl, { cookies: info.sessionCookies });
    } catch (e) {
        if (!/403/.test(e.message)) throw e;
        // Sesión bloqueada: re-resolver con sesión nueva y reintentar una vez.
        info = await om.resolve(url, { platform: 'YouTube' });
        formats = usable(info);
        fmt = formats.find(f => f.id === fmt.id) || formats[0];
        if (!fmt) throw e;
        buffer = await om.downloadBuffer(fmt.downloadUrl, { cookies: info.sessionCookies });
    }
    if (!buffer?.length) throw new Error('OmDown devolvió un archivo vacío');
    if (buffer.length > MAX_VIDEO_BYTES) throw new Error('Archivo demasiado grande');
    return { buffer, format: fmt };
}

// ytultra (3ª opción): API de ytultra.com que devuelve los enlaces de
// audio/video de YouTube. El audio es AAC itag 140 (.m4a) y el video
// 720p es MP4 sin audio (se une con ffmpeg); si hay itag 18 (360p con
// audio) se baja directo, sin ffmpeg.
const YTULTRA_URL = 'https://api.ytultra.com/ikool/youtube/download';
async function getMediaBufferViaYtultra(videoId, want) {
    const res = await fetch(YTULTRA_URL, {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0',
            Accept: '*/*',
            'Content-Type': 'application/json',
            Origin: 'https://www.ytultra.com',
            Referer: 'https://www.ytultra.com/',
        },
        body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
        signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`ytultra HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    const medias = (data?.data?.medias || []).filter(m => m.url && !m.locked);
    if (!medias.length) throw new Error('ytultra no devolvió enlaces');
    if (want === 'audio') {
        const audio = medias.find(m => (m.format || '').includes('.m4a'))
            || medias.find(m => /audio/i.test(m.format || ''));
        if (!audio?.url) throw new Error('ytultra no devolvió audio');
        const buffer = await downloadMedia(audio.url, audio.fileSize || 0);
        return { buffer, mimeType: 'audio/mp4', ext: 'm4a' };
    }
    const prog = medias.find(m => m.url.includes('itag=18'));
    if (prog) {
        const buffer = await downloadMedia(prog.url, prog.fileSize || 0);
        return { buffer, mimeType: 'video/mp4' };
    }
    const video = medias.find(m => /720p/.test(m.quality || '') && (m.format || '').includes('.mp4'))
        || medias.find(m => (m.format || '').includes('.mp4'));
    const audio = medias.find(m => (m.format || '').includes('.m4a'));
    if (!video?.url || !audio?.url) throw new Error('ytultra no devolvió video+audio');
    const buffer = await muxVideoAudio(video.url, video.fileSize || 0, audio.url, audio.fileSize || 0);
    return { buffer, mimeType: 'video/mp4' };
}

// Baja un archivo con un GET normal (para enlaces directos que no son
// googlevideo: el conversor y ab-downloader sirven el archivo completo).
async function downloadDirectFile(url, maxBytes = MAX_VIDEO_BYTES) {
    const res = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(600000),
    });
    if (!res.ok) throw new Error(`Descarga directa falló (HTTP ${res.status})`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!buffer.length) throw new Error('Descarga directa vacía');
    if (buffer.length > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
    return buffer;
}

// ab-downloader (4ª opción): el paquete que usa su web (Arq_Carlos_Sobrino).
// Su API devuelve los enlaces MP3/MP4 ya listos en su propio CDN.
async function getMediaBufferViaAbDownloader(videoId, want) {
    const data = await abYoutube(`https://www.youtube.com/watch?v=${videoId}`);
    if (!data || data.status === false) throw new Error(data?.message || 'ab-downloader sin resultado');
    if (want === 'audio') {
        if (!data.mp3) throw new Error('ab-downloader sin enlace de audio');
        const buffer = await downloadDirectFile(data.mp3, MAX_AUDIO_BYTES);
        return { buffer, mimeType: 'audio/mpeg', ext: 'mp3' };
    }
    if (!data.mp4) throw new Error('ab-downloader sin enlace de video');
    const buffer = await downloadDirectFile(data.mp4, MAX_VIDEO_BYTES);
    return { buffer, mimeType: 'video/mp4' };
}

// Baja el archivo que devuelve el conversor (enlace directo de su CDN).
async function downloadConverterFile(url, maxBytes = MAX_VIDEO_BYTES) {
    const res = await fetch(url, {
        headers: { 'User-Agent': UA, Referer: 'https://convertytmp3.org/' },
        signal: AbortSignal.timeout(600000),
    });
    if (!res.ok) throw new Error(`Descarga del conversor falló (HTTP ${res.status})`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (!buffer.length) throw new Error('Descarga del conversor vacía');
    if (buffer.length > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
    return buffer;
}

function extOf(mimeType) {
    const mime = (mimeType || '').split(';')[0].trim();
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('opus') || mime.includes('ogg') || mime.includes('webm')) return 'opus';
    return 'mp3';
}

// Info de un video por su ID (para enlaces directos de YouTube).
export async function getVideoInfo(videoId) {
    const track = await ayaTrack(videoId);
    if (!track || !track.title) throw new Error('No se pudo obtener información del video');
    return {
        videoId,
        url: `https://youtu.be/${videoId}`,
        title: track.title,
        author: { name: track.author || 'YouTube Music' },
        duration: { seconds: track.durationSeconds || 0, timestamp: track.duration || '0:00' },
        thumbnail: track.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: 0,
        ago: '',
    };
}

// Formatos de video del player con el cliente VISIONOS (el mismo que usa
// el scraper de ayashiiiyo para el audio). Devuelve { video, audio } con
// los formatos elegidos para unir con ffmpeg.
async function getVisionOSFormats(videoId) {
    const cfg = await ayaConfig();
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
            ...(cfg.cookieHeader ? { Cookie: cfg.cookieHeader } : {}),
        },
        body: JSON.stringify({
            context: { client: { clientName: 'VISIONOS', clientVersion: '1.02', deviceMake: 'Apple', deviceModel: 'RealityDevice17,1', osName: 'visionOS', osVersion: '26.5.23O471', visitorData: cfg.visitorData, hl: 'en', gl: 'US' } },
            videoId,
        }),
    });
    if (!res.ok) throw new Error(`YouTube Music player HTTP ${res.status}`);
    const data = await res.json();
    if (data.playabilityStatus?.status !== 'OK') throw new Error(`Video no reproducible: ${data.playabilityStatus?.status || '?'}`);
    const formats = data.streamingData?.adaptiveFormats || [];
    if (!formats.length) throw new Error('Sin formatos de video');
    const item = {
        video: formats.filter((f) => (f.mimeType || '').startsWith('video/')),
        audio: formats.filter((f) => (f.mimeType || '').startsWith('audio/')),
    };
    item.best = item.audio.find((f) => f.itag === 140) || item.audio[0] || null;
    const video = pickVideoFormat(item);
    const audioFormat = pickAudioFormat(item);
    if (!video?.url) throw new Error('Sin enlace de video');
    if (!audioFormat?.url) throw new Error('Sin enlace de audio para el video');
    return { video, audio: audioFormat };
}

// Audio listo para mandar. 1º convertytmp3 (MP3 ya convertido), 2º OmDown,
// 3º ytultra (AAC itag 140), 4º ab-downloader (MP3 de su CDN), 5º scraper
// de YouTube Music (enlace AAC). Devuelve { buffer, mimeType, ext }.
export async function getAudioBuffer(videoId) {
    try {
        const info = await convertYtmp3(`https://youtube.com/watch?v=${videoId}`, 'mp3');
        if (info?.download) {
            const buffer = await downloadConverterFile(info.download, MAX_AUDIO_BYTES);
            return { buffer, mimeType: 'audio/mpeg', ext: 'mp3' };
        }
    } catch (e) {
        console.log('❌ Conversor mp3 falló, intentando OmDown...', e.message);
    }
    try {
        const { buffer, format } = await getMediaBufferViaOmdown(videoId, 'audio');
        const { mimeType, ext } = mimeForExt(format.ext, 'audio');
        return { buffer, mimeType, ext };
    } catch (e) {
        console.log('❌ OmDown audio falló, intentando ytultra...', e.message);
    }
    try {
        const { buffer, mimeType, ext } = await getMediaBufferViaYtultra(videoId, 'audio');
        return { buffer, mimeType, ext };
    } catch (e) {
        console.log('❌ ytultra audio falló, intentando ab-downloader...', e.message);
    }
    try {
        const { buffer, mimeType, ext } = await getMediaBufferViaAbDownloader(videoId, 'audio');
        return { buffer, mimeType, ext };
    } catch (e) {
        console.log('❌ ab-downloader audio falló, intentando YouTube Music...', e.message);
    }
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const stream = await ayaAudio(videoId);
            if (!stream?.url) throw new Error('Sin enlace de audio');
            // El enlace trae &range=0-(total-1) (todo el archivo): googlevideo
            // lo rechaza, así que se quita y se baja por trozos.
            const cleanUrl = stream.url.replace(/&range=\d+-\d+/, '');
            const mimeType = (stream.mimeType || 'audio/mpeg').split(';')[0].trim();
            const buffer = await downloadMedia(cleanUrl, stream.contentLength, MAX_AUDIO_BYTES);
            return { buffer, mimeType, ext: extOf(stream.mimeType) };
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('Sin enlace de audio');
}

// Video listo para mandar. 1º convertytmp3 (MP4 ya unido), 2º OmDown,
// 3º ytultra (itag 18 directo o 720p + audio con ffmpeg), 4º ab-downloader
// (MP4 de su CDN), 5º scraper de YouTube Music (video + audio con ffmpeg).
// Devuelve { buffer, mimeType }.
export async function getVideoBuffer(videoId) {
    try {
        const info = await convertYtmp3(`https://youtube.com/watch?v=${videoId}`, 'mp4');
        if (info?.download) {
            const buffer = await downloadConverterFile(info.download, MAX_VIDEO_BYTES);
            return { buffer, mimeType: 'video/mp4' };
        }
    } catch (e) {
        console.log('❌ Conversor mp4 falló, intentando OmDown...', e.message);
    }
    try {
        const { buffer, format } = await getMediaBufferViaOmdown(videoId, 'video');
        const { mimeType } = mimeForExt(format.ext, 'video');
        return { buffer, mimeType };
    } catch (e) {
        console.log('❌ OmDown video falló, intentando ytultra...', e.message);
    }
    try {
        const { buffer, mimeType } = await getMediaBufferViaYtultra(videoId, 'video');
        return { buffer, mimeType };
    } catch (e) {
        console.log('❌ ytultra video falló, intentando ab-downloader...', e.message);
    }
    try {
        const { buffer, mimeType } = await getMediaBufferViaAbDownloader(videoId, 'video');
        return { buffer, mimeType };
    } catch (e) {
        console.log('❌ ab-downloader video falló, intentando YouTube Music...', e.message);
    }
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const { video, audio } = await getVisionOSFormats(videoId);
            const buffer = await muxVideoAudio(video.url, video.contentLength, audio.url, audio.contentLength);
            return { buffer, mimeType: 'video/mp4' };
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('Sin enlace de video');
}
