/**
 * gtw
 */

// Adaptado a ESM para el bot: se importa { OmDownloader } desde
// src/libraries/ytmusic.js. Sin CLI y sin el upload a Zass CDN
// (el bot manda el buffer por WhatsApp, no necesita subirlo a ningún lado).
// El resto es el snippet original de @haidar (omdown.site).

const BASE_URL = 'https://www.omdown.site';
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// falnaxk id
const FALLBACK_ACTION_ID = '708399a12b89c0c44316117a83426033874649eaec';
const NEXT_ROUTER_STATE_TREE = '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22id%22%2C%22d%22%2Cnull%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C4096%5D%7D%2Cnull%2Cnull%2C4112%5D%7D%2Cnull%2Cnull%2C4112%5D';

const PLATFORM_RULES = [
  [/(?:^|\.)shortdrama\.tiktok\.com$/i, 'PineDrama'],
  [/(?:^|\.)tiktok\.com$/i, 'TikTok'],
  [/(?:^|\.)(?:douyin\.com|iesdouyin\.com)$/i, 'Douyin'],
  [/(?:^|\.)(?:kuaishou\.com|kwai\.com)$/i, 'Kuaishou'],
  [/(?:^|\.)(?:snackvideo\.com|sck\.io)$/i, 'SnackVideo'],
  [/(?:^|\.)(?:xiaohongshu\.com|rednote\.com|xhslink\.com)$/i, 'RedNote'],
  [/(?:^|\.)(?:youtu\.be|youtube\.com)$/i, 'YouTube'],
  [/(?:^|\.)(?:instagram\.com|instagr\.am|ig\.me)$/i, 'Instagram'],
  [/(?:^|\.)(?:twitter\.com|x\.com|t\.co)$/i, 'X'],
  [/(?:^|\.)(?:facebook\.com|fb\.watch|fb\.com)$/i, 'Facebook'],
  [/(?:^|\.)threads\.(?:net|com)$/i, 'Threads'],
  [/(?:^|\.)(?:bsky\.app|bsky\.social)$/i, 'Bluesky'],
  [/(?:^|\.)(?:reddit\.com|redd\.it)$/i, 'Reddit'],
  [/(?:^|\.)capcut\.com$/i, 'CapCut'],
  [/(?:^|\.)snapchat\.com$/i, 'Snapchat'],
  [/(?:^|\.)twitch\.tv$/i, 'Twitch'],
  [/(?:^|\.)(?:bilibili\.com|bilibili\.tv|b23\.tv|bili\.im)$/i, 'Bilibili'],
  [/(?:^|\.)(?:dailymotion\.com|dai\.ly)$/i, 'Dailymotion'],
  [/(?:^|\.)lahelu\.com$/i, 'Lahelu'],
  [/(?:^|\.)(?:spotify\.com|spoti\.fi)$/i, 'Spotify'],
  [/(?:^|\.)soundcloud\.com$/i, 'SoundCloud'],
  [/(?:^|\.)(?:music\.apple\.com|apple\.co)$/i, 'Apple Music'],
  [/(?:^|\.)(?:pinterest\.(?:com|co\.[a-z]{2}|[a-z]{2,3})|pin\.it)$/i, 'Pinterest'],
  [/(?:^|\.)deviantart\.com$/i, 'DeviantArt'],
  [/(?:^|\.)pixiv\.net$/i, 'Pixiv'],
  [/(?:^|\.)mangadex\.org$/i, 'MangaDex'],
  [/(?:^|\.)imgur\.com$/i, 'Imgur']
];

class OmDownloader {
  constructor(options = {}) {
    this.userAgent = options.userAgent || DEFAULT_USER_AGENT;
    this.cachedCookies = null;
    this.cachedActionId = null;
    this.cookieExpiresAt = 0;
  }

