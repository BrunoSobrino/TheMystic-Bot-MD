// Scraper de YouTube Music por ayashiiiyo
// (gist github.com/ayashiiiyo/0b08f25d99aa15bd1e38ff1f08450f9b, ytmusic.mjs).
// Lo usa src/libraries/ytmusic.js (búsqueda, audio con cliente VISIONOS).
// Acepta cookies de YouTube opcionales: archivo ytmusic.txt junto a este
// archivo, o pasando { cookie } en las opciones. Sin cookies funciona
// igual, pero YouTube puede marcar la IP como bot.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BASE_URL = 'https://music.youtube.com';
const COOKIE_PATH = new URL('ytmusic.txt', import.meta.url).pathname;

const FILTER_PARAMS = {
  songs: 'EgWKAQIIAWoSEAUQAxAJEAoQERAQEAQQDhAV',
  videos: 'EgWKAQIQAWoSEAUQAxAJEAoQERAQEAQQDhAV',
  albums: 'EgWKAQIYAWoSEAUQAxAJEAoQERAQEAQQDhAV',
  artists: 'EgWKAQIgAWoSEAUQAxAJEAoQERAQEAQQDhAV',
  playlists: 'EgeKAQQoADgBahIQBRADEAkQChAREBAQBBAOEBU%3D',
  community_playlists: 'EgeKAQQoAEABahIQBRADEAkQChAREBAQBBAOEBU%3D'
};

let cachedContext = null;
let lastContextTime = 0;

export function parseCookies(input = null) {
  if (input === false || input === '') {
    return '';
  }
  if (input && typeof input === 'string' && input.includes('=')) {
    return input.trim();
  }
  if (input && typeof input === 'string' && existsSync(input)) {
    try {
      return readFileSync(input, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')))
        .map(line => {
          const clean = line.replace(/^#HttpOnly_/, '');
          const parts = clean.includes('\t') ? clean.split('\t') : clean.split(/\s+/);
          return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : line;
        })
        .join('; ');
    } catch {
      return '';
    }
  }

  const ytMusicPath = new URL('ytmusic.txt', import.meta.url).pathname;
  const ytCookPath = new URL('ytcook.txt', import.meta.url).pathname;
  const target = existsSync(ytMusicPath)
    ? ytMusicPath
    : existsSync('ytmusic.txt')
    ? 'ytmusic.txt'
    : existsSync(ytCookPath)
    ? ytCookPath
    : existsSync('ytcook.txt')
    ? 'ytcook.txt'
    : '';
  if (!target) return '';
  try {
    return readFileSync(target, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')))
      .map(line => {
        const clean = line.replace(/^#HttpOnly_/, '');
        const parts = clean.includes('\t') ? clean.split('\t') : clean.split(/\s+/);
        return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : line;
      })
      .join('; ');
  } catch {
    return '';
  }
}

export async function getInnertubeConfig(customCookie = null) {
  const cookieHeader = parseCookies(customCookie);
  const now = Date.now();
  if (cachedContext && (now - lastContextTime < 1800000) && cachedContext.cookieHeader === cookieHeader) {
    return cachedContext;
  }

  const [musicHtml, visitorData] = await Promise.all([
    fetch(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(cookieHeader ? { Cookie: cookieHeader } : {})
      }
    }).then(r => r.text()),
    fetch('https://www.youtube.com/sw.js_data', {
      headers: cookieHeader ? { Cookie: cookieHeader } : {}
    })
      .then(r => r.text())
      .then(t => JSON.parse(t.slice(5))[0][2][0][0][13])
      .catch(() => undefined)
  ]);

  const apiKey = musicHtml.match(/"INNERTUBE_API_KEY":\s*"([^"]+)"/)?.[1];
  const clientVersion = musicHtml.match(/"INNERTUBE_CLIENT_VERSION":\s*"([^"]+)"/)?.[1] || '1.20261011.16.00';

  cachedContext = {
    apiKey,
    clientVersion,
    visitorData,
    cookieHeader,
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion,
        hl: 'en',
        gl: 'US',
        ...(visitorData ? { visitorData } : {})
      }
    }
  };
  lastContextTime = now;
  return cachedContext;
}

