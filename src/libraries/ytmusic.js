// Helpers compartidos para descargar de YouTube. Los usan
// downloader-play.js (play/play2), downloader-ytplay.js (ytplay),
// downloader-yta.js (ytmp3), downloader-ytv.js (ytmp4), @testting.js,
// search-yts.js (ytsearch) y downloader-playlist.js (playlist).
//
// Descarga: SOLO ab-downloader (el de su web, MP3/MP4 listos en su
// CDN, que se bajan con un GET normal). Se eliminaron denzy
// (@denzy-official/youtube_scraper) y el scraper de YouTube Music
// (VISIONOS) como opciones de descarga: la descarga ya solo pasa
// por ab-downloader. La búsqueda sigue por el scraper de YouTube
// Music (ayashiiiyo): searchMusic / searchMusicList y getVideoInfo
// (para enlaces directos).
//
// El MP4 de ab-downloader es fragmentado (fMP4), así que se
// reempaqueta con ffmpeg (+faststart) para que WhatsApp pueda
// buscar (adelantar/retroceder) y muestre la duración.
// Los audios MP3 llevan metadatos ID3 (tagAudioMp3).
import fs from 'fs';
import os from 'node:os';
import path from 'path';
import { spawn } from 'child_process';
import { search as ayaSearch, getTrack as ayaTrack } from './ytmusic-scraper.mjs';
import abDownloader from 'ab-downloader';
import NodeID3 from 'node-id3';
const { youtube: abYoutube } = abDownloader;

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

// Audio listo para mandar. Solo ab-downloader (MP3 de su CDN).
// Devuelve { buffer, mimeType, ext }.
export async function getAudioBuffer(videoId) {
    const { buffer, mimeType, ext } = await getMediaBufferViaAbDownloader(videoId, 'audio');
    return { buffer, mimeType, ext };
}

// Video listo para mandar. Solo ab-downloader (MP4 de su CDN,
// reempaquetado para que WhatsApp pueda buscar). Devuelve { buffer, mimeType }.
export async function getVideoBuffer(videoId) {
    const { buffer } = await getMediaBufferViaAbDownloader(videoId, 'video');
    return { buffer: await remuxMp4(buffer), mimeType: 'video/mp4' };
}

// Metadatos ID3 para el audio (título, artista, álbum, año, comentario y
// portada). Solo el MP3 admite ID3 (ab-downloader devuelve MP3).
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
