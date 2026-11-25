// Helpers compartidos para descargar de YouTube con el scraper de YouTube
// Music (InnerTube) de src/libraries/scrape-YoutubeMusik.js. Los usan
// downloader-play.js (play/play2), @testting.js (ytmp3/ytmp4),
// search-yts.js (ytsearch) y downloader-playlist.js (playlist).
//
// Por qué existe este archivo:
// - La búsqueda y los enlaces directos vienen del scraper (API InnerTube,
//   cliente iOS), que es lo único que sigue funcionando: yt-search, notube
//   (ytmp33/44), ssvid y Ruby-core están caídos.
// - Los enlaces de googlevideo NO se pueden mandar directos a WhatsApp:
//   sin Range devuelven 403, y Baileys los descarga sin Range. Hay que
//   bajar el archivo en el bot y mandar el buffer.
// - googlevideo solo sirve trozos de 1 MB por petición y rechaza el rango
//   que cubre todo el archivo, así que la descarga es por trozos con
//   verificación de tamaño (nunca se manda un archivo incompleto).
// - El cliente iOS solo da video SIN audio (formatos adaptativos), así que
//   play2 une el video (MP4/H.264) con el audio (AAC) con ffmpeg.
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { search as ytMusicSearch, audio as ytMusicAudio, stream as ytMusicStream } from './scrape-YoutubeMusik.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CHUNK_SIZE = 1024 * 1024; // 1 MB: lo máximo que sirve googlevideo por petición
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export function bestThumb(thumbs = []) {
    return (thumbs[thumbs.length - 1] || thumbs[0] || {}).url || null;
}

// Normaliza un resultado del scraper con todos los campos que usan los
// plugins (tarjeta de info, lista de playlist y búsqueda).
export function normalizeVideo(pick) {
    const artist = pick.artists?.[0];
    return {
        videoId: pick.id,
        url: pick.url,
        title: pick.title || '',
        type: pick.type || 'video',
        author: {
            name: artist?.name || 'YouTube Music',
            url: artist?.id?.startsWith('UC') ? `https://music.youtube.com/channel/${artist.id}` : '',
        },
        duration: { seconds: pick.durationSeconds || 0, timestamp: pick.duration || '0:00' },
        timestamp: pick.duration || '0:00',
        thumbnail: bestThumb(pick.thumbnails),
        views: pick.plays || 0,
        ago: pick.year ? String(pick.year) : '?',
    };
}

function pickCandidate(data) {
    const candidates = [data?.topResult, ...(data?.results ?? [])];
    return candidates.find((i) => i && (i.type === 'song' || i.type === 'video') && i.id) || null;
}

// Primer resultado de la búsqueda (canción para play, video para play2).
// Si el filtro no da resultados, se reintenta sin filtro.
export async function searchMusic(query, filter = 'songs') {
    for (const f of [filter, 'all']) {
        try {
            const [meta, res] = await ytMusicSearch(query, f);
            if (meta.status !== 200) continue;
            const pick = pickCandidate(res?.data?.[0]);
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
            const [meta, res] = await ytMusicSearch(query, f);
            if (meta.status !== 200) continue;
            const data = res?.data?.[0];
            const items = (data?.results ?? []).filter((i) => i && (i.type === 'song' || i.type === 'video') && i.id);
            const top = data?.topResult;
            if (top && (top.type === 'song' || top.type === 'video') && top.id) items.unshift(top);
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

function extOf(mimeType) {
    const mime = (mimeType || '').split(';')[0].trim();
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('opus') || mime.includes('ogg') || mime.includes('webm')) return 'opus';
    return 'mp3';
}

// Info de un video por su ID (para enlaces directos de YouTube).
export async function getVideoInfo(videoId) {
    const [meta, res] = await ytMusicStream(videoId);
    if (meta.status !== 200) throw new Error('No se pudo obtener información del video');
    const info = res?.data?.[0];
    if (!info || !info.title) throw new Error('No se pudo obtener información del video');
    return {
        videoId,
        url: `https://youtu.be/${videoId}`,
        title: info.title,
        author: { name: info.author || 'YouTube Music' },
        duration: { seconds: info.durationSeconds || 0, timestamp: info.duration || '0:00' },
        thumbnail: bestThumb(info.thumbnails) || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: info.views || 0,
        ago: '',
    };
}

// Audio listo para mandar: descarga el mejor formato con reintento (la API
// a veces falla de forma transitoria). Devuelve { buffer, mimeType, ext }.
export async function getAudioBuffer(videoId) {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const [meta, res] = await ytMusicAudio(videoId);
            if (meta.status !== 200) throw new Error(meta.error || `YouTube Music ${meta.status}`);
            const format = pickAudioFormat(res?.data?.[0]);
            if (!format?.url) throw new Error('Sin enlace de audio');
            const mimeType = (format.mimeType || 'audio/mpeg').split(';')[0].trim();
            const buffer = await downloadMedia(format.url, format.contentLength, MAX_AUDIO_BYTES);
            return { buffer, mimeType, ext: extOf(format.mimeType) };
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('Sin enlace de audio');
}

// Video listo para mandar: descarga video + audio y los une con ffmpeg.
// Devuelve { buffer, mimeType }.
export async function getVideoBuffer(videoId) {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const [meta, res] = await ytMusicStream(videoId);
            if (meta.status !== 200) throw new Error(meta.error || `YouTube Music ${meta.status}`);
            const item = res?.data?.[0];
            const video = pickVideoFormat(item);
            const audioFormat = pickAudioFormat(item);
            if (!video?.url) throw new Error('Sin enlace de video');
            if (!audioFormat?.url) throw new Error('Sin enlace de audio para el video');
            const buffer = await muxVideoAudio(video.url, video.contentLength, audioFormat.url, audioFormat.contentLength);
            return { buffer, mimeType: 'video/mp4' };
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('Sin enlace de video');
}