export function extractVideoId(input) {
  if (!input) return null;
  const str = String(input).trim();
  if (str.startsWith('MPREb_') || str.startsWith('UC') || str.startsWith('VL') || str.startsWith('PL')) {
    return null;
  }
  const urlMatch = str.match(/(?:youtu\.be\/|music\.youtube\.com\/(?:watch\?v=|watch\?.+&v=)|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  return null;
}

export function extractBrowseId(input) {
  if (!input) return null;
  const str = String(input).trim();
  const channelMatch = str.match(/(?:channel\/|browse\/|artist\/)(UC[a-zA-Z0-9_-]+|FEmusic_[a-zA-Z0-9_-]+)/);
  if (channelMatch) return channelMatch[1];
  const playlistMatch = str.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    const listId = playlistMatch[1];
    return listId.startsWith('VL') ? listId : `VL${listId}`;
  }
  return str;
}

async function apiRequest(endpoint, payload, options = {}) {
  const cookieOpt = options.cookie !== undefined ? options.cookie : options.cookies;
  const cfg = await getInnertubeConfig(cookieOpt);
  const url = `${BASE_URL}/youtubei/v1/${endpoint}?key=${cfg.apiKey}`;

  const bodyData = {
    context: cfg.context,
    ...payload
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE_URL,
      'Referer': `${BASE_URL}/`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...(cfg.cookieHeader ? { Cookie: cfg.cookieHeader } : {})
    },
    body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    throw new Error(`YouTube Music API error: HTTP ${res.status}`);
  }
  return res.json();
}

function parseFlexColumn(item, index) {
  return item?.flexColumns?.[index]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
}