  /**
   * Detects the platform name from target media URL.
   * @param {string} inputUrl
   * @returns {string} Platform name
   */
  detectPlatform(inputUrl) {
    try {
      const parsed = new URL(/^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`);
      for (const [pattern, name] of PLATFORM_RULES) {
        if (pattern.test(parsed.hostname)) {
          return name;
        }
      }
    } catch {
     
    }
    return 'TikTok';
  }

  /**
   * Obtains a valid session cookie and dynamically discovers resolveMediaAction ID.
   */
  async initSession(forceRefresh = false) {
    if (!forceRefresh && this.cachedCookies && this.cachedActionId && Date.now() < this.cookieExpiresAt) {
      return { cookies: this.cachedCookies, actionId: this.cachedActionId };
    }

    const res = await fetch(`${BASE_URL}/id`, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to initialize session from omdown.site (Status ${res.status})`);
    }

    // Extract cookies
    const setCookieHeaders = res.headers.getSetCookie 
      ? res.headers.getSetCookie() 
      : (res.headers.get('set-cookie') ? res.headers.get('set-cookie').split(',') : []);

    const cookieMap = new Map();
    for (const header of setCookieHeaders) {
      const match = header.match(/^\s*([a-zA-Z0-9_-]+)=([^;]+)/);
      if (match) {
        const [_, key, val] = match;
        if (!['Path', 'Expires', 'Max-Age', 'Domain', 'SameSite'].includes(key)) {
          cookieMap.set(key, val);
        }
      }
    }

    this.cachedCookies = Array.from(cookieMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    
    // Cookie valid for at least 4 hours
    this.cookieExpiresAt = Date.now() + 4 * 60 * 60 * 1000;

    // Discover Action ID from scripts
    const html = await res.text();
    let discoveredActionId = null;

    const scriptMatches = [...html.matchAll(/src=["'](\/_next\/static\/chunks\/[^"']+\.js)["']/g)];
    const scriptUrls = scriptMatches.map(m => `${BASE_URL}${m[1]}`);

    for (const sUrl of scriptUrls) {
      try {
        const sRes = await fetch(sUrl, {
          headers: { 'User-Agent': this.userAgent }
        });
        if (sRes.ok) {
          const js = await sRes.text();
          if (js.includes('resolveMediaAction')) {
            const match = js.match(/createServerReference\)?\(["']([a-f0-9]{32,64})["'][^)]*["']resolveMediaAction["']/i)
                       || js.match(/["']([a-f0-9]{32,64})["'][^"']{0,60}resolveMediaAction/i);
            if (match) {
              discoveredActionId = match[1];
              break;
            }
          }
        }
      } catch {
        // Continue searching
      }
    }

    this.cachedActionId = discoveredActionId || FALLBACK_ACTION_ID;
    return { cookies: this.cachedCookies, actionId: this.cachedActionId };
  }

  /**
   * Decodes React Server Components (Flight) wire format.
   * Handles string lengths `T<hexLen>,` and cross-chunk references `$11`, etc.
   */
  parseFlightStream(raw) {
    const chunks = new Map();
    let pos = 0;

    while (pos < raw.length) {
      while (pos < raw.length && (raw[pos] === '\r' || raw[pos] === '\n')) {
        pos++;
      }
      if (pos >= raw.length) break;

      const colonIdx = raw.indexOf(':', pos);
      if (colonIdx === -1) break;

      const id = raw.slice(pos, colonIdx);
      const nextChar = raw[colonIdx + 1];

      // Formatted text chunk: <id>:T<hexLen>,<text>
      if (nextChar === 'T') {
        const commaIdx = raw.indexOf(',', colonIdx + 1);
        if (commaIdx !== -1) {
          const hexLen = raw.slice(colonIdx + 2, commaIdx);
          const len = parseInt(hexLen, 16);
          const textVal = raw.slice(commaIdx + 1, commaIdx + 1 + len);
          chunks.set(id, textVal);
          pos = commaIdx + 1 + len;
          continue;
        }
      }

      // Line-based JSON or component chunk
      const nextNewline = raw.indexOf('\n', colonIdx + 1);
      const lineEnd = nextNewline !== -1 ? nextNewline : raw.length;
      const content = raw.slice(colonIdx + 1, lineEnd).trim();

      try {
        chunks.set(id, JSON.parse(content));
      } catch {
        chunks.set(id, content);
      }
      pos = lineEnd + 1;
    }

    return chunks;
  }

  /**
   * Cleans React Flight placeholders ($undefined, chunk references) into concrete values.
   */
  resolveReferences(value, chunks) {
    if (value === '$undefined') return null;
    if (typeof value === 'string' && value.startsWith('$')) {
      const refId = value.slice(1);
      if (chunks.has(refId)) {
        return this.resolveReferences(chunks.get(refId), chunks);
      }
    }
    if (Array.isArray(value)) {
      return value.map(v => this.resolveReferences(v, chunks));
    }
    if (value !== null && typeof value === 'object') {
      const resolved = {};
      for (const [k, v] of Object.entries(value)) {
        resolved[k] = this.resolveReferences(v, chunks);
      }
      return resolved;
    }
    return value;
  }

  /**
   * Resolves media metadata and download links from omdown.site.
   * 
   * @param {string} mediaUrl Target media URL (TikTok, Instagram, YouTube, etc.)
   * @param {object} [options]
   * @param {string} [options.platform] Explicit platform name (auto-detected if omitted)
   * @param {string} [options.locale="id"] Locale ("id" or "en")
   * @returns {Promise<object>} Parsed media info with direct download links
   */
  async resolve(mediaUrl, options = {}) {
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      throw new Error('mediaUrl must be a non-empty string');
    }

    const platform = options.platform || this.detectPlatform(mediaUrl);
    const locale = options.locale || 'id';

    const { cookies, actionId } = await this.initSession();

    const postBody = JSON.stringify([mediaUrl.trim(), platform, locale]);

    const res = await fetch(`${BASE_URL}/${locale}`, {
      method: 'POST',
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/x-component',
        'Content-Type': 'text/plain;charset=UTF-8',
        'Next-Action': actionId,
        'Next-Router-State-Tree': NEXT_ROUTER_STATE_TREE,
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/${locale}`,
        'Cookie': cookies,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: postBody
    });

    if (!res.ok) {
      throw new Error(`HTTP Error from omdown.site: ${res.status} ${res.statusText}`);
    }

    const raw = await res.text();
    const chunks = this.parseFlightStream(raw);

    // Chunk '1' contains the main server action response payload
    const mainPayload = chunks.get('1');
    if (!mainPayload) {
      throw new Error('Invalid response structure: missing main data payload from omdown.');
    }

    if (mainPayload.success === false) {
      throw new Error(mainPayload.error || 'Server rejected media resolution.');
    }

    const mediaData = this.resolveReferences(mainPayload.data, chunks);

    // Normalize relative URLs into absolute URLs
    const makeAbsolute = (url) => {
      if (!url || typeof url !== 'string') return url;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    if (mediaData.thumbnailUrl) mediaData.thumbnailUrl = makeAbsolute(mediaData.thumbnailUrl);
    if (mediaData.authorAvatar) mediaData.authorAvatar = makeAbsolute(mediaData.authorAvatar);
    if (mediaData.previewUrl) mediaData.previewUrl = makeAbsolute(mediaData.previewUrl);

    if (mediaData.music && mediaData.music.playUrl) {
      mediaData.music.playUrl = makeAbsolute(mediaData.music.playUrl);
    }

    if (Array.isArray(mediaData.formats)) {
      mediaData.formats = mediaData.formats.map(fmt => {
        let dl = fmt.downloadUrl;
        if (dl && dl !== 'all-playlist' && dl !== 'all-slides') {
          dl = makeAbsolute(dl);
          // link dl (direct download) -> server balas Content-Disposition: attachment
          if (!dl.includes('download=1')) {
            dl += (dl.includes('?') ? '&' : '?') + 'download=1';
          }
        }
        const isDirect = typeof dl === 'string' && dl.startsWith('http');
        return {
          ...fmt,
          // `dl` = link langsung (bukan stream), wajib dibuka dengan sessionCookies yang sama
          dl: isDirect ? dl : null,
          downloadUrl: dl
        };
      });
    }

    if (Array.isArray(mediaData.slides)) {
      mediaData.slides = mediaData.slides.map(slide => ({
        ...slide,
        imageUrl: makeAbsolute(slide.imageUrl),
        thumbnailUrl: makeAbsolute(slide.thumbnailUrl),
        downloadUrl: makeAbsolute(slide.downloadUrl)
      }));
    }

    return {
      success: true,
      platform: mediaData.platform || platform,
      title: mediaData.title,
      author: mediaData.author,
      authorAvatar: mediaData.authorAvatar,
      durationLabel: mediaData.durationLabel,
      thumbnailUrl: mediaData.thumbnailUrl,
      previewUrl: mediaData.previewUrl,
      rawUrl: mediaData.rawUrl || mediaUrl,
      isCarousel: Boolean(mediaData.isCarousel),
      stats: mediaData.stats || null,
      music: mediaData.music || null,
      slides: mediaData.slides || null,
      formats: mediaData.formats || [],
      // Keep session cookies for downloading streams
      sessionCookies: this.cachedCookies
    };
  }

  /**
   * Baja un enlace directo (dl) y devuelve el Buffer. El enlace está
   * bloqueado a la sesión que lo resolvió: siempre pasar los
   * sessionCookies del mismo resolve().
   */
  async downloadBuffer(downloadUrl, options = {}) {
    if (!downloadUrl) throw new Error('downloadUrl is required');
    if (!this.cachedCookies) {
      await this.initSession();
    }
    const cookies = options.cookies || this.cachedCookies;
    const res = await fetch(downloadUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Referer': `${BASE_URL}/id`,
        'Cookie': cookies,
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        Accept: '*/*'
      }
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const msg = (detail || res.statusText || '').slice(0, 200).trim();
      if (res.status === 403) {
        throw new Error(
          `403 ${msg || 'Access forbidden'} — link terkunci ke session saat resolve. ` +
            `Gunakan sessionCookies dari hasil resolve yang sama (atau jalankan downloadFormatBuffer()).`
        );
      }
      throw new Error(`Download failed with status ${res.status}: ${msg || res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  /**
   * Resolve + download en un solo paso con la MISMA sesión (sin problema
   * de bloqueo 403). Re-resuelve con sesión nueva si el enlace se bloqueó.
   * Devuelve { buffer, bytes, format, info }.
   */
  async downloadFormatBuffer(mediaUrl, formatId = 'sd', options = {}) {
    const pickFormat = (info) => {
      const usable = (info.formats || []).filter(
        (f) => typeof f.downloadUrl === 'string' && f.downloadUrl.startsWith('http')
      );
      return (
        usable.find((f) => f.id === formatId) ||
        usable.find((f) => f.kind === 'video') ||
        usable[0]
      );
    };

    let info = await this.resolve(mediaUrl, options);
    let fmt = pickFormat(info);
    if (!fmt) throw new Error(`Tidak ada format yang bisa diunduh (formatId='${formatId}').`);

    const attempt = (cookies) =>
      this.downloadBuffer(fmt.downloadUrl, { ...options, cookies });

    let buffer;
    try {
      buffer = await attempt(info.sessionCookies);
    } catch (err) {
      if (!/403/.test(err.message)) throw err;
      await this.initSession(true);
      info = await this.resolve(mediaUrl, options);
      fmt = pickFormat(info);
      if (!fmt) throw err;
      buffer = await attempt(info.sessionCookies);
    }

    return { buffer, bytes: buffer.length, format: fmt, info };
  }
}

// Convenience helper functions
async function scrapeOmdown(url, options = {}) {
  const downloader = new OmDownloader(options);
  return downloader.resolve(url, options);
}

export { OmDownloader, scrapeOmdown, PLATFORM_RULES };
