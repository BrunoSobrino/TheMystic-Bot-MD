/**
 * ytmp3.js — downloader MP3/MP4 dari convertytmp3.org (1 file, tanpa dependency)
 *
 * by alfidev
 * WhatsApp Channel: https://www.whatsapp.com/channel/0029VbCOLKRKrWQtIO1vzN0E
 *
 * Pakai   : node ytmp3.js <link-youtube> [mp3|mp4] [-o file]
 * Contoh  : node ytmp3.js https://youtu.be/dQw4w9WgXcQ mp3 -o lagu.mp3
 *           node ytmp3.js "https://youtube.com/watch?v=xxx" mp4 -o video.mp4
 * Output  : JSON { title, id, format, download, file? }
 *
 * Adaptado a ESM para el bot (sin CLI): se importa { ytmp3 } desde
 * src/libraries/ytmusic.js. El resto del archivo es el gist original.
 *
 * Flow mengikuti persis JS resmi situsnya:
 *   scrape homepage -> apiKey + path JS -> scrape JS -> endpoint (atob)
 *   auth -> init (Bearer) -> convert (ikut redirect) -> poll progress -> download URL
 * Fallback: endpoint workers.dev internal kalau auth/init gagal jaringan.
 */

const SITE = 'https://convertytmp3.org';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

// origin convertytmp3.org ikut dikirim di tiap request (dipakai situsnya sendiri)
function hdr(extra = {}) {
  return {
    'User-Agent': UA,
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    Origin: SITE,
    Referer: SITE + '/',
    ...extra,
  };
}

async function get(url, { headers = hdr(), json = true, timeout = 60000 } = {}) {
  const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
  const body = json ? await res.json().catch(() => null) : await res.text();
  return { status: res.status, body, headers: res.headers };
}

// --- 1. scrape homepage: apiKey + path bundle JS ---
async function scrapeHome() {
  const { status, body } = await get(SITE, { json: false });
  if (status !== 200 || typeof body !== 'string') throw new Error(`homepage HTTP ${status}`);
  const key = body.match(/var\s+apiKey\s*=\s*'([^']+)'/)?.[1];
  const jsPath = body.match(/<script[^>]+src="(\/js\/[^"]+\.js)"/)?.[1];
  if (!key) throw new Error('apiKey tidak ditemukan di homepage (struktur situs berubah?)');
  if (!jsPath) throw new Error('path JS bundle tidak ditemukan di homepage');
  return { apiKey: key, jsPath };
}

// --- 2. scrape bundle JS: endpoint utama (atob) + fallback worker ---
async function scrapeEndpoints(jsPath) {
  const { status, body } = await get(SITE + jsPath, { json: false });
  if (status !== 200 || typeof body !== 'string') throw new Error(`JS bundle HTTP ${status}`);
  const atobs = [...body.matchAll(/atob\("([A-Za-z0-9+/=]+)"\)/g)].map((m) => m[1]);
  const decoded = atobs.map((s) => {
    try {
      return Buffer.from(s, 'base64').toString('utf8');
    } catch {
      return '';
    }
  });
  const endpoint = decoded.find((s) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s));
  const fallback = decoded.find((s) => s.startsWith('https://') && s.includes('workers.dev'));
  if (!endpoint) throw new Error('endpoint tidak ditemukan di JS bundle');
  return { endpoint, fallback: fallback || null };
}

// --- 3. auth -> init ---
async function authInit(apiKey, endpoint) {
  const ts = Date.now();
  const auth = await get(`https://epsilon.${endpoint}/api/v1/auth?api_key=${apiKey}&_=${ts}`);
  if (auth.status === 403) throw new Error('auth HTTP 403 — IP/host kamu diblokir server situsnya');
  const a = auth.body;
  if (!a || a.error > 0 || !a.key) throw new Error(`auth gagal: ${JSON.stringify(a)}`);
  const init = await get(`https://epsilon.${endpoint}/api/v1/init?_=${Date.now()}`, {
    headers: hdr({ Authorization: `Bearer ${a.key}` }),
  });
  const i = init.body;
  if (!i || i.error > 0 || !i.convertURL) throw new Error(`init gagal: ${JSON.stringify(i)}`);
  return i.convertURL;
}

// --- 4. convert (ikut redirect) ---
async function convert(convertURL, id, format) {
  let url = `${convertURL}&v=${id}&f=${format}&_=${Date.now()}`;
  for (let n = 0; n < 5; n++) {
    const { status, body } = await get(url);
    if (status === 429) throw new Error('HTTP 429 — rate limited, coba lagi nanti');
    if (!body || body.error > 0) throw new Error(`convert gagal: ${JSON.stringify(body)}`);
    if (body.redirect && body.redirectURL) {
      url = `${body.redirectURL}&v=${id}&f=${format}&_=${Date.now()}`;
      continue;
    }
    return body;
  }
  throw new Error('convert terlalu banyak redirect');
}

// --- 5. poll progress sampai selesai ---
async function pollProgress(progressURL, downloadURL, id, format) {
  for (let n = 0; n < 100; n++) {
    const { status, body } = await get(`${progressURL}&_=${Date.now()}`);
    if (status === 429) throw new Error('HTTP 429 — rate limited, coba lagi nanti');
    if (!body || body.error > 0) throw new Error(`progress gagal: ${JSON.stringify(body)}`);
    if (body.progress >= 3 || !body.progress) return body.title || '';
    await SLEEP(3000);
  }
  throw new Error('progress timeout (5 menit)');
}

// --- 6. fallback internal (workers.dev) kalau auth/init mati ---
async function viaFallback(fallback, apiKey, id, format) {
  const url = `${fallback}&k=${apiKey}&v=${id}&f=${format}&_=${Date.now()}`;
  const { status, body } = await get(url);
  if (status !== 200 || !body) throw new Error(`fallback HTTP ${status}: ${JSON.stringify(body)}`);
  if (body.error > 0) throw new Error(`fallback error ${body.error}`);
  return body; // { downloadURL, progressURL?, title? }
}

function videoId(url) {
  const m = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|live\/|shorts\/)|[?&]v=)([A-Za-z0-9_-]{11})/.exec(url);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  throw new Error('link YouTube tidak dikenali');
}

async function ytmp3(link, format = 'mp3', opts = {}) {
  if (!/^(mp3|mp4)$/.test(format)) throw new Error('format harus mp3 atau mp4');
  const id = videoId(link);

  const home = await scrapeHome();
  const { endpoint, fallback } = await scrapeEndpoints(home.jsPath);

  let result;
  try {
    const convertURL = await authInit(home.apiKey, endpoint);
    result = await convert(convertURL, id, format);
    if (result.progressURL && !opts.fast) {
      const title = await pollProgress(result.progressURL, result.downloadURL, id, format);
      result.title = result.title || title;
    }
  } catch (e) {
    if (!fallback) throw e;
    // jalur resmi gagal -> pakai endpoint internal situsnya
    result = await viaFallback(fallback, home.apiKey, id, format);
    if (result.progressURL && !opts.fast) {
      const title = await pollProgress(result.progressURL, result.downloadURL, id, format);
      result.title = result.title || title;
    }
  }

  if (!result.downloadURL) throw new Error('downloadURL tidak ada di respons');
  // persis klik tombol Download di situsnya: tambah &v &f &r
  const download = `${result.downloadURL}&v=${id}&f=${format}&r=new.convertytmp3.org`;
  return { title: result.title || '', id, format, download };
}

export { ytmp3, videoId };