function parseResponsiveItem(item) {
  const ir = item.musicResponsiveListItemRenderer;
  if (!ir) return null;

  const col0Runs = parseFlexColumn(ir, 0);
  const col1Runs = parseFlexColumn(ir, 1);
  const col2Runs = parseFlexColumn(ir, 2);

  const title = col0Runs[0]?.text || '';
  const firstCol1 = col1Runs[0]?.text || '';

  const artists = col1Runs
    .filter(r => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('UC'))
    .map(r => ({
      name: r.text,
      id: r.navigationEndpoint?.browseEndpoint?.browseId
    }));

  const albumRun = col1Runs.find(r => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPREb_')) ||
                   col2Runs.find(r => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPREb_'));
  const album = albumRun ? {
    name: albumRun.text,
    id: albumRun.navigationEndpoint?.browseEndpoint?.browseId
  } : null;

  const durationRun = col1Runs.find(r => /^\d+:\d+$/.test(r.text)) ||
                      col2Runs.find(r => /^\d+:\d+$/.test(r.text)) ||
                      ir.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0];
  const duration = durationRun?.text || null;

  const playsRun = col1Runs.find(r => r.text.includes('plays') || r.text.includes('views')) ||
                   col2Runs.find(r => r.text.includes('plays') || r.text.includes('views'));
  const plays = playsRun?.text || null;

  const videoId = ir.playlistItemData?.videoId ||
                  ir.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId ||
                  col0Runs[0]?.navigationEndpoint?.watchEndpoint?.videoId;

  const browseId = col0Runs[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                   ir.navigationEndpoint?.browseEndpoint?.browseId;

  const thumbnails = ir.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const thumbnail = thumbnails.length ? thumbnails[thumbnails.length - 1].url : null;

  let itemType = 'unknown';
  if (firstCol1.toLowerCase().includes('song')) itemType = 'song';
  else if (firstCol1.toLowerCase().includes('video')) itemType = 'video';
  else if (firstCol1.toLowerCase().includes('artist')) itemType = 'artist';
  else if (firstCol1.toLowerCase().includes('album') || firstCol1.toLowerCase().includes('ep')) itemType = 'album';
  else if (firstCol1.toLowerCase().includes('playlist')) itemType = 'playlist';
  else if (videoId) itemType = 'song';
  else if (browseId?.startsWith('UC')) itemType = 'artist';
  else if (browseId?.startsWith('MPREb_')) itemType = 'album';
  else if (browseId?.startsWith('VL')) itemType = 'playlist';

  return {
    type: itemType,
    title,
    videoId: videoId || null,
    browseId: browseId || null,
    artists,
    album,
    duration,
    plays,
    thumbnail,
    thumbnails
  };
}

export async function search(query, options = {}) {
  if (!query || !query.trim()) throw new Error('Search query cannot be empty');
  const filter = (options.filter || 'all').toLowerCase();
  const payload = { query: query.trim() };

  if (FILTER_PARAMS[filter]) {
    payload.params = FILTER_PARAMS[filter];
  }

  const data = await apiRequest('search', payload, options);
  const sections = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  if (filter !== 'all') {
    const shelf = sections[0]?.musicShelfRenderer;
    const contents = shelf?.contents || [];
    return contents.map(parseResponsiveItem).filter(Boolean);
  }

  let topResult = null;
  const topCard = sections.find(s => s.musicCardShelfRenderer)?.musicCardShelfRenderer;
  if (topCard) {
    const title = topCard.title?.runs?.[0]?.text;
    const subtitleRuns = topCard.subtitle?.runs || [];
    const fullSubtitle = subtitleRuns.map(r => r.text).join('');
    const videoId = topCard.onTap?.watchEndpoint?.videoId ||
                    topCard.buttons?.[0]?.buttonRenderer?.command?.watchEndpoint?.videoId;
    const browseId = topCard.onTap?.browseEndpoint?.browseId;
    const thumbs = topCard.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

    topResult = {
      title,
      type: subtitleRuns[0]?.text || 'top',
      subtitle: fullSubtitle,
      videoId: videoId || null,
      browseId: browseId || null,
      thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : null,
      thumbnails: thumbs
    };
  }

  const songs = [];
  const videos = [];
  const albums = [];
  const artists = [];
  const playlists = [];

  for (const s of sections) {
    if (s.itemSectionRenderer) {
      const items = s.itemSectionRenderer.contents || [];
      for (const it of items) {
        const parsed = parseResponsiveItem(it);
        if (!parsed) continue;
        if (parsed.type === 'song') songs.push(parsed);
        else if (parsed.type === 'video') videos.push(parsed);
        else if (parsed.type === 'album') albums.push(parsed);
        else if (parsed.type === 'artist') artists.push(parsed);
        else if (parsed.type === 'playlist') playlists.push(parsed);
      }
    } else if (s.musicShelfRenderer) {
      const shelfTitle = (s.musicShelfRenderer.title?.runs?.[0]?.text || '').toLowerCase();
      const items = s.musicShelfRenderer.contents || [];
      for (const it of items) {
        const parsed = parseResponsiveItem(it);
        if (!parsed) continue;
        if (shelfTitle.includes('song')) songs.push(parsed);
        else if (shelfTitle.includes('video')) videos.push(parsed);
        else if (shelfTitle.includes('album')) albums.push(parsed);
        else if (shelfTitle.includes('artist')) artists.push(parsed);
        else if (shelfTitle.includes('playlist')) playlists.push(parsed);
      }
    }
  }

  return {
    query: query.trim(),
    topResult,
    songs,
    videos,
    albums,
    artists,
    playlists
  };
}

export async function getAudioStream(videoIdOrUrl, options = {}) {
  const cookieOpt = options.cookie !== undefined ? options.cookie : options.cookies;
  let videoId = extractVideoId(videoIdOrUrl);
  let candidates = [];

  if (!videoId) {
    const sRes = await search(videoIdOrUrl, options);
    candidates = [
      sRes.topResult?.videoId,
      ...sRes.songs.map(s => s.videoId),
      ...sRes.videos.map(v => v.videoId)
    ].filter(Boolean);
  } else {
    candidates = [videoId];
  }

  const cfg = await getInnertubeConfig(cookieOpt);

  async function fetchStreamForId(id) {
    try {
      const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
          ...(cfg.cookieHeader ? { Cookie: cfg.cookieHeader } : {})
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'VISIONOS',
              clientVersion: '1.02',
              deviceMake: 'Apple',
              deviceModel: 'RealityDevice17,1',
              osName: 'visionOS',
              osVersion: '26.5.23O471',
              visitorData: cfg.visitorData,
              hl: 'en',
              gl: 'US'
            }
          },
          videoId: id
        })
      });

      const data = await res.json();
      if (data.playabilityStatus?.status !== 'OK') return null;

      const afs = data.streamingData?.adaptiveFormats || [];
      const m4aTrack = afs.find(f => f.itag === 140 && f.url);
      const webmTrack = afs.find(f => f.itag === 251 && f.url);
      const bestAudio = m4aTrack || webmTrack || afs.find(f => f.mimeType?.includes('audio') && f.url);
      if (!bestAudio) return null;

      const url = bestAudio.contentLength
        ? `${bestAudio.url}&range=0-${Number(bestAudio.contentLength) - 1}`
        : bestAudio.url;

      return {
        videoId: id,
        itag: bestAudio.itag,
        format: bestAudio.mimeType?.includes('mp4') ? 'm4a (aac)' : 'webm (opus)',
        mimeType: bestAudio.mimeType?.split(';')[0],
        bitrate: bestAudio.bitrate,
        audioQuality: bestAudio.audioQuality,
        contentLength: bestAudio.contentLength ? parseInt(bestAudio.contentLength, 10) : null,
        url
      };
    } catch {
      return null;
    }
  }

  for (const id of candidates) {
    const s = await fetchStreamForId(id);
    if (s) return s;
  }

  if (videoId) {
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        const cleanAuthor = (oembed.author_name || '').replace(/\s*-\s*Topic/i, '').trim();
        const query = `${cleanAuthor} ${oembed.title}`.trim();
        const sRes = await search(query);
        const altCandidates = [
          sRes.topResult?.videoId,
          ...sRes.songs.map(s => s.videoId),
          ...sRes.videos.map(v => v.videoId)
        ].filter(id => id && id !== videoId);

        for (const altId of altCandidates) {
          const s = await fetchStreamForId(altId);
          if (s) return s;
        }
      }
    } catch {}
  }

  return null;
}

