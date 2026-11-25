// Helpers compartidos para descargar de YouTube. Los usan
// downloader-play.js (play/play2), downloader-ytplay.js (ytplay),
// downloader-yta.js (ytmp3), downloader-ytv.js (ytmp4), @testting.js,
// search-yts.js (ytsearch) y downloader-playlist.js (playlist).
//
// Descarga: 1º ab-downloader (el de su web, MP3/MP4 listos en su
// CDN, que se bajan con un GET normal), 2º youtube-dl-exec (yt-dlp,
// baja directo de YouTube) y 3º @distube/ytdl-core (también directo
// de YouTube, con las cookies de src/libraries/ytmusic.txt). Si una
// opción falla, se pasa a la siguiente. Sin sesión, YouTube puede
// bloquear la IP del panel y no devolver ni los formatos (por eso
// yt-dlp y ytdl-core usan las cookies cuando existen). La búsqueda
// sigue por el scraper
// de YouTube Music (ayashiiiyo): searchMusic / searchMusicList y
// getVideoInfo (para enlaces directos).
//
// El MP4 de ab-downloader es fragmentado (fMP4), así que se
// reempaqueta con ffmpeg (+faststart) para que WhatsApp pueda
// buscar (adelantar/retroceder) y muestre la duración. El video
// de ytdl-core se arma uniendo video + audio con ffmpeg (YouTube
// ya no sirve formatos combinados en la mayoría de videos) y ya
// sale con +faststart. Los audios MP3 llevan metadatos ID3
// (tagAudioMp3); el audio de ytdl-core es AAC/WebM y no se etiqueta.
import fs from 'fs';
import os from 'node:os';
import path from 'path';
import { spawn } from 'child_process';
import { search as ayaSearch, getTrack as ayaTrack, parseCookies } from './ytmusic-scraper.mjs';
import abDownloader from 'ab-downloader';
import NodeID3 from 'node-id3';
import { Ytdl, Quality, chooseFormat } from '@distube/ytdl-core';
import youtubedl from 'youtube-dl-exec';
const { youtube: abYoutube } = abDownloader;
// Cookies de YouTube opcionales (mismo archivo que usa el scraper de
// búsqueda: src/libraries/ytmusic.txt, con la sesión de YouTube del
// dueño, en formato cabecera o exportación Netscape). Sin cookies,
// YouTube puede marcar la IP del panel como bot y ytdl-core falla
// (PLAYER_SOLVE_FAILED / visitor data request failed) aunque la
// librería esté al día. Con la sesión puesta, YouTube lo trata como
// un usuario real. El archivo NO se sube al repo (ver .gitignore).
const YT_COOKIE = parseCookies() || '';
const YT_COOKIE_PATH = new URL('ytmusic.txt', import.meta.url).pathname;
// yt-dlp acepta las cookies como archivo Netscape (--cookies) o como
// cabecera (--add-header). Se detecta el formato del archivo.
const YT_COOKIE_IS_NETSCAPE = (() => {
    try {
        return fs.readFileSync(YT_COOKIE_PATH, 'utf8').split('\n').some((line) => line.split('\t').length >= 7);
    } catch { return false; }
})();
function ytDlpCookieFlags() {
    if (!YT_COOKIE) return {};
    if (YT_COOKIE_IS_NETSCAPE) return { cookies: YT_COOKIE_PATH };
    return { addHeader: [`Cookie: ${YT_COOKIE}`] };
}
// La sesión debe traer SAPISID o __Secure-3PAPISID; si la cookie
// está incompleta, el constructor de Ytdl lanza y rompería todo el
// módulo, así que se atrapa y se sigue sin sesión.
let yt;
try {
    yt = new Ytdl(YT_COOKIE ? { cookie: YT_COOKIE } : {});
} catch (e) {
    console.log('⚠️ Cookies de YouTube inválidas en ytmusic.txt, ytdl-core sin sesión:', e.message);
    yt = new Ytdl();
}

