// Helpers compartidos para descargar de YouTube. Los usan
// downloader-play.js (play/play2), downloader-ytplay.js (ytplay),
// downloader-yta.js (ytmp3), downloader-ytv.js (ytmp4), @testting.js,
// search-yts.js (ytsearch) y downloader-playlist.js (playlist).
//
// Búsqueda e info del video: 1º yt-search (título, duración, link,
// autor, vistas, miniatura) y, si YouTube lo limita (429) o devuelve
// vacío, 2º yt-dlp (ytsearch, con las cookies cuando existen). Solo
// la DESCARGA cambia de opción.
// Descarga: 1º ab-downloader (el de su web, MP3/MP4 listos en su
// CDN, que se bajan con un GET normal), 2º youtube-dl-exec (yt-dlp,
// baja directo de YouTube) y 3º @distube/ytdl-core (también directo
// de YouTube, con las cookies de src/libraries/ytmusic.txt). Si una
// opción falla, se pasa a la siguiente. Sin sesión, YouTube puede
// bloquear la IP del panel y no devolver ni los formatos (por eso
// yt-dlp y ytdl-core usan las cookies cuando existen).
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
import { fileURLToPath } from 'node:url';
import { spawn } from 'child_process';
import { Readable } from 'node:stream';

// ytdl-core espera que fetch devuelva un Response con cuerpo web
// (ReadableStream con .getReader()). En el proceso del bot el fetch
// global es node-fetch (cuerpo Node sin getReader) y ytdl-core
// revienta con "source.getReader is not a function" al resolver el
// player (PLAYER_SOLVE_FAILED). Este adaptador convierte ese cuerpo
// a web stream; con el fetch nativo pasa tal cual.
const webStreamFetch = async (input, init) => {
    const res = await fetch(input, init);
    if (res.body && typeof res.body.getReader !== 'function') {
        try {
            return new Response(Readable.toWeb(res.body), { status: res.status, statusText: res.statusText, headers: res.headers });
        } catch {
            return res;
        }
    }
    return res;
};
import yts from 'yt-search';
import abDownloader from 'ab-downloader';
import NodeID3 from 'node-id3';
import { Ytdl, Quality, chooseFormat } from '@distube/ytdl-core';
import youtubedl from 'youtube-dl-exec';
const { youtube: abYoutube } = abDownloader;
// Cookies de YouTube opcionales (archivo src/libraries/ytmusic.txt,
// con la sesión de YouTube del
// dueño, en formato cabecera o exportación Netscape). Sin cookies,
// YouTube puede marcar la IP del panel como bot y ytdl-core falla
// (PLAYER_SOLVE_FAILED / visitor data request failed) aunque la
// librería esté al día. Con la sesión puesta, YouTube lo trata como
// un usuario real. El archivo NO se sube al repo (ver .gitignore).
// Lee las cookies de YouTube opcionales: una cabecera tal cual, una
// ruta de archivo, o el archivo ytmusic.txt/ytcook.txt junto a este
// archivo (formato cabecera o exportación Netscape). Sin cookies
// funciona igual, pero YouTube puede marcar la IP como bot.
function parseCookies(input = null) {
    if (input === false || input === '') return '';
    if (input && typeof input === 'string' && input.includes('=')) return input.trim();
    if (input && typeof input === 'string' && fs.existsSync(input)) {
        try {
            return fs.readFileSync(input, 'utf8')
                .split('\n').map((line) => line.trim())
                .filter((line) => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')))
                .map((line) => {
                    const clean = line.replace(/^#HttpOnly_/, '');
                    const parts = clean.includes('\t') ? clean.split('\t') : clean.split(/\s+/);
                    return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : line;
                }).join('; ');
        } catch { return ''; }
    }
    // En Windows new URL(...).pathname devuelve '/C:/...' (ruta
    // inválida) y las cookies nunca se encontraban: fileURLToPath
    // convierte la URL a la ruta real del sistema.
    const ytMusicPath = fileURLToPath(new URL('ytmusic.txt', import.meta.url));
    const ytCookPath = fileURLToPath(new URL('ytcook.txt', import.meta.url));
    const target = fs.existsSync(ytMusicPath) ? ytMusicPath
        : fs.existsSync('ytmusic.txt') ? 'ytmusic.txt'
        : fs.existsSync(ytCookPath) ? ytCookPath
        : fs.existsSync('ytcook.txt') ? 'ytcook.txt' : '';
    if (!target) return '';
    try {
        return fs.readFileSync(target, 'utf8')
            .split('\n').map((line) => line.trim())
            .filter((line) => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')))
            .map((line) => {
                const clean = line.replace(/^#HttpOnly_/, '');
                const parts = clean.includes('\t') ? clean.split('\t') : clean.split(/\s+/);
                return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : line;
            }).join('; ');
    } catch { return ''; }
}
const YT_COOKIE_PATH = fileURLToPath(new URL('ytmusic.txt', import.meta.url));
// Las cookies se leen EN CADA USO, no solo al arrancar: si el dueño
// sube ytmusic.txt con el bot ya corriendo, la siguiente descarga ya
// las usa, sin reiniciar. (Antes se leían una sola vez al cargar el
// módulo, así que subir el archivo sin reiniciar no tenía efecto.)
function currentCookie() {
    return parseCookies() || '';
}
function cookieIsNetscape() {
    try {
        return fs.readFileSync(YT_COOKIE_PATH, 'utf8').split('\n').some((line) => line.split('\t').length >= 7);
    } catch { return false; }
}
// yt-dlp acepta las cookies como archivo Netscape (--cookies) o como
// cabecera (--add-header). Se detecta el formato del archivo.
function ytDlpCookieFlags() {
    const cookie = currentCookie();
    if (!cookie) return {};
    if (cookieIsNetscape()) return { cookies: YT_COOKIE_PATH };
    return { addHeader: [`Cookie: ${cookie}`] };
}
// La sesión debe traer SAPISID o __Secure-3PAPISID; si la cookie
// está incompleta, el constructor de Ytdl lanza y rompería todo el
// módulo, así que se atrapa y se sigue sin sesión.
let yt;
let lastCookie = '';
try {
    const initialCookie = currentCookie();
    yt = new Ytdl(initialCookie ? { cookie: initialCookie, fetch: webStreamFetch } : { fetch: webStreamFetch });
    lastCookie = initialCookie;
} catch (e) {
    console.log('⚠️ Cookies de YouTube inválidas en ytmusic.txt, ytdl-core sin sesión:', e.message);
    yt = new Ytdl({ fetch: webStreamFetch });
    lastCookie = '';
}
if (lastCookie) console.log('✅ Cookies de YouTube cargadas desde src/libraries/ytmusic.txt');
else console.log('ℹ️ Sin cookies de YouTube (src/libraries/ytmusic.txt no encontrado o vacío): las descargas pueden fallar si YouTube marca la IP como bot');

// Busca la info del video con reintento: 2 intentos con la sesión
// (si hay) y, si la cookie está caducada, 1 último sin ella.
async function lookupYtdlInfo(url) {
    // Si el archivo de cookies cambió desde la última vez (se subió o
    // se borró), aplicar la sesión actual a la instancia compartida.
    const cookie = currentCookie();
    if (cookie !== lastCookie) {
        try { yt.setCookie(cookie || undefined); lastCookie = cookie; } catch (e) { console.log('⚠️ No se pudo aplicar la cookie de YouTube:', e.message); }
    }
    const attempts = cookie ? [[yt, 2], [new Ytdl({ fetch: webStreamFetch }), 1]] : [[yt, 2]];
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

// Normaliza un resultado de yt-search con todos los campos que usan los
// plugins (tarjeta de info, lista de playlist y búsqueda).
export function normalizeVideo(v) {
    return {
        videoId: v.videoId,
        url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
        title: v.title || '',
        type: 'video',
        author: {
            name: v.author?.name || 'YouTube',
            url: v.author?.url || '',
        },
        duration: { seconds: v.seconds || 0, timestamp: v.timestamp || '0:00' },
        timestamp: v.timestamp || '0:00',
        thumbnail: v.thumbnail || v.image || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
        views: v.views || 0,
        ago: v.ago || '',
    };
}

// yt-search a veces devuelve 429 (límite de YouTube): reintentar.
async function ytsWithRetry(args, tries = 3) {
    let lastErr;
    for (let i = 0; i < tries; i++) {
        try {
            return await yts(args);
        } catch (e) {
            lastErr = e;
            if (i < tries - 1) await new Promise((r) => setTimeout(r, 2000));
        }
    }
    throw lastErr;
}

// Respaldo de búsqueda: yt-dlp (ytsearch) con las cookies cuando
// existen. yt-search falla a veces desde la IP del panel (429 de
// YouTube o lista vacía) y entonces .play/.play2 contestaban el error
// genérico sin tarjeta y sin dejar rastro en consola. yt-dlp busca
// por otro camino y con sesión, así que no cae por el mismo límite.
// Devuelve la misma forma que normalizeVideo.
function fmtDuration(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}

function normalizeYtDlpEntry(e) {
    const videoId = e.id;
    const thumbs = (e.thumbnails || []).filter((t) => t?.url);
    const thumb = thumbs[thumbs.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const seconds = e.duration || 0;
    return {
        videoId,
        url: e.url || `https://youtube.com/watch?v=${videoId}`,
        title: e.title || '',
        type: 'video',
        author: { name: e.uploader || e.channel || 'YouTube', url: e.uploader_url || e.channel_url || '' },
        duration: { seconds, timestamp: fmtDuration(seconds) },
        timestamp: fmtDuration(seconds),
        thumbnail: thumb,
        views: e.view_count || 0,
        ago: '',
    };
}

async function searchViaYtDlp(query, limit = 1) {
    const out = await youtubedl(`ytsearch${limit}:${query}`, {
        dumpSingleJson: true, flatPlaylist: true, noWarnings: true, quiet: true,
        ...ytDlpCookieFlags(),
    }, { timeout: 60000, killSignal: 'SIGKILL' });
    const entries = (out?.entries || []).filter((e) => e?.id);
    return entries.map(normalizeYtDlpEntry);
}

// Primer resultado de la búsqueda (canción para play, video para play2).
// yt-search no distingue canciones de videos: ambos usan la misma
// lista de videos de YouTube.
export async function searchMusic(query, filter = 'songs') {
    try {
        const res = await ytsWithRetry(query);
        const pick = (res?.videos || []).find((v) => v && v.videoId) || null;
        if (pick) return normalizeVideo(pick);
        console.log('❌ Búsqueda yt-search sin resultados para:', query);
    } catch (e) {
        console.log(`❌ Búsqueda yt-search falló:`, e.message);
    }
    try {
        const [first] = await searchViaYtDlp(query, 1);
        if (first) {
            console.log('✅ Búsqueda por yt-dlp (respaldo):', first.title);
            return first;
        }
        console.log('❌ Búsqueda yt-dlp (respaldo) sin resultados para:', query);
    } catch (e) {
        console.log('❌ Búsqueda yt-dlp (respaldo) falló:', e.message);
    }
    return null;
}

// Lista de resultados de la búsqueda (hasta `limit`).
export async function searchMusicList(query, filter = 'videos', limit = 20) {
    try {
        const res = await ytsWithRetry(query);
        const items = (res?.videos || []).filter((v) => v && v.videoId);
        if (items.length) return items.slice(0, limit).map(normalizeVideo);
        console.log('❌ Búsqueda yt-search sin resultados para:', query);
    } catch (e) {
        console.log(`❌ Búsqueda yt-search falló:`, e.message);
    }
    try {
        const items = await searchViaYtDlp(query, limit);
        if (items.length) {
            console.log(`✅ Búsqueda por yt-dlp (respaldo): ${items.length} resultados`);
            return items;
        }
        console.log('❌ Búsqueda yt-dlp (respaldo) sin resultados para:', query);
    } catch (e) {
        console.log('❌ Búsqueda yt-dlp (respaldo) falló:', e.message);
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
    let info;
    try {
        info = await ytsWithRetry({ videoId });
    } catch (e) {
        console.log(`❌ Info del video por yt-search falló:`, e.message);
    }
    if (info?.title) {
        return {
            videoId,
            url: `https://youtu.be/${videoId}`,
            title: info.title,
            author: { name: info.author?.name || 'YouTube' },
            duration: { seconds: info.seconds || 0, timestamp: info.timestamp || '0:00' },
            thumbnail: info.thumbnail || info.image || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: info.views || 0,
            ago: info.ago || '',
        };
    }
    // Respaldo: info completa por yt-dlp (con las cookies cuando existen).
    try {
        const out = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
            dumpSingleJson: true, noWarnings: true, quiet: true,
            ...ytDlpCookieFlags(),
        }, { timeout: 60000, killSignal: 'SIGKILL' });
        if (out?.title) {
            const seconds = out.duration || 0;
            const thumbs = (out.thumbnails || []).filter((t) => t?.url);
            return {
                videoId,
                url: `https://youtu.be/${videoId}`,
                title: out.title,
                author: { name: out.uploader || out.channel || 'YouTube' },
                duration: { seconds, timestamp: fmtDuration(seconds) },
                thumbnail: thumbs[thumbs.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                views: out.view_count || 0,
                ago: '',
            };
        }
    } catch (e) {
        console.log('❌ Info del video por yt-dlp (respaldo) falló:', e.message);
    }
    throw new Error('No se pudo obtener información del video');
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