export async function getLyrics(videoIdOrUrl) {
  let videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) {
    const sRes = await search(videoIdOrUrl, { filter: 'songs' });
    const first = Array.isArray(sRes) ? sRes[0] : sRes?.songs?.[0];
    if (first?.videoId) videoId = first.videoId;
  }
  if (!videoId) throw new Error('Invalid YouTube video ID or URL');

  const nextData = await apiRequest('next', { videoId }, options);
  const tabs = nextData.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs || [];
  const lyricsTab = tabs.find(t => t.tabRenderer?.endpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType === 'MUSIC_PAGE_TYPE_TRACK_LYRICS');

  const browseId = lyricsTab?.tabRenderer?.endpoint?.browseEndpoint?.browseId;
  if (!browseId) {
    return { lyrics: null, source: null };
  }

  const browseData = await apiRequest('browse', { browseId }, options);
  const shelf = browseData.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer;

  const lyricsText = shelf?.description?.runs?.map(r => r.text).join('') || null;
  const source = shelf?.footer?.runs?.map(r => r.text).join('') || null;

  return {
    videoId,
    lyrics: lyricsText,
    source
  };
}

export async function getQueue(videoIdOrUrl) {
  const videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) throw new Error('Invalid YouTube video ID or URL');

  const nextData = await apiRequest('next', {
    videoId,
    playlistId: `RDAMVM${videoId}`
  }, options);

  const tab0 = nextData.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0];
  const queueList = tab0?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents || [];

  const queue = [];
  for (const item of queueList) {
    const ppr = item.playlistPanelVideoRenderer;
    if (!ppr) continue;

    const title = ppr.title?.runs?.[0]?.text;
    const vId = ppr.videoId;
    const artistDesc = ppr.longBylineText?.runs?.map(r => r.text).join('') || '';
    const duration = ppr.lengthText?.runs?.[0]?.text || null;
    const thumbs = ppr.thumbnail?.thumbnails || [];

    queue.push({
      title,
      videoId: vId,
      subtitle: artistDesc,
      duration,
      thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : null
    });
  }

  return {
    videoId,
    total: queue.length,
    queue
  };
}

