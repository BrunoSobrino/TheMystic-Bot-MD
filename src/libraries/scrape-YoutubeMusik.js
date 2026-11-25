/**
 * Name : youtube-music
 * Creator : Razeerh
 * Source : https://whatsapp.com/channel/0029VbCN4sQLo4hhDCkOHX1m
 * Base Web/Apps : https://music.youtube.com/
 * Type : Scraper/JSON
 * Description : YouTube Music scraper for home, explore, charts, search, suggestions, artists, albums, playlists, songs, lyrics, related tracks, and direct audio/video stream URLs.
 * Note : Menggunakan WEB_REMIX InnerTube untuk penelusuran/pencarian dan pemutar IOS InnerTube untuk URL streaming langsung. Tidak diperlukan penguraian tanda tangan, URL stream kadaluarsa sekitar 6 jam. panggil ulang stream () atau audio () untuk URL baru. Btw ini udah lengkap (harusnya), error fix sendiri.
 **/

const API = 'https://music.youtube.com/youtubei/v1';
const KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30';
const VERSION = '1.20261117.06.00';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const IOS_VERSION = '21.03.38';
const IOS_UA = 'com.google.ios.youtube/21.03.38 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X;)';
const CONTEXT = {
  client: {
    clientName: 'WEB_REMIX',
    clientVersion: VERSION,
    hl: 'en',
    gl: 'ID',
    userAgent: UA,
    platform: 'DESKTOP',
    browserName: 'Chrome',
    browserVersion: '124.0.0.0',
    osName: 'Windows',
    osVersion: '10.0'
  },
  user: { lockedSafetyMode: false },
  request: { useSsl: true }
};
const IOS_CONTEXT = {
  client: {
    clientName: 'IOS',
    clientVersion: IOS_VERSION,
    deviceModel: 'iPhone16,2',
    hl: 'en',
    gl: 'ID',
    userAgent: IOS_UA,
    osName: 'iPhone',
    osVersion: '18.1.0.22B83'
  },
  user: { lockedSafetyMode: false },
  request: { useSsl: true }
};
const IOS_HEADERS = {
  'X-YouTube-Client-Name': '5',
  'X-YouTube-Client-Version': IOS_VERSION,
  'User-Agent': IOS_UA
};
const FILTERS = {
  all: '',
  songs: 'EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D',
  videos: 'EgWKAQIQAWoKEAkQChAFEAMQBA%3D%3D',
  albums: 'EgWKAQIYAWoKEAkQChAFEAMQBA%3D%3D',
  artists: 'EgWKAQIgAWoKEAkQChAFEAMQBA%3D%3D',
  playlists: 'EgWKAQIoAWoKEAkQChAFEAMQBA%3D%3D',
  community_playlists: 'EgeKAQQoAEABahIQBRADEAkQBBAKEBUQDhAQEBE%3D',
  featured_playlists: 'EgeKAQQoADgBahIQBRADEAkQBBAKEBUQDhAQEBE%3D',
  profiles: 'EgWKAQJYAWoSEAUQAxAJEAQQChAVEA4QEBAR',
  episodes: 'EgWKAQJIAWoSEAUQAxAJEAQQChAVEA4QEBAR',
  podcasts: 'EgWKAQJQAWoSEAUQAxAJEAQQChAVEA4QEBAR'
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(endpoint, body, options = {}) {
  const response = await fetch(`${API}/${endpoint}?key=${KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-YouTube-Client-Name': '67',
      'X-YouTube-Client-Version': VERSION,
      Origin: 'https://music.youtube.com',
      Referer: 'https://music.youtube.com/',
      'User-Agent': UA,
      ...options.headers
    },
    body: JSON.stringify({ context: options.context ?? CONTEXT, ...body })
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function getPlayer(videoId) {
  return request('player', {
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
    playbackContext: { contentPlaybackContext: { html5Preference: 'HTML5_PREF_WANTS' } }
  }, { context: IOS_CONTEXT, headers: IOS_HEADERS });
}

function ensurePlayable(player) {
  const playability = player?.playabilityStatus ?? {};

  if (!playability.status || playability.status === 'OK') return;

  const error = new Error(playability.reason ?? `Playability status ${playability.status}`);
  const codes = { UNPLAYABLE: 403, LOGIN_REQUIRED: 403, ERROR: 404, LIVE_STREAM_OFFLINE: 404 };
  error.status = codes[playability.status] ?? 500;
  throw error;
}

function errorResponse(error, extra = {}) {
  const status = error?.status ?? 500;
  const labels = {
    400: 'Bad Request',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };
  const response = labels[status] ?? 'Error';

  return [
    { status, response, ...extra, error: `ERROR ${status} ${response}: ${error?.message ?? 'Unknown error'}` },
    { data: [] }
  ];
}

const ok = (data, extra = {}) => [{ status: 200, response: 'OK', ...extra }, { data }];
const text = (value) => value?.runs?.map((run) => run.text ?? '').join('') ?? value?.simpleText ?? '';
const pageTypeOf = (browse) => browse?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType ?? null;
const videoTypeOf = (watch) => watch?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType ?? null;
const thumbs = (renderer) => (
  renderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
  ?? renderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails
  ?? renderer?.thumbnail?.thumbnails
  ?? renderer?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails
  ?? []
).map(({ url, width, height }) => ({ url, width, height }));

function continuation(value) {
  const next = value?.continuations?.[0];
  const token = next?.nextContinuationData?.continuation
    ?? next?.nextRadioContinuationData?.continuation;

  if (token) return token;

  const items = value?.contents ?? value?.items ?? [];
  return items.at(-1)?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token ?? null;
}

const year = (value) => {
  const match = value?.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
};
const stat = (values) => values
  .map((value) => value?.match(/([\d.,]+[KMB]?)\s+(plays|views|monthly audience|subscribers)/i)?.[0])
  .find(Boolean) ?? null;

function artists(runs = []) {
  const seen = new Set();

  return runs.flatMap((run) => {
    const browse = run.navigationEndpoint?.browseEndpoint;
    const name = run.text?.trim();

    if (pageTypeOf(browse) !== 'MUSIC_PAGE_TYPE_ARTIST' || !name || seen.has(browse.browseId)) return [];

    seen.add(browse.browseId);
    return [{ name, id: browse.browseId }];
  });
}

function albumOf(runs = []) {
  const run = runs.find((item) => pageTypeOf(item.navigationEndpoint?.browseEndpoint) === 'MUSIC_PAGE_TYPE_ALBUM');

  return run ? { name: run.text, id: run.navigationEndpoint.browseEndpoint.browseId } : null;
}

function durationOf(values) {
  const match = values.map((value) => value?.match(/\b(\d{1,2}):(\d{2})\b/)).find(Boolean);

  return match
    ? { text: match[0], seconds: Number(match[1]) * 60 + Number(match[2]) }
    : { text: null, seconds: null };
}

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(Number(seconds))) return null;

  const total = Number(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

function parseStreamFormat(format) {
  return {
    itag: format.itag ?? null,
    mimeType: format.mimeType ?? null,
    codecs: format.mimeType?.match(/codecs="([^"]+)"/)?.[1] ?? null,
    bitrate: format.bitrate ?? null,
    averageBitrate: format.averageBitrate ?? null,
    quality: format.quality ?? null,
    audioQuality: format.audioQuality ?? null,
    audioSampleRate: format.audioSampleRate ? Number(format.audioSampleRate) : null,
    audioChannels: format.audioChannels ?? null,
    qualityLabel: format.qualityLabel ?? null,
    width: format.width ?? null,
    height: format.height ?? null,
    fps: format.fps ?? null,
    contentLength: format.contentLength ? Number(format.contentLength) : null,
    approxDurationMs: format.approxDurationMs ? Number(format.approxDurationMs) : null,
    lastModified: format.lastModified ?? null,
    loudnessDb: format.loudnessDb ?? null,
    url: format.url ?? null
  };
}

function parseStreamingData(streamingData) {
  const formats = [
    ...(streamingData?.formats ?? []),
    ...(streamingData?.adaptiveFormats ?? [])
  ];
  const expiresInSeconds = streamingData?.expiresInSeconds
    ? Number(streamingData.expiresInSeconds)
    : null;
  const audio = formats.filter((format) => format.mimeType?.startsWith('audio/')).map(parseStreamFormat);
  const video = formats.filter((format) => format.mimeType?.startsWith('video/')).map(parseStreamFormat);
  const best = (list) => list.reduce((top, format) => (
    !top || (format.bitrate ?? 0) > (top.bitrate ?? 0) ? format : top
  ), null);

  return {
    expiresInSeconds,
    expiresAt: expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000).toISOString() : null,
    bestAudio: best(audio),
    bestVideo: best(video),
    audio,
    video,
    serverAbrStreamingUrl: streamingData?.serverAbrStreamingUrl ?? null
  };
}

function detectType({ pageType, videoType, subtitle }) {
  if (videoType === 'MUSIC_VIDEO_TYPE_ATV') return 'song';
  if (videoType === 'MUSIC_VIDEO_TYPE_OMV' || videoType === 'MUSIC_VIDEO_TYPE_UGC') return 'video';

  const label = subtitle.split('•')[0].trim().toLowerCase();

  if (pageType === 'MUSIC_PAGE_TYPE_ALBUM') {
    return label === 'single' || label === 'ep' ? label : 'album';
  }

  const types = {
    MUSIC_PAGE_TYPE_ARTIST: 'artist',
    MUSIC_PAGE_TYPE_PLAYLIST: 'playlist',
    MUSIC_PAGE_TYPE_USER_CHANNEL: 'profile',
    MUSIC_PAGE_TYPE_PODCAST: 'podcast',
    MUSIC_PAGE_TYPE_NON_MUSIC_AUDIO_TRACK_PAGE: 'episode'
  };

  if (types[pageType]) return types[pageType];

  const known = ['song', 'video', 'album', 'single', 'ep', 'playlist', 'artist', 'profile', 'podcast', 'episode'];
  return known.includes(label) ? label : 'unknown';
}

function buildUrl({ videoId, browseId, playlistId } = {}) {
  if (videoId) return `https://music.youtube.com/watch?v=${videoId}`;
  if (playlistId) return `https://music.youtube.com/playlist?list=${playlistId}`;
  if (browseId?.startsWith('VL')) return `https://music.youtube.com/playlist?list=${browseId.slice(2)}`;
  if (browseId?.startsWith('UC')) return `https://music.youtube.com/channel/${browseId}`;
  return browseId ? `https://music.youtube.com/browse/${browseId}` : null;
}

function parseHeader(header) {
  if (!header) return null;

  const subtitle = text(header.subtitle);
  const secondSubtitle = text(header.secondSubtitle);
  const track = secondSubtitle.match(/([\d,]+)\s+(?:songs?|tracks?|episodes?|videos?)/i);
  const plays = secondSubtitle.match(/([\d.,]+[KMB]?)\s+(?:views?|plays?)/i);
  const duration = secondSubtitle.match(/((?:\d+\s+)?(?:hours?|minutes?|seconds?)(?:,\s*)?)+/i);

  return {
    title: text(header.title),
    subtitle,
    secondSubtitle,
    type: subtitle.split('•')[0].trim() || 'Artist',
    year: year(subtitle),
    trackCount: track ? Number(track[1].replace(/,/g, '')) : null,
    plays: plays?.[0] ?? null,
    duration: duration?.[0].trim() ?? null,
    description: text(header.description) || text(header.description?.musicDescriptionShelfRenderer?.description),
    subscribers: text(header.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText) || null,
    author: header.facepile?.avatarStackViewModel?.rendererContext?.accessibilityContext?.label ?? null,
    artists: artists(header.straplineTextOne?.runs ?? []),
    thumbnails: thumbs(header)
  };
}

function parseResponsiveItem(item) {
  const columns = (item.flexColumns ?? []).map((column) => column.musicResponsiveListItemFlexColumnRenderer?.text);
  const flex = columns.map(text);
  const fixed = (item.fixedColumns ?? []).map((column) => text(column.musicResponsiveListItemFlexColumnRenderer?.text));
  const runs = columns.flatMap((column) => column?.runs ?? []);
  const play = item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint;
  const watch = play?.watchEndpoint
    ?? item.navigationEndpoint?.watchEndpoint
    ?? runs.find((run) => run.navigationEndpoint?.watchEndpoint)?.navigationEndpoint?.watchEndpoint
    ?? null;
  const browse = item.navigationEndpoint?.browseEndpoint
    ?? runs.find((run) => run.navigationEndpoint?.browseEndpoint)?.navigationEndpoint?.browseEndpoint
    ?? null;
  const subtitle = flex[1] ?? '';
  const duration = durationOf([...flex, ...fixed]);
  const playlistId = play?.watchPlaylistEndpoint?.playlistId ?? watch?.playlistId ?? null;

  return {
    type: detectType({ pageType: pageTypeOf(browse), videoType: videoTypeOf(watch), subtitle }),
    id: watch?.videoId ?? browse?.browseId ?? playlistId,
    title: flex[0] ?? '',
    subtitle,
    artists: artists(runs),
    album: albumOf(runs),
    duration: duration.text,
    durationSeconds: duration.seconds,
    plays: stat([...flex, ...fixed]),
    year: year(subtitle),
    index: watch?.index ?? null,
    thumbnails: thumbs(item),
    url: buildUrl({ videoId: watch?.videoId, browseId: browse?.browseId, playlistId }),
    explicit: (item.badges ?? []).some((badge) => badge.musicInlineBadgeRenderer?.icon?.iconType === 'MUSIC_EXPLICIT_BADGE')
  };
}

function parseTwoRowItem(item) {
  const navigation = item.navigationEndpoint
    ?? item.title?.runs?.find((run) => run.navigationEndpoint)?.navigationEndpoint
    ?? null;
  const browse = navigation?.browseEndpoint ?? null;
  const watch = navigation?.watchEndpoint ?? null;
  const subtitle = text(item.subtitle);
  const runs = item.subtitle?.runs ?? [];
  const duration = durationOf([subtitle]);

  return {
    type: detectType({ pageType: pageTypeOf(browse), videoType: videoTypeOf(watch), subtitle }),
    id: watch?.videoId ?? browse?.browseId ?? null,
    title: text(item.title),
    subtitle,
    artists: artists(runs),
    album: albumOf(runs),
    duration: duration.text,
    durationSeconds: duration.seconds,
    plays: stat([subtitle]),
    year: year(subtitle),
    thumbnails: thumbs(item),
    url: buildUrl({ videoId: watch?.videoId, browseId: browse?.browseId }),
    explicit: (item.badges ?? []).some((badge) => badge.musicInlineBadgeRenderer?.icon?.iconType === 'MUSIC_EXPLICIT_BADGE')
  };
}

function parseCardShelf(item) {
  const navigation = item.title?.runs?.find((run) => run.navigationEndpoint)?.navigationEndpoint ?? null;
  const browse = navigation?.browseEndpoint ?? null;
  const watch = navigation?.watchEndpoint ?? null;
  const subtitle = text(item.subtitle);

  return {
    type: detectType({ pageType: pageTypeOf(browse), videoType: videoTypeOf(watch), subtitle }),
    id: watch?.videoId ?? browse?.browseId ?? null,
    title: text(item.title),
    subtitle,
    artists: artists(item.subtitle?.runs ?? []),
    year: year(subtitle),
    thumbnails: thumbs(item),
    url: buildUrl({ videoId: watch?.videoId, browseId: browse?.browseId }),
    items: (item.contents ?? []).map(parseItem).filter(Boolean)
  };
}

function parseNavigationButton(item) {
  const browse = item.clickCommand?.browseEndpoint ?? null;

  return {
    type: 'navigation',
    id: browse?.browseId ?? null,
    title: text(item.buttonText),
    params: browse?.params ?? null,
    url: buildUrl({ browseId: browse?.browseId })
  };
}

function parsePlaylistPanelItem(item) {
  const subtitle = text(item.longBylineText);
  const duration = durationOf([text(item.lengthText)]);
  const watch = item.navigationEndpoint?.watchEndpoint ?? null;

  return {
    type: detectType({ videoType: videoTypeOf(watch), subtitle }),
    id: item.videoId ?? null,
    title: text(item.title),
    subtitle,
    artists: artists(item.longBylineText?.runs ?? []),
    album: albumOf(item.longBylineText?.runs ?? []),
    duration: duration.text,
    durationSeconds: duration.seconds,
    year: year(subtitle),
    thumbnails: thumbs({ thumbnail: { thumbnails: item.thumbnail?.thumbnails } }),
    url: buildUrl({ videoId: item.videoId })
  };
}

function parseItem(renderer) {
  if (!renderer) return null;
  if (renderer.musicResponsiveListItemRenderer) return parseResponsiveItem(renderer.musicResponsiveListItemRenderer);
  if (renderer.musicTwoRowItemRenderer) return parseTwoRowItem(renderer.musicTwoRowItemRenderer);
  if (renderer.musicCardShelfRenderer) return parseCardShelf(renderer.musicCardShelfRenderer);
  if (renderer.musicNavigationButtonRenderer) return parseNavigationButton(renderer.musicNavigationButtonRenderer);
  if (renderer.playlistPanelVideoRenderer) return parsePlaylistPanelItem(renderer.playlistPanelVideoRenderer);
  return null;
}

function sectionLists(data) {
  const root = data?.contents ?? {};
  const tabs = root.singleColumnBrowseResultsRenderer?.tabs
    ?? root.twoColumnBrowseResultsRenderer?.tabs
    ?? root.tabbedSearchResultsRenderer?.tabs
    ?? [];
  const lists = [
    root.sectionListRenderer,
    ...tabs.map((tab) => tab.tabRenderer?.content?.sectionListRenderer),
    root.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer
  ];

  return [...new Set(lists.filter(Boolean))];
}

function findHeader(data) {
  const root = data?.contents ?? {};
  const tabs = root.singleColumnBrowseResultsRenderer?.tabs
    ?? root.twoColumnBrowseResultsRenderer?.tabs
    ?? [];

  for (const tab of tabs) {
    for (const section of tab.tabRenderer?.content?.sectionListRenderer?.contents ?? []) {
      const key = Object.keys(section)[0];

      if (key === 'musicResponsiveHeaderRenderer' || key === 'musicDetailHeaderRenderer') {
        return section[key];
      }
    }
  }

  return data.header?.musicImmersiveHeaderRenderer
    ?? data.header?.musicVisualHeaderRenderer
    ?? null;
}

function parseSections(data, fallbackTitle = '') {
  const sections = [];

  for (const list of sectionLists(data)) {
    for (const section of list.contents ?? []) {
      const key = Object.keys(section)[0];
      const value = section[key];

      if (key === 'musicCarouselShelfRenderer') {
        const items = (value.contents ?? []).map(parseItem).filter(Boolean);
        if (!items.length) continue;

        sections.push({
          title: text(value.header?.musicCarouselShelfBasicHeaderRenderer?.title),
          subtitle: text(value.header?.musicCarouselShelfBasicHeaderRenderer?.strapline),
          items
        });
      } else if (key === 'musicShelfRenderer' || key === 'musicPlaylistShelfRenderer') {
        const items = (value.contents ?? []).map(parseItem).filter(Boolean);
        if (!items.length) continue;

        sections.push({
          title: text(value.header?.musicShelfBasicHeaderRenderer?.title) || fallbackTitle,
          items,
          continuation: continuation(value)
        });
      } else if (key === 'gridRenderer' || key === 'itemSectionRenderer') {
        const items = (value.contents ?? value.items ?? []).map(parseItem).filter(Boolean);
        if (!items.length) continue;

        sections.push({ title: fallbackTitle, items });
      } else if (key === 'musicDescriptionShelfRenderer') {
        const description = text(value.description);
        if (!description) continue;

        sections.push({ title: 'About', description, footer: text(value.footer) || null });
      }
    }
  }

  return sections;
}

function parseSearchResults(data) {
  let topResult = null;
  let token = null;
  const results = [];

  for (const list of sectionLists(data)) {
    for (const section of list.contents ?? []) {
      const key = Object.keys(section)[0];
      const value = section[key];

      if (key === 'musicCardShelfRenderer') {
        topResult = parseCardShelf(value);
      } else if (key === 'musicShelfRenderer' || key === 'musicPlaylistShelfRenderer') {
        results.push(...(value.contents ?? []).map(parseItem).filter(Boolean));
        token ??= continuation(value);
      } else if (key === 'itemSectionRenderer') {
        results.push(...(value.contents ?? []).map(parseItem).filter(Boolean));
      }
    }
  }

  return { topResult, results, continuation: token };
}

function parseContinuation(data) {
  const shelf = data.continuationContents?.musicPlaylistShelfContinuation
    ?? data.continuationContents?.musicShelfContinuation;

  if (shelf) {
    return {
      items: (shelf.contents ?? []).map(parseItem).filter(Boolean),
      continuation: continuation(shelf)
    };
  }

  const items = data.onResponseReceivedActions?.find((action) => action.appendContinuationItemsAction)?.appendContinuationItemsAction?.continuationItems;

  return items
    ? { items: items.map(parseItem).filter(Boolean), continuation: continuation({ contents: items }) }
    : null;
}

const getTabPageType = (tab) => pageTypeOf(tab?.tabRenderer?.endpoint?.browseEndpoint);

async function getLyrics(browseId) {
  const data = await request('browse', { browseId });
  const shelf = (data.contents?.sectionListRenderer?.contents ?? [])
    .find((section) => section.musicDescriptionShelfRenderer)?.musicDescriptionShelfRenderer;

  return shelf ? { text: text(shelf.description), source: text(shelf.footer) || null } : null;
}

async function getRelated(browseId) {
  const data = await request('browse', { browseId });
  return parseSections(data, 'Related').flatMap((section) => section.items ?? []);
}

async function browseSections(browseId, fallbackTitle = '') {
  try {
    const data = await request('browse', { browseId });
    return ok(parseSections(data, fallbackTitle));
  } catch (error) {
    return errorResponse(error);
  }
}

export const home = () => browseSections('FEmusic_home');
export const explore = () => browseSections('FEmusic_explore', 'Browse');
export const charts = () => browseSections('FEmusic_charts');

export async function search(query, filter = 'all', page = 1, token = '') {
  try {
    if (!query && !token) throw new Error('query is required');

    const params = FILTERS[filter];

    if (params === undefined) throw new Error(`Unknown filter: ${filter}`);

    const data = await request('search', token ? { continuation: token } : { query, ...(params ? { params } : {}) });

    if (token) {
      const parsed = parseContinuation(data);

      return ok([
        { query, filter, results: parsed?.items ?? [], continuation: parsed?.continuation ?? null }
      ], { page, continuation: parsed?.continuation ?? null });
    }

    const parsed = parseSearchResults(data);

    return ok([
      { query, filter, topResult: parsed.topResult, results: parsed.results, continuation: parsed.continuation }
    ], { page, continuation: parsed.continuation });
  } catch (error) {
    return errorResponse(error, { page });
  }
}

export async function suggestions(query) {
  try {
    if (!query) throw new Error('query is required');

    const data = await request('music/get_search_suggestions', { input: query });
    const items = (data.contents ?? []).flatMap((section) => (
      section.searchSuggestionsSectionRenderer?.contents ?? []
    ).map((item) => ({ query: text(item.searchSuggestionRenderer?.suggestion) }))).filter((item) => item.query);

    return ok(items);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function artist(browseId) {
  try {
    if (!browseId) throw new Error('browseId is required');

    const data = await request('browse', { browseId });
    const header = parseHeader(findHeader(data));

    return ok([{
      type: 'artist',
      id: browseId,
      name: header?.title ?? '',
      description: header?.description ?? '',
      subscribers: header?.subscribers ?? null,
      thumbnails: header?.thumbnails ?? [],
      url: buildUrl({ browseId }),
      sections: parseSections(data, 'Songs')
    }]);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function album(browseId, page = 1, token = '') {
  try {
    if (!browseId && !token) throw new Error('browseId is required');

    const data = await request('browse', token ? { continuation: token } : { browseId });

    if (token) {
      const parsed = parseContinuation(data);
      return ok([{ tracks: parsed?.items ?? [] }], { page, continuation: parsed?.continuation ?? null });
    }

    const header = parseHeader(findHeader(data));
    const sections = parseSections(data, 'Tracks');
    const trackSection = sections.find((section) => section.title === 'Tracks' && section.items?.length)
      ?? sections.find((section) => section.items?.length);
    const tracks = (trackSection?.items ?? []).map((track) => ({
      ...track,
      album: track.album ?? (header ? { name: header.title, id: browseId } : null),
      artists: track.artists?.length ? track.artists : (header?.artists ?? []),
      thumbnails: track.thumbnails?.length ? track.thumbnails : (header?.thumbnails ?? [])
    }));
    const label = header?.type?.toLowerCase();
    const type = label === 'single' ? 'single' : label === 'ep' ? 'ep' : 'album';
    const next = trackSection?.continuation ?? null;

    return ok([{
      type,
      id: browseId,
      title: header?.title ?? '',
      year: header?.year ?? null,
      trackCount: header?.trackCount ?? tracks.length,
      duration: header?.duration ?? null,
      description: header?.description ?? '',
      artists: header?.artists ?? [],
      thumbnails: header?.thumbnails ?? [],
      url: buildUrl({ browseId }),
      tracks,
      sections: sections.filter((section) => section !== trackSection && section.items?.length),
      continuation: next
    }], { page, continuation: next });
  } catch (error) {
    return errorResponse(error, { page });
  }
}

export async function playlist(browseId, page = 1, token = '') {
  try {
    if (!browseId && !token) throw new Error('browseId is required');

    const id = token ? null : (browseId.startsWith('VL') ? browseId : `VL${browseId}`);
    const data = await request('browse', token ? { continuation: token } : { browseId: id });

    if (token) {
      const parsed = parseContinuation(data);
      return ok([{ tracks: parsed?.items ?? [] }], { page, continuation: parsed?.continuation ?? null });
    }

    const header = parseHeader(findHeader(data));
    const sections = parseSections(data, 'Tracks');
    const trackSection = sections.find((section) => section.title === 'Tracks' && section.items?.length)
      ?? sections.find((section) => section.items?.length);
    const tracks = trackSection?.items ?? [];
    const next = trackSection?.continuation ?? null;

    return ok([{
      type: 'playlist',
      id: id.slice(2),
      browseId: id,
      title: header?.title ?? '',
      author: header?.author ?? null,
      year: header?.year ?? null,
      plays: header?.plays ?? null,
      trackCount: header?.trackCount ?? tracks.length,
      duration: header?.duration ?? null,
      description: header?.description ?? '',
      thumbnails: header?.thumbnails ?? [],
      url: buildUrl({ browseId: id }),
      tracks,
      sections: sections.filter((section) => section !== trackSection && section.items?.length),
      continuation: next
    }], { page, continuation: next });
  } catch (error) {
    return errorResponse(error, { page });
  }
}

export async function song(videoId) {
  try {
    if (!videoId) throw new Error('videoId is required');

    const player = await getPlayer(videoId);
    ensurePlayable(player);
    await delay(250);

    const next = await request('next', { videoId });
    const tabs = next.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs ?? [];
    const queue = (tabs.find((tab) => tab.tabRenderer?.content?.musicQueueRenderer)
      ?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents ?? [])
      .map(parseItem)
      .filter(Boolean);
    const current = queue.find((item) => item.id === videoId) ?? queue[0] ?? null;
    const lyricsTab = tabs.find((tab) => getTabPageType(tab) === 'MUSIC_PAGE_TYPE_TRACK_LYRICS');
    const relatedTab = tabs.find((tab) => getTabPageType(tab) === 'MUSIC_PAGE_TYPE_TRACK_RELATED');

    await delay(250);

    const settled = await Promise.allSettled([
      lyricsTab ? getLyrics(lyricsTab.tabRenderer.endpoint.browseEndpoint.browseId) : Promise.resolve(null),
      relatedTab ? getRelated(relatedTab.tabRenderer.endpoint.browseEndpoint.browseId) : Promise.resolve([])
    ]);
    const lyrics = settled[0].status === 'fulfilled' ? settled[0].value : null;
    const related = settled[1].status === 'fulfilled' ? settled[1].value : [];
    const details = player.videoDetails ?? {};
    const durationSeconds = details.lengthSeconds ? Number(details.lengthSeconds) : current?.durationSeconds ?? null;

    return ok([{
      type: current?.type ?? 'song',
      id: videoId,
      title: details.title ?? current?.title ?? '',
      artists: current?.artists?.length
        ? current.artists
        : details.author
          ? [{ name: details.author, id: details.channelId ?? null }]
          : [],
      album: current?.album ?? null,
      duration: formatDuration(durationSeconds),
      durationSeconds,
      views: details.viewCount ? Number(details.viewCount) : null,
      thumbnails: details.thumbnail?.thumbnails ?? current?.thumbnails ?? [],
      description: details.shortDescription ?? '',
      tags: details.keywords ?? [],
      isLive: details.isLiveContent ?? false,
      url: buildUrl({ videoId }),
      lyrics,
      related,
      upNext: queue.filter((item) => item.id !== videoId),
      stream: parseStreamingData(player.streamingData)
    }]);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function stream(videoId) {
  try {
    if (!videoId) throw new Error('videoId is required');

    const player = await getPlayer(videoId);
    ensurePlayable(player);

    const details = player.videoDetails ?? {};
    const durationSeconds = details.lengthSeconds ? Number(details.lengthSeconds) : null;
    const streams = parseStreamingData(player.streamingData);

    return ok([{
      id: videoId,
      title: details.title ?? '',
      author: details.author ?? null,
      channelId: details.channelId ?? null,
      duration: formatDuration(durationSeconds),
      durationSeconds,
      views: details.viewCount ? Number(details.viewCount) : null,
      thumbnails: details.thumbnail?.thumbnails ?? [],
      description: details.shortDescription ?? '',
      tags: details.keywords ?? [],
      isLive: details.isLiveContent ?? false,
      isPrivate: details.isPrivate ?? false,
      url: buildUrl({ videoId }),
      ...streams
    }]);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function audio(videoId) {
  const [meta, result] = await stream(videoId);

  if (meta.status !== 200) return [meta, result];

  const item = result.data[0];

  return ok([{
    id: item.id,
    title: item.title,
    author: item.author,
    duration: item.duration,
    durationSeconds: item.durationSeconds,
    expiresInSeconds: item.expiresInSeconds,
    expiresAt: item.expiresAt,
    best: item.bestAudio,
    audio: item.audio,
    serverAbrStreamingUrl: item.serverAbrStreamingUrl
  }]);
}

// Usage:
// import { home, explore, charts, search, suggestions, artist, album, playlist, song, stream, audio } from './youtube-music.js';
//
// const homeData = await home();
// const exploreData = await explore();
// const chartsData = await charts();
// const searchData = await search('coldplay', 'songs');
// const suggestionsData = await suggestions('cold');
// const artistData = await artist('UCIaFw5VBEK8qaW6nRpx_qnw');
// const albumData = await album('MPREb_oBucXyijinj');
// const playlistData = await playlist('PLfOOT_t91UDhq6JJO_U4PqqcBISJvJP1W');
// const songData = await song('9qnqYL0eNNI');
// const streamData = await stream('9qnqYL0eNNI');
// const audioData = await audio('9qnqYL0eNNI');
//
// Note: Stream URLs expire (usually ~6 hours). Re-call stream() or audio() for fresh URLs.