// Busca la info del video con reintento: 2 intentos con la sesión
// (si hay) y, si la cookie está caducada, 1 último sin ella.
async function lookupYtdlInfo(url) {
    const attempts = YT_COOKIE ? [[yt, 2], [new Ytdl(), 1]] : [[yt, 2]];
    let lastErr;
    for (const [inst, n] of attempts) {
        for (let i = 0; i < n; i++) {
            try {
                return { info: await inst.getInfo(url), yt: inst };
            } catch (e) {
                lastErr = e;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
    }
    throw lastErr;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
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

// Baja un archivo con un GET normal (ab-downloader sirve el archivo
// completo en su propio CDN, no es googlevideo).
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

// ab-downloader (única opción de descarga): el paquete que usa su
// web (Arq_Carlos_Sobrino). Su API devuelve los enlaces MP3/MP4 ya
// listos en su propio CDN.
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

// Lee un stream de ytdl-core a Buffer, con tope de tamaño y de tiempo.
async function streamToBuffer(stream, maxBytes, label) {
    const chunks = [];
    let total = 0;
    const timer = setTimeout(() => stream.destroy(new Error('Descarga ytdl-core agotó el tiempo')), 180000);
    try {
        for await (const chunk of stream) {
            total += chunk.length;
            if (total > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
            chunks.push(chunk);
        }
    } finally {
        clearTimeout(timer);
    }
    const buffer = Buffer.concat(chunks);
    if (!buffer.length) throw new Error(`Descarga vacía (ytdl-core, ${label})`);
    return buffer;
}

// Une video + audio con ffmpeg (sin re-codificar) y deja el MP4 con
// +faststart para que WhatsApp pueda buscar. Si ffmpeg no está o
// falla, se lanza el error (no hay video usable sin unir).
async function muxVideoAudio(videoBuffer, audioBuffer, audioExt = 'm4a') {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mux-'));
    const inVideo = path.join(dir, 'video.mp4');
    const inAudio = path.join(dir, 'audio.' + audioExt);
    const outFile = path.join(dir, 'out.mp4');
    try {
        fs.writeFileSync(inVideo, videoBuffer);
        fs.writeFileSync(inAudio, audioBuffer);
        await new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', ['-y', '-i', inVideo, '-i', inAudio, '-c', 'copy', '-movflags', '+faststart', outFile], { stdio: 'ignore', timeout: 120000 });
            ff.on('error', reject);
            ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg ' + code))));
        });
        return fs.readFileSync(outFile);
    } finally {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
}

// ytdl-core (2ª opción de descarga): baja directo de YouTube.
// Audio: el mejor solo-audio. Video: el mejor solo-video MP4 hasta
// 720p + el mejor solo-audio MP4, unidos con ffmpeg (YouTube ya no
// sirve formatos combinados en la mayoría de videos).
async function getMediaBufferViaYtdl(videoId, want) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const { info, yt: ytInst } = await lookupYtdlInfo(url);
    if (want === 'audio') {
        const format = chooseFormat(info.formats, { quality: Quality.HighestAudio, filter: { hasAudio: true, hasVideo: false } });
        const buffer = await streamToBuffer(ytInst.download(info, { format }), MAX_AUDIO_BYTES, 'audio');
        const mimeType = (format.mimeType || '').split(';')[0].trim() || 'audio/mp4';
        const ext = format.container === 'webm' ? 'webm' : 'm4a';
        return { buffer, mimeType, ext };
    }
    // Video: H.264 (avc1) es lo que WhatsApp reproduce seguro; ytdl
    // ordena AV1 por encima a la misma altura, así que se pide H.264
    // primero y solo si no hay se acepta otro códec MP4 o cualquiera.
    let videoFormat;
    try {
        videoFormat = chooseFormat(info.formats, { quality: Quality.HighestVideo, filter: (f) => f.hasVideo && !f.hasAudio && f.container === 'mp4' && (f.height || 0) <= 720 && ((f.videoCodec || '') + (f.mimeType || '')).includes('avc1') });
    } catch {
        try {
            videoFormat = chooseFormat(info.formats, { quality: Quality.HighestVideo, filter: (f) => f.hasVideo && !f.hasAudio && f.container === 'mp4' && (f.height || 0) <= 720 });
        } catch {
            videoFormat = chooseFormat(info.formats, { quality: Quality.HighestVideo, filter: (f) => f.hasVideo && !f.hasAudio && (f.height || 0) <= 720 });
        }
    }
    let audioFormat;
    try {
        audioFormat = chooseFormat(info.formats, { quality: Quality.HighestAudio, filter: { hasAudio: true, hasVideo: false, container: 'mp4' } });
    } catch {
        audioFormat = chooseFormat(info.formats, { quality: Quality.HighestAudio, filter: { hasAudio: true, hasVideo: false } });
    }
    const videoBuffer = await streamToBuffer(ytInst.download(info, { format: videoFormat }), MAX_VIDEO_BYTES, 'video');
    const audioBuffer = await streamToBuffer(ytInst.download(info, { format: audioFormat }), MAX_AUDIO_BYTES, 'audio');
    const audioExt = audioFormat.container === 'webm' ? 'webm' : 'm4a';
    const buffer = await muxVideoAudio(videoBuffer, audioBuffer, audioExt);
    return { buffer, mimeType: 'video/mp4' };
}

// Reempaqueta un MP4 fragmentado (fMP4: moof/mdat, como el que sirve
// ytdownloader.tech) a MP4 normal con ffmpeg, sin re-codificar.
// WhatsApp reproduce el fMP4 pero no puede buscar (adelantar/retroceder)
// ni muestra la duración; con el índice (moov) reconstruido sí.
// Si ffmpeg no está o falla, devuelve el buffer original.
async function remuxMp4(buffer) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'remux-'));
    const inFile = path.join(dir, 'in.mp4');
    const outFile = path.join(dir, 'out.mp4');
    try {
        fs.writeFileSync(inFile, buffer);
        await new Promise((resolve, reject) => {
            const ff = spawn('ffmpeg', ['-y', '-i', inFile, '-c', 'copy', '-movflags', '+faststart', outFile], { stdio: 'ignore', timeout: 120000 });
            ff.on('error', reject);
            ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg ' + code))));
        });
        return fs.readFileSync(outFile);
    } catch (e) {
        console.log('❌ remux MP4 falló, se manda el original:', e.message);
        return buffer;
    } finally {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
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

// youtube-dl-exec (yt-dlp, 2ª opción): baja directo de YouTube.
// Necesita python3 y el binario yt-dlp (lo descarga npm install);
// si falta algo, lanza el error y la cadena pasa a ytdl-core.
// Audio: el mejor solo-audio. Video: mejor video MP4 hasta 720p +
// mejor audio MP4 unidos por yt-dlp (necesita ffmpeg); si no hay
// formato combinado, se acepta el mejor combinado MP4 hasta 720p.
async function getMediaBufferViaYtDlp(videoId, want) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytdlp-'));
    try {
        const cookieFlags = ytDlpCookieFlags();
        const output = path.join(dir, `${want}.%(ext)s`);
        if (want === 'audio') {
            await youtubedl(url, {
                format: 'bestaudio[ext=m4a]/bestaudio',
                output,
                noPlaylist: true, noWarnings: true, quiet: true,
                ...cookieFlags,
            }, { timeout: 180000, killSignal: 'SIGKILL' });
        } else {
            await youtubedl(url, {
                format: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
                output,
                noPlaylist: true, noWarnings: true, quiet: true,
                ...cookieFlags,
            }, { timeout: 180000, killSignal: 'SIGKILL' });
        }
        const file = fs.readdirSync(dir).map((f) => path.join(dir, f)).find((f) => fs.statSync(f).isFile());
        if (!file) throw new Error('yt-dlp no dejó archivo');
        const ext = path.extname(file).slice(1).toLowerCase();
        const buffer = fs.readFileSync(file);
        const maxBytes = want === 'audio' ? MAX_AUDIO_BYTES : MAX_VIDEO_BYTES;
        if (!buffer.length) throw new Error('Descarga vacía (yt-dlp)');
        if (buffer.length > maxBytes) throw new Error(`Archivo demasiado grande (>${Math.round(maxBytes / 1048576)} MB)`);
        if (want === 'audio') {
            const mimeType = ext === 'm4a' ? 'audio/mp4' : ext === 'webm' ? 'audio/webm' : ext === 'mp3' ? 'audio/mpeg' : `audio/${ext}`;
            return { buffer, mimeType, ext };
        }
        if (ext !== 'mp4') throw new Error(`yt-dlp devolvió .${ext}, se esperaba mp4`);
        return { buffer: await remuxMp4(buffer), mimeType: 'video/mp4' };
    } finally {
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
}

// Audio listo para mandar. 1º ab-downloader (MP3 de su CDN),
// 2º yt-dlp y 3º ytdl-core (AAC/WebM directo de YouTube).
// Devuelve { buffer, mimeType, ext }.
export async function getAudioBuffer(videoId) {
    try {
        const { buffer, mimeType, ext } = await getMediaBufferViaAbDownloader(videoId, 'audio');
        return { buffer, mimeType, ext };
    } catch (e) {
        console.log('❌ ab-downloader (audio) falló, 2ª opción yt-dlp:', e.message);
        try {
            return await getMediaBufferViaYtDlp(videoId, 'audio');
        } catch (e2) {
            console.log('❌ yt-dlp (audio) falló, 3ª opción ytdl-core:', e2.message);
            return getMediaBufferViaYtdl(videoId, 'audio');
        }
    }
}

// Video listo para mandar. 1º ab-downloader (MP4 de su CDN,
// reempaquetado para que WhatsApp pueda buscar), 2º yt-dlp
// (video + audio unidos por yt-dlp) y 3º ytdl-core (video + audio
// unidos con ffmpeg, ya con +faststart).
// Devuelve { buffer, mimeType }.
export async function getVideoBuffer(videoId) {
    try {
        const { buffer } = await getMediaBufferViaAbDownloader(videoId, 'video');
        return { buffer: await remuxMp4(buffer), mimeType: 'video/mp4' };
    } catch (e) {
        console.log('❌ ab-downloader (video) falló, 2ª opción yt-dlp:', e.message);
        try {
            return await getMediaBufferViaYtDlp(videoId, 'video');
        } catch (e2) {
            console.log('❌ yt-dlp (video) falló, 3ª opción ytdl-core:', e2.message);
            return getMediaBufferViaYtdl(videoId, 'video');
        }
    }
}

// Metadatos ID3 para el audio (título, artista, álbum, año, comentario y
// portada). Solo el MP3 admite ID3 (ab-downloader devuelve MP3;
// el audio de yt-dlp/ytdl-core es AAC/WebM y se devuelve sin etiquetar).
// Si el buffer no es MP3, no hay título/artista o algo falla,
// devuelve el buffer original sin tocar: nunca rompe la descarga.
export async function tagAudioMp3(buffer, mimeType, meta = {}) {
    try {
        if (!Buffer.isBuffer(buffer) || !buffer.length) return buffer;
        const isMp3 = (mimeType || '').includes('mpeg')
            || buffer.subarray(0, 3).toString() === 'ID3'
            || (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0);
        if (!isMp3) return buffer;
        if (!meta.title && !meta.artist) return buffer;
        let cover = null;
        if (meta.thumbnail) {
            try {
                const res = await fetch(meta.thumbnail, { headers: { 'user-agent': 'Mozilla/5.0' } });
                if (res.ok) cover = Buffer.from(await res.arrayBuffer());
            } catch {}
        }
        const tags = {
            title: meta.title || undefined,
            artist: meta.artist || undefined,
            album: meta.album || 'YouTube Audio',
            year: String(new Date().getFullYear()),
            comment: {
                language: 'spa',
                text: `Descarga de YouTube${meta.url ? ': ' + meta.url : ''}`,
            },
        };
        if (cover) tags.APIC = cover;
        const tagged = NodeID3.write(tags, buffer);
        return tagged || buffer;
    } catch {
        return buffer;
    }
}