export async function getTrack(videoIdOrUrl, options = {}) {
  let videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) {
    const sRes = await search(videoIdOrUrl, { filter: 'songs' });
    const first = Array.isArray(sRes) ? sRes[0] : sRes?.songs?.[0];
    if (first?.videoId) videoId = first.videoId;
  }
  if (!videoId) throw new Error('Invalid YouTube video ID or URL');

  const [playerData, audio] = await Promise.all([
    apiRequest('player', { videoId }, options),
    getAudioStream(videoId, options)
  ]);

  const vd = playerData.videoDetails || {};
  const lengthSeconds = parseInt(vd.lengthSeconds, 10) || 0;
  const mins = Math.floor(lengthSeconds / 60);
  const secs = String(lengthSeconds % 60).padStart(2, '0');
  const durationText = `${mins}:${secs}`;

  const thumbs = vd.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  let lyrics = null;
  if (options.lyrics) {
    lyrics = await getLyrics(videoId);
  }

  let queue = null;
  if (options.queue || options.related) {
    queue = await getQueue(videoId);
  }

  return {
    videoId,
    title: vd.title || null,
    author: vd.author || null,
    channelId: vd.channelId || null,
    durationSeconds: lengthSeconds,
    duration: durationText,
    thumbnail,
    thumbnails: thumbs,
    audio,
    ...(lyrics ? { lyrics: lyrics.lyrics, lyricsSource: lyrics.source } : {}),
    ...(queue ? { queue: queue.queue } : {})
  };
}

export async function getAlbum(browseIdOrUrl, options = {}) {
  const browseId = extractBrowseId(browseIdOrUrl);
  if (!browseId) throw new Error('Invalid album browseId or URL');

  const res = await apiRequest('browse', { browseId }, options);
  const tc = res.contents?.twoColumnBrowseResultsRenderer;

  const tab0Hdr = tc?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer;
  const title = tab0Hdr?.title?.runs?.[0]?.text;
  const subtitle = tab0Hdr?.subtitle?.runs?.map(r => r.text).join('') || '';
  const secondSubtitle = tab0Hdr?.secondSubtitle?.runs?.map(r => r.text).join('') || '';
  const thumbs = tab0Hdr?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : null;
  const description = tab0Hdr?.description?.musicDescriptionShelfRenderer?.description?.runs?.map(r => r.text).join('') || null;

  const secContents = tc?.secondaryContents?.sectionListRenderer?.contents || [];
  const shelf = secContents.find(c => c.musicShelfRenderer)?.musicShelfRenderer;
  const trackItems = shelf?.contents || [];

  const tracks = [];
  trackItems.forEach((item, idx) => {
    const ir = item.musicResponsiveListItemRenderer;
    if (!ir) return;
    const trackTitle = ir.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
    const duration = ir.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text || null;
    const videoId = ir.playlistItemData?.videoId ||
                    ir.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
    const artists = ir.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
      ?.filter(r => r.navigationEndpoint?.browseEndpoint?.browseId)
      ?.map(r => ({ name: r.text, id: r.navigationEndpoint?.browseEndpoint?.browseId })) || [];

    tracks.push({
      trackNumber: idx + 1,
      title: trackTitle,
      videoId,
      duration,
      artists
    });
  });

  return {
    browseId,
    title,
    subtitle,
    secondSubtitle,
    thumbnail,
    thumbnails: thumbs,
    description,
    totalTracks: tracks.length,
    tracks
  };
}

export async function getArtist(browseIdOrUrl, options = {}) {
  const browseId = extractBrowseId(browseIdOrUrl);
  if (!browseId) throw new Error('Invalid artist browseId or URL');

  const res = await apiRequest('browse', { browseId }, options);
  const hdr = res.header?.musicImmersiveHeaderRenderer;
  const name = hdr?.title?.runs?.[0]?.text;
  const description = hdr?.description?.runs?.map(r => r.text).join('') || null;
  const thumbs = hdr?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : null;

  const sections = res.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const topSongs = [];
  const albums = [];
  const singles = [];
  const videos = [];
  const similarArtists = [];

  for (const s of sections) {
    if (s.musicShelfRenderer) {
      const items = s.musicShelfRenderer.contents || [];
      items.forEach(it => {
        const parsed = parseResponsiveItem(it);
        if (parsed) topSongs.push(parsed);
      });
    } else if (s.musicCarouselShelfRenderer) {
      const title = (s.musicCarouselShelfRenderer.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.map(r => r.text).join('') || '').toLowerCase();
      const items = s.musicCarouselShelfRenderer.contents || [];

      items.forEach(it => {
        const twoRow = it.musicTwoRowItemRenderer;
        if (!twoRow) return;

        const itTitle = twoRow.title?.runs?.[0]?.text;
        const itSubtitle = twoRow.subtitle?.runs?.map(r => r.text).join('') || '';
        const bId = twoRow.navigationEndpoint?.browseEndpoint?.browseId;
        const vId = twoRow.navigationEndpoint?.watchEndpoint?.videoId;
        const itThumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

        const obj = {
          title: itTitle,
          subtitle: itSubtitle,
          browseId: bId || null,
          videoId: vId || null,
          thumbnail: itThumbs.length ? itThumbs[itThumbs.length - 1].url : null
        };

        if (title.includes('album')) albums.push(obj);
        else if (title.includes('single') || title.includes('ep')) singles.push(obj);
        else if (title.includes('video')) videos.push(obj);
        else if (title.includes('fans might') || title.includes('similar')) similarArtists.push(obj);
      });
    }
  }

  return {
    browseId,
    name,
    description,
    thumbnail,
    thumbnails: thumbs,
    topSongs,
    albums,
    singles,
    videos,
    similarArtists
  };
}

export async function getPlaylist(browseIdOrUrl, options = {}) {
  const browseId = extractBrowseId(browseIdOrUrl);
  if (!browseId) throw new Error('Invalid playlist browseId or URL');

  const res = await apiRequest('browse', { browseId }, options);
  const tc = res.contents?.twoColumnBrowseResultsRenderer;

  const tabHdr = tc?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer;
  const title = tabHdr?.title?.runs?.[0]?.text;
  const subtitle = tabHdr?.subtitle?.runs?.map(r => r.text).join('') || '';
  const secondSubtitle = tabHdr?.secondSubtitle?.runs?.map(r => r.text).join('') || '';
  const description = tabHdr?.description?.musicDescriptionShelfRenderer?.description?.runs?.map(r => r.text).join('') || null;
  const thumbs = tabHdr?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : null;

  const rawTracks = tc?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer?.contents || [];

  const tracks = [];
  rawTracks.forEach((item, idx) => {
    const ir = item.musicResponsiveListItemRenderer;
    if (!ir) return;

    const trackTitle = ir.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
    const videoId = ir.playlistItemData?.videoId;
    const artists = ir.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
      ?.filter(r => r.navigationEndpoint?.browseEndpoint?.browseId)
      ?.map(r => ({ name: r.text, id: r.navigationEndpoint?.browseEndpoint?.browseId })) || [];
    const duration = ir.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text || null;
    const itThumbs = ir.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

    tracks.push({
      position: idx + 1,
      title: trackTitle,
      videoId,
      artists,
      duration,
      thumbnail: itThumbs.length ? itThumbs[itThumbs.length - 1].url : null
    });
  });

  return {
    browseId,
    title,
    subtitle,
    secondSubtitle,
    description,
    thumbnail,
    thumbnails: thumbs,
    totalTracks: tracks.length,
    tracks
  };
}

export async function getCharts(country = 'US', options = {}) {
  const res = await apiRequest('browse', { browseId: 'FEmusic_charts' });
  const sections = res.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const topArtists = [];

  sections.forEach(s => {
    const carousel = s.musicCarouselShelfRenderer;
    if (!carousel) return;
    const title = (carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.map(r => r.text).join('') || '').toLowerCase();
    if (!title.includes('artist')) return;
    const items = carousel.contents || [];

    items.forEach((it, idx) => {
      const twoRow = it.musicTwoRowItemRenderer;
      const ir = it.musicResponsiveListItemRenderer;

      if (twoRow) {
        const itemTitle = twoRow.title?.runs?.[0]?.text;
        const itemSubtitle = twoRow.subtitle?.runs?.map(r => r.text).join('') || '';
        const bId = twoRow.navigationEndpoint?.browseEndpoint?.browseId;
        const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

        topArtists.push({
          rank: idx + 1,
          name: itemTitle,
          subscribers: itemSubtitle,
          browseId: bId || null,
          thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : null
        });
      } else if (ir) {
        const itemTitle = ir.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const itemSubtitle = ir.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map(r => r.text).join('') || '';
        const bId = ir.navigationEndpoint?.browseEndpoint?.browseId ||
                    ir.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId;
        const thumbs = ir.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

        topArtists.push({
          rank: idx + 1,
          name: itemTitle,
          subscribers: itemSubtitle,
          browseId: bId || null,
          thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : null
        });
      }
    });
  });

  return {
    country,
    topArtists
  };
}

export async function getExplore(options = {}) {
  const res = await apiRequest('browse', { browseId: 'FEmusic_explore' });
  const sections = res.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  const categories = [];
  sections.forEach(s => {
    const carousel = s.musicCarouselShelfRenderer;
    if (!carousel) return;
    const title = carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.map(r => r.text).join('');
    const items = carousel.contents || [];

    const parsedItems = [];
    items.forEach(it => {
      const twoRow = it.musicTwoRowItemRenderer;
      if (twoRow) {
        const itTitle = twoRow.title?.runs?.[0]?.text;
        const itSubtitle = twoRow.subtitle?.runs?.map(r => r.text).join('') || '';
        const bId = twoRow.navigationEndpoint?.browseEndpoint?.browseId;
        const vId = twoRow.navigationEndpoint?.watchEndpoint?.videoId;
        const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

        parsedItems.push({
          title: itTitle,
          subtitle: itSubtitle,
          browseId: bId || null,
          videoId: vId || null,
          thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : null
        });
      }
    });

    if (title && parsedItems.length) {
      categories.push({
        title,
        items: parsedItems
      });
    }
  });

  return {
    totalCategories: categories.length,
    categories
  };
}


function convertToMp3(inputBuffer) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-vn',
      '-acodec', 'libmp3lame',
      '-b:a', '192k',
      '-f', 'mp3',
      'pipe:1'
    ], { stdio: ['pipe', 'pipe', 'ignore'] });

    const chunks = [];
    proc.stdout.on('data', chunk => chunks.push(chunk));
    proc.stdout.on('end', () => resolve(Buffer.concat(chunks)));
    proc.on('error', reject);
    proc.stdin.write(inputBuffer);
    proc.stdin.end();
  });
}

export async function download(urlOrId, options = {}) {
  const audio = await getAudioStream(urlOrId, options);
  if (!audio || !audio.url) {
    throw new Error('Failed to resolve audio stream for this track');
  }

  const effectiveId = audio.videoId || extractVideoId(urlOrId);
  const track = await getTrack(effectiveId, options).catch(() => ({}));

  const cleanTitle = (track.title || 'audio').replace(/[/\\?%*:|"<>]/g, '_');
  const cleanAuthor = (track.author || 'YouTube Music').replace(/[/\\?%*:|"<>]/g, '_');
  const wantMp3 = options.format?.toLowerCase() === 'mp3' || Boolean(options.whatsapp);
  const ext = wantMp3 ? 'mp3' : 'm4a';
  const filename = `${cleanAuthor} - ${cleanTitle}.${ext}`;

  const formatSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  let buffer = null;
  let savedPath = null;

  if (options.save || options.outputPath || options.buffer || wantMp3 || options.whatsapp) {
    const res = await fetch(audio.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) throw new Error(`Failed to download audio stream: HTTP ${res.status}`);
    const rawBuffer = Buffer.from(await res.arrayBuffer());

    if (wantMp3) {
      buffer = await convertToMp3(rawBuffer);
    } else {
      buffer = rawBuffer;
    }

    if (options.outputPath) {
      savedPath = options.outputPath;
      writeFileSync(savedPath, buffer);
    } else if (options.save) {
      savedPath = path.join('/tmp', filename);
      writeFileSync(savedPath, buffer);
    }
  }

  return {
    videoId: effectiveId,
    title: track.title || cleanTitle,
    artist: track.author || cleanAuthor,
    duration: track.duration || null,
    durationSeconds: track.durationSeconds || null,
    thumbnail: track.thumbnail || `https://i.ytimg.com/vi/${effectiveId}/hqdefault.jpg`,
    filename,
    format: ext,
    mimeType: wantMp3 ? 'audio/mpeg' : audio.mimeType,
    bitrate: audio.bitrate,
    size: buffer ? buffer.length : audio.contentLength,
    formattedSize: formatSize(buffer ? buffer.length : audio.contentLength),
    downloadUrl: audio.url,
    ...(savedPath ? { savedPath } : {}),
    ...(options.buffer || options.whatsapp ? { buffer } : {})
  };
}

export async function getThumbnail(urlOrId, options = {}) {
  const videoId = extractVideoId(urlOrId);
  const browseId = !videoId ? extractBrowseId(urlOrId) : null;

  if (!videoId && !browseId) {
    throw new Error('Invalid YouTube Music video ID, browse ID, or URL');
  }

  let title = '';
  let rawThumbnail = null;
  let allThumbnails = [];

  if (videoId) {
    const track = await getTrack(videoId);
    title = track.title || videoId;
    rawThumbnail = track.thumbnail;
    allThumbnails = track.thumbnails || [];
  } else if (browseId.startsWith('MPREb_')) {
    const album = await getAlbum(browseId);
    title = album.title || browseId;
    rawThumbnail = album.thumbnail;
    allThumbnails = album.thumbnails || [];
  } else if (browseId.startsWith('UC')) {
    const artist = await getArtist(browseId);
    title = artist.name || browseId;
    rawThumbnail = artist.thumbnail;
    allThumbnails = artist.thumbnails || [];
  } else if (browseId.startsWith('VL')) {
    const playlist = await getPlaylist(browseId);
    title = playlist.title || browseId;
    rawThumbnail = playlist.thumbnail;
    allThumbnails = playlist.thumbnails || [];
  }

  let ultraHd = rawThumbnail;
  let hd = rawThumbnail;
  let medium = rawThumbnail;
  let small = rawThumbnail;

  if (rawThumbnail && rawThumbnail.includes('googleusercontent.com')) {
    ultraHd = rawThumbnail.replace(/=w\d+-h\d+.*$/, '=w1200-h1200-l90-rj');
    hd = rawThumbnail.replace(/=w\d+-h\d+.*$/, '=w544-h544-l90-rj');
    medium = rawThumbnail.replace(/=w\d+-h\d+.*$/, '=w226-h226-l90-rj');
    small = rawThumbnail.replace(/=w\d+-h\d+.*$/, '=w120-h120-l90-rj');
  } else if (videoId) {
    ultraHd = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    hd = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    medium = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    small = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
  }

  const selectedQuality = (options.quality || 'ultra_hd').toLowerCase();
  const selectedUrl = selectedQuality === 'small' ? small :
                      selectedQuality === 'medium' ? medium :
                      selectedQuality === 'hd' ? hd : ultraHd;

  let buffer = null;
  let savedPath = null;

  if (options.save || options.outputPath || options.buffer) {
    const res = await fetch(selectedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`Failed to fetch thumbnail: HTTP ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());

    if (options.outputPath) {
      savedPath = options.outputPath;
      writeFileSync(savedPath, buffer);
    } else if (options.save) {
      const cleanName = (title || 'thumbnail').replace(/[/\\?%*:|"<>]/g, '_');
      savedPath = path.join('/tmp', `${cleanName}.jpg`);
      writeFileSync(savedPath, buffer);
    }
  }

  return {
    id: videoId || browseId,
    title,
    quality: selectedQuality,
    url: selectedUrl,
    sizes: {
      ultraHd,
      hd,
      medium,
      small
    },
    allThumbnails,
    ...(savedPath ? { savedPath } : {}),
    ...(options.buffer || options.whatsapp ? { buffer } : {})
  };
}

export default {
  parseCookies,
  getThumbnail,
  download,
  getInnertubeConfig,
  extractVideoId,
  extractBrowseId,
  search,
  getTrack,
  getAudioStream,
  getLyrics,
  getQueue,
  getAlbum,
  getArtist,
  getPlaylist,
  getCharts,
  getExplore
};
