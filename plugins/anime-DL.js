// plugins/anime-DL.js
// Comandos:
//   .anilist                        → muestra los sitios disponibles numerados
//   .animedl <url>                  → descarga desde URL directa
//   .animedl <nombre> <ep>          → busca en todos (temporada 1 por defecto)
//   .animedl <nombre> t<N> <ep>     → busca temporada N específica
//   .animedl <S> <nombre> <ep>      → busca en el sitio número S
//   .animedl <S> <nombre> t<N> <ep> → sitio S + temporada N
//   .cancelar / .stop               → cancela descarga activa (responder al mensaje)
//   .animedl <mega url>             → descarga desde Mega
//   .animedl <mediafire url>        → descarga desde MediaFire
//
//   Ejemplos:
//   .animedl shingeki no kyojin t4 1
//   .animedl 1 oshi no ko t2 3
//   .animedl 6 one piece 1100

import { exec }       from 'child_process'
import { promisify }  from 'util'
import fs             from 'fs'
import path           from 'path'
import fetch          from 'node-fetch'
import * as cheerio   from 'cheerio'
import puppeteerExtra from 'puppeteer-extra'
import StealthPlugin  from 'puppeteer-extra-plugin-stealth'
import { File as MegaFile } from 'megajs'
import { lookup as mimeLookup } from 'mime-types'
import { pipeline }   from 'stream/promises'
import https          from 'https'

puppeteerExtra.use(StealthPlugin())

const execAsync  = promisify(exec)
const httpsAgent = new https.Agent({ keepAlive: true, maxFreeSockets: 20 })
global.activeDownloads = global.activeDownloads || new Map()

// ─── CATÁLOGO DE SITIOS (usado por .anilist y .animedl N) ──────────────────

const SITIOS = [
  {
    id: 1,
    nombre: 'AnimeFLV',
    dominio: 'animeflv',
    url: 'https://www3.animeflv.net',
    buscar: buscarEnAnimeFLV,
    scrape: scrapeAnimeFLV,
  },
  {
    id: 2,
    nombre: 'VerAnimes',
    dominio: 'veranimes',
    url: 'https://wwv.veranimes.net',
    buscar: buscarEnVerAnimes,
    scrape: scrapeVerAnimes,
  },
  {
    id: 3,
    nombre: 'LatAnime',
    dominio: 'latanime',
    url: 'https://latanime.org',
    buscar: buscarEnLatAnime,
    scrape: scrapeGenerico,
  },
  {
    id: 4,
    nombre: 'AnimeDBS',
    dominio: 'animedbs',
    url: 'https://animedbs.online',
    buscar: buscarEnAnimeDBS,
    scrape: scrapeGenerico,
  },
  {
    id: 5,
    nombre: 'MonosChinos',
    dominio: 'monoschinos',
    url: 'https://vww.monoschinos2.net',
    buscar: buscarEnMonosChinos,
    scrape: scrapeGenerico,
  },
  {
    id: 6,
    nombre: 'JKanime',
    dominio: 'jkanime',
    url: 'https://jkanime.net',
    buscar: buscarEnJKanime,
    scrape: scrapeJKanime,
  },
]

function getSitioPorId(id) {
  return SITIOS.find(s => s.id === Number(id)) || null
}

function getSitioPorDominio(url) {
  return SITIOS.find(s => url.includes(s.dominio)) || null
}

// ─── Errores Mega ─────────────────────────────────────────────────────────────

const MEGA_ERRORS = {
  EOVERQUOTA: '⚠️ Mega superó su límite de transferencia. Intenta más tarde.',
  ENOENT:     '❌ El archivo de Mega no existe o fue eliminado.',
  ETOOMANY:   '⚠️ Demasiadas solicitudes a Mega. Espera unos minutos.',
  EACCESS:    '❌ Sin acceso al archivo. Puede ser privado o el enlace es inválido.',
  EBLOCKED:   '❌ Cuenta/archivo bloqueado en Mega.',
}
function parseMegaError(err) {
  const msg = err?.message || String(err)
  for (const [code, text] of Object.entries(MEGA_ERRORS)) {
    if (msg.includes(code) || msg.includes(code.toLowerCase())) return text
  }
  if (msg.includes('-18')) return MEGA_ERRORS.EOVERQUOTA
  if (msg.includes('-9'))  return MEGA_ERRORS.ENOENT
  if (msg.includes('-4'))  return MEGA_ERRORS.ETOOMANY
  return `❌ Error Mega: ${msg}`
}

// ─── MediaFire link extractor ─────────────────────────────────────────────────

async function mediafireDl(url) {
  const { default: axios } = await import('axios')
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent })
  const $ = cheerio.load(res.data)
  const link =
    $('#downloadButton').attr('href') ||
    res.data.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/)?.[1]
  const name =
    $('.promoDownloadName').first().attr('title') ||
    $('.filename').first().text().trim() ||
    url.split('/').pop().split('?')[0] || 'archivo'
  return { name: name.replace(/\s+/g, ' ').trim(), link: link || null }
}

// ─── Configuración ────────────────────────────────────────────────────────────

const CONFIG = {
  maxFileSize: '95m',
  downloadTimeout: 150_000,
  puppeteerTimeout: 30_000,
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  ],
  baseHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Connection': 'keep-alive',
  },
  servidoresPreferidos: [
    'mp4upload', 'filemoon', 'streamwish', 'wishembed',
    'doodstream', 'streamtape', 'okru', 'voe', 'upstream',
  ],
  videoExtensions: /\.(mp4|mkv|webm|m3u8|ts)(\?|$)/i,
}

const randomUA    = () => CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)]
const buildHeaders = (extra = {}) => ({ ...CONFIG.baseHeaders, 'User-Agent': randomUA(), ...extra })

// ─── Helpers de servidor ──────────────────────────────────────────────────────

function detectarServidor(url) {
  for (const s of CONFIG.servidoresPreferidos) {
    if (url.includes(s)) return s
  }
  return 'generico'
}

function elegirMejorServidor(servidores) {
  for (const preferido of CONFIG.servidoresPreferidos) {
    const match = servidores.find(s =>
      s.nombre?.includes(preferido) || s.url?.includes(preferido)
    )
    if (match) return match
  }
  return servidores[0] || null
}

// ─── Fetch estático → dinámico ────────────────────────────────────────────────

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: buildHeaders({ Referer: new URL(url).origin }),
      timeout: 15000,
    })
    const html = await res.text()
    const necesitaDinamico =
      html.length < 5000 ||
      /<div id="app"|ng-app|window\.__INITIAL_STATE__|_next\/static/.test(html) ||
      html.includes('challenge-platform') ||
      html.includes('cf-browser-verification') ||
      html.includes('Just a moment')
    if (necesitaDinamico) return await fetchHtmlConPuppeteer(url)
    return html
  } catch (_) {
    return await fetchHtmlConPuppeteer(url)
  }
}

async function fetchHtmlConPuppeteer(url) {
  let capturedVideoUrl = null
  const browser = await puppeteerExtra.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })
  const page = await browser.newPage()
  await page.setUserAgent(randomUA())
  await page.setExtraHTTPHeaders(CONFIG.baseHeaders)
  page.on('response', (response) => {
    const resUrl = response.url()
    if (CONFIG.videoExtensions.test(resUrl) && !capturedVideoUrl) capturedVideoUrl = resUrl
  })
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.puppeteerTimeout })
    let tries = 0
    let bodyText = await page.evaluate(() => document.body?.innerText || '')
    while (
      (bodyText.includes('challenge-platform') || bodyText.includes('Checking your browser') || bodyText.includes('Just a moment')) &&
      tries < 10
    ) {
      await new Promise(r => setTimeout(r, 3000))
      bodyText = await page.evaluate(() => document.body?.innerText || '')
      tries++
    }
    await new Promise(r => setTimeout(r, 3000))
    const html = await page.content()
    await browser.close()
    if (capturedVideoUrl) return html + `\n<!-- INTERCEPTED_VIDEO:${capturedVideoUrl} -->`
    return html
  } catch (err) {
    await browser.close()
    throw err
  }
}

// ─── Extractores especializados por servidor (portados de CloudStream) ────────
// Fuente: CloudStream extractors/  — lógica traducida de Kotlin → JS
// Cada función recibe la URL del embed y devuelve la URL directa del stream
// o null si falla. descargarConYtDlp los llama antes de pasar a yt-dlp.

// JsUnpacker — P.A.C.K.E.R. decoder (CloudStream: JsUnpacker.kt)
function jsUnpack(packed) {
  try {
    const m = packed.match(/}\s*\('(.*)',\s*(.*?),\s*(\d+),\s*'(.*?)'\.split\('\|'\)/)
    if (!m) return null
    const payload = m[1].replace(/\\'/g, "'")
    const radix   = parseInt(m[2]) || 36
    const symtab  = m[4].split('|')
    if (symtab.length !== parseInt(m[3])) return null
    return payload.replace(/\b[a-zA-Z0-9_]+\b/g, word => {
      const idx = parseInt(word, radix)
      return (symtab[idx] && symtab[idx] !== '') ? symtab[idx] : word
    })
  } catch (_) { return null }
}

// Filemoon — (CloudStream: FilemoonV2.kt)
// Lógica: get embed → desempacar P.A.C.K.E.R. → extraer sources:[{file:"..."}]
// Fallback: WebView intercept de m3u8 (lo hace Puppeteer)
async function extractFilemoon(embedUrl) {
  try {
    const headers = {
      'Referer': embedUrl,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0',
      'Sec-Fetch-Dest': 'iframe',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
    }
    const res  = await fetch(embedUrl, { headers, timeout: 15000 })
    const html = await res.text()
    const $    = cheerio.load(html)

    // Paso 1: puede haber un iframe anidado
    let scriptData = ''
    const iframeSrc = $('iframe').attr('src')
    if (iframeSrc) {
      const res2 = await fetch(iframeSrc, { headers: { ...headers, Referer: embedUrl }, timeout: 15000 })
      scriptData = await res2.text()
    } else {
      scriptData = html
    }

    // Paso 2: P.A.C.K.E.R. unpack
    const packedMatch = scriptData.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const unpacked = packedMatch ? jsUnpack(packedMatch[0]) : null
    const source = (unpacked || scriptData).match(/sources:\s*\[{file:\s*["']([^"']+\.m3u8[^"']*)["']/)
    if (source?.[1]) return source[1]
  } catch (_) {}
  return null
}

// Mp4Upload — (CloudStream: Mp4Upload.kt)
// Lógica: get embed → getAndUnpack → player.src("...") o player.src({src:"..."})
async function extractMp4Upload(embedUrl) {
  try {
    // Normalizar: /embed-ID.html
    const idMatch = embedUrl.match(/mp4upload\.com\/(embed-)?([A-Za-z0-9]+)/)
    const realUrl = idMatch
      ? `https://www.mp4upload.com/embed-${idMatch[2]}.html`
      : embedUrl
    const res  = await fetch(realUrl, { headers: buildHeaders({ Referer: 'https://www.mp4upload.com/' }), timeout: 15000 })
    const text = await res.text()
    const packedMatch = text.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const unpacked = packedMatch ? jsUnpack(packedMatch[0]) : text
    const m1 = (unpacked || text).match(/player\.src\("([^"]+)"/)
    if (m1?.[1]) return m1[1]
    const m2 = (unpacked || text).match(/player\.src\([\w\W]*?src:\s*"([^"]+)"/)
    if (m2?.[1]) return m2[1]
  } catch (_) {}
  return null
}

// DoodStream — (CloudStream: DoodExtractor.kt)
// Lógica: /e/ → extraer /pass_md5/... → token → URL real + hash aleatorio
async function extractDoodStream(embedUrl) {
  try {
    const url  = embedUrl.replace('/d/', '/e/')
    const res  = await fetch(url, { headers: buildHeaders(), timeout: 15000 })
    const text = await res.text()
    const host = new URL(res.url).origin
    const passPath = text.match(/\/pass_md5\/[^'"]*/)?.[0]
    if (!passPath) return null
    const md5Url  = host + passPath
    const token   = passPath.split('/').pop()
    const direct  = await fetch(md5Url, { headers: { Referer: url }, timeout: 15000 })
    const base    = await direct.text()
    const rand    = Array.from({ length: 10 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*62)]).join('')
    return `${base}${rand}?token=${token}`
  } catch (_) {}
  return null
}

// StreamWish / Wishembed — (CloudStream: StreamWishExtractor.kt)
// Lógica: get embed → unpack P.A.C.K.E.R. → file:"...m3u8..." en jwplayer/setup
async function extractStreamWish(embedUrl) {
  try {
    // Normalizar /f/ → /<id>
    const norm = embedUrl.replace(/\/(f|e)\//, '/')
    const res  = await fetch(norm, { headers: buildHeaders({ Referer: embedUrl }), timeout: 15000 })
    const text = await res.text()
    const packedMatch = text.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const unpacked = packedMatch ? jsUnpack(packedMatch[0]) : null
    const src = (unpacked || text).match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/)
    if (src?.[1]) return src[1]
  } catch (_) {}
  return null
}

// Streamtape — extracción del link ofuscado
async function extractStreamtape(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: buildHeaders({ Referer: 'https://streamtape.com/' }), timeout: 15000 })
    const text = await res.text()
    // Streamtape oculta el link en dos variables JS concatenadas
    const m = text.match(/id=([^&"']+).*?token=([^&"']+)/)
    if (m) return `https://streamtape.com/get_video?id=${m[1]}&token=${m[2]}&stream=1`
    // Patrón alternativo
    const m2 = text.match(/robotlink['"]\)\.innerHTML\s*=\s*["']([^"']+)["'].*?["']([^"']+)["']/)
    if (m2) return 'https:' + m2[1] + m2[2]
  } catch (_) {}
  return null
}

// Voe — (CloudStream: Voe.kt)
// Lógica: rot13 → replacePatterns → removeUnderscores → base64 → charShift(-3) → reverse → base64 → JSON.source
async function extractVoe(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: buildHeaders({ Referer: embedUrl }), timeout: 15000 })
    const html = await res.text()
    // Buscar redirect
    const redir = html.match(/window\.location\.href\s*=\s*'([^']+)'/)
    const targetUrl = redir ? redir[1] : embedUrl
    const res2 = redir ? await fetch(targetUrl, { headers: buildHeaders(), timeout: 15000 }) : res
    const html2 = redir ? await res2.text() : html

    // Buscar script type=application/json con array ["<encoded>"]
    const enc = html2.match(/\["([A-Za-z0-9+/=@$^~!#&%?*]+)"\]/)
    if (!enc?.[1]) return null

    // Decrypt F7: rot13 → replace → removeUnderscores → base64 → charShift(3) → reverse → base64
    let v = enc[1]
    v = v.replace(/[A-Za-z]/g, c => {
      const base = c <= 'Z' ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    }) // rot13
    for (const p of ['@$','^^','~@','%?','*~','!!','#&']) v = v.split(p).join('_')
    v = v.replace(/_/g, '')                             // removeUnderscores
    v = Buffer.from(v, 'base64').toString('utf-8')      // base64
    v = v.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('') // charShift(-3)
    v = v.split('').reverse().join('')                  // reverse
    v = Buffer.from(v, 'base64').toString('utf-8')      // base64
    const json = JSON.parse(v)
    return json.source || json.direct_access_url || null
  } catch (_) {}
  return null
}

// Okru (ok.ru) — extrae source de playerV3 JSON
async function extractOkru(embedUrl) {
  try {
    const videoId = embedUrl.match(/ok\.ru\/videoembed\/(\d+)/)?.[1] ||
                    embedUrl.match(/ok\.ru\/video\/(\d+)/)?.[1]
    if (!videoId) return null
    const res  = await fetch(`https://ok.ru/videoembed/${videoId}`, {
      headers: buildHeaders({ Referer: 'https://ok.ru/' }),
      timeout: 15000,
    })
    const text = await res.text()
    // ok.ru guarda el JSON en data-options
    const dataOpts = text.match(/data-options="([^"]+)"/)
    if (!dataOpts) return null
    const json = JSON.parse(dataOpts[1].replace(/&quot;/g, '"'))
    const flashVars = JSON.parse(json.flashvars?.metadata || '{}')
    // Buscar HLS primero, luego SD
    const videos = flashVars.videos || []
    const hls = videos.find(v => v.name === 'hls')
    const sd  = videos.find(v => v.name?.includes('SD') || v.name?.includes('360'))
    return hls?.url || sd?.url || videos[0]?.url || null
  } catch (_) {}
  return null
}

// ─── Dispatcher: detecta el servidor y llama al extractor correcto ────────────
// Portado de la lógica de registro de extractores en CloudStream (MainAPI.kt)

async function resolverEmbedAVideoDirecto(embedUrl) {
  const u = embedUrl.toLowerCase()
  if (u.includes('filemoon'))    return await extractFilemoon(embedUrl)
  if (u.includes('mp4upload'))   return await extractMp4Upload(embedUrl)
  if (u.includes('dood') || u.includes('ds2play') || u.includes('vide0.net')) return await extractDoodStream(embedUrl)
  if (u.includes('streamwish') || u.includes('wishembed') || u.includes('embedwish') ||
      u.includes('mwish') || u.includes('dwish') || u.includes('awish') || u.includes('swdyu')) return await extractStreamWish(embedUrl)
  if (u.includes('streamtape'))  return await extractStreamtape(embedUrl)
  if (u.includes('voe.sx') || u.includes('voe'))  return await extractVoe(embedUrl)
  if (u.includes('ok.ru') || u.includes('okru'))  return await extractOkru(embedUrl)
  return null // sin extractor especial → yt-dlp lo intenta directamente
}

// ─── Scraping ─────────────────────────────────────────────────────────────────

function extraerUrlsDeScripts($, html, servidores) {
  $('script:not([src])').each((_, el) => {
    const code = $(el).html() || ''
    const re = /['"](https?:\/\/[^'"]{10,}\.(?:mp4|m3u8|webm|mkv)[^'"]*)['"]/gi
    let match
    while ((match = re.exec(code)) !== null) {
      const u = match[1]
      if (!servidores.find(s => s.url === u))
        servidores.push({ nombre: detectarServidor(u), url: u, directo: true })
    }
  })
}

async function scrapeAnimeFLV(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    const match = code.match(/var videos\s*=\s*(\{[\s\S]*?\});/)
    if (match) {
      try {
        const data = JSON.parse(match[1])
        const lista = data.SUB || data.LAT || []
        for (const s of lista) {
          const videoUrl = s.url || s.code
          if (videoUrl) servidores.push({ nombre: s.title?.toLowerCase() || detectarServidor(videoUrl), url: videoUrl })
        }
      } catch (_) {}
    }
  })
  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

async function scrapeVerAnimes(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    const matchArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (matchArr) {
      try {
        const lista = JSON.parse(matchArr[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http'))
            servidores.push({ nombre: String(item[0]).toLowerCase() || detectarServidor(item[1]), url: item[1] })
          else if (item?.file?.startsWith('http'))
            servidores.push({ nombre: item.label?.toLowerCase() || detectarServidor(item.file), url: item.file })
        }
      } catch (_) {}
    }
    if (servidores.length === 0) {
      const matchObj = code.match(/var\s+videos\s*=\s*(\{[\s\S]*?\});/)
      if (matchObj) {
        try {
          const data = JSON.parse(matchObj[1])
          const lista = data.SUB || data.LAT || data.ESP || []
          for (const s of lista) {
            const videoUrl = s.url || s.code || s.file
            if (videoUrl) servidores.push({ nombre: s.title?.toLowerCase() || detectarServidor(videoUrl), url: videoUrl })
          }
        } catch (_) {}
      }
    }
    const jwMatch = code.match(/file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/gi)
    if (jwMatch) {
      for (const m of jwMatch) {
        const u = m.match(/["'](https?:\/\/[^"']+)["']/)?.[1]
        if (u && !servidores.find(s => s.url === u))
          servidores.push({ nombre: detectarServidor(u), url: u, directo: true })
      }
    }
  })
  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src')
    if (src?.startsWith('http')) servidores.push({ nombre: detectarServidor(src), url: src })
  })
  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

async function scrapeGenerico(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    const matchArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (matchArr) {
      try {
        const lista = JSON.parse(matchArr[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http'))
            servidores.push({ nombre: String(item[0]).toLowerCase() || detectarServidor(item[1]), url: item[1] })
          else if (item?.file?.startsWith('http'))
            servidores.push({ nombre: item.label?.toLowerCase() || detectarServidor(item.file), url: item.file })
        }
      } catch (_) {}
    }
    if (servidores.length === 0) {
      const matchObj = code.match(/var\s+videos\s*=\s*(\{[\s\S]*?\});/)
      if (matchObj) {
        try {
          const data = JSON.parse(matchObj[1])
          const lista = data.SUB || data.LAT || data.ESP || []
          for (const s of lista) {
            const videoUrl = s.url || s.code || s.file
            if (videoUrl) servidores.push({ nombre: s.title?.toLowerCase() || detectarServidor(videoUrl), url: videoUrl })
          }
        } catch (_) {}
      }
    }
    const jwRe = /file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/gi
    let mj
    while ((mj = jwRe.exec(code)) !== null) {
      if (!servidores.find(s => s.url === mj[1]))
        servidores.push({ nombre: detectarServidor(mj[1]), url: mj[1], directo: true })
    }
  })
  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src')
    if (src?.startsWith('http')) servidores.push({ nombre: detectarServidor(src), url: src })
  })
  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

async function scrapeJKanime(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  const jkMatch = url.match(/jkanime\.net\/([^/]+)\/(\d+)/)
  if (jkMatch) {
    const slug = jkMatch[1], cap = jkMatch[2]
    const serversJK = ['jkvideo', 'okru', 'streamtape', 'mp4upload', 'filemoon']
    for (const srv of serversJK) {
      try {
        const apiUrl = `https://jkanime.net/ajax/episode/2/?id=${slug}&cap=${cap}&server=${srv}`
        const res = await fetch(apiUrl, { headers: buildHeaders({ Referer: url }), timeout: 10000 })
        if (res.ok) {
          const json = await res.json()
          const embedUrl = json?.source?.[0]?.file || json?.iframe || json?.url
          if (embedUrl) servidores.push({ nombre: srv, url: embedUrl })
        }
      } catch (_) {}
    }
  }
  if (servidores.length === 0) {
    $('span[data-url], a[data-url], div[data-url], li[data-url]').each((_, el) => {
      const raw = $(el).attr('data-url') || ''
      const nombre = $(el).text().trim().toLowerCase()
      let finalUrl = raw
      try {
        const decoded = Buffer.from(raw, 'base64').toString('utf-8')
        if (decoded.startsWith('http')) finalUrl = decoded
      } catch (_) {}
      if (finalUrl.startsWith('http')) servidores.push({ nombre: nombre || detectarServidor(finalUrl), url: finalUrl })
    })
  }
  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src')
    if (src?.startsWith('http')) servidores.push({ nombre: detectarServidor(src), url: src })
  })
  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

// ─── Funciones de búsqueda ────────────────────────────────────────────────────

// ─── Helpers para filtrar temporada en resultados ─────────────────────────────

function elegirPorTemporada(links, temporada) {
  if (temporada <= 1) return links[0]
  // Palabras clave que indican la temporada en el título/slug
  const keywords = [
    `temporada-${temporada}`, `temporada ${temporada}`,
    `season-${temporada}`,    `season ${temporada}`,
    `parte-${temporada}`,     `parte ${temporada}`,
    `part-${temporada}`,      `part ${temporada}`,
    `-${temporada}nd-`, `-${temporada}rd-`, `-${temporada}th-`,
    ` ${temporada}$`, `-${temporada}$`,
  ]
  return (
    links.find(r => keywords.some(kw => r.title.includes(kw) || r.href.includes(kw))) ||
    links[0]
  )
}

// ─── Funciones de búsqueda (todas reciben temporada=1 por defecto) ────────────

async function buscarEnAnimeFLV(nombre, episodio, temporada = 1) {
  // Si temporada > 1, incluirla en la query para afinar resultados
  const query = temporada > 1 ? `${nombre} ${temporada}` : nombre
  const html = await fetchHtml(`https://www3.animeflv.net/browse?q=${encodeURIComponent(query)}`)
  const $ = cheerio.load(html)

  const links = []
  $('ul.ListAnimes li a, article.Anime a').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const title = ($(el).find('h3, .Title').text() || $(el).attr('title') || '').trim().toLowerCase()
    if (href.startsWith('/anime/')) links.push({ href, title })
  })
  if (links.length === 0) return null

  const elegido = elegirPorTemporada(links, temporada)
  const slug = elegido.href.replace('/anime/', '').replace(/\/$/, '')
  return `https://www3.animeflv.net/ver/${slug}-${episodio}`
}

async function buscarEnVerAnimes(nombre, episodio, temporada = 1) {
  const query = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre
  const html = await fetchHtml(`https://wwv.veranimes.net/?s=${encodeURIComponent(query)}`)
  const $ = cheerio.load(html)

  const links = []
  $('article a, .item a, h2 a, .title a').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const title = $(el).text().trim().toLowerCase()
    if (href) links.push({ href, title })
  })
  if (links.length === 0) return null

  const elegido   = elegirPorTemporada(links, temporada)
  const slugMatch = elegido.href.match(/\/(?:anime|ver)\/([^/]+?)(?:-\d+)?$/)
  if (!slugMatch) return null
  return `https://wwv.veranimes.net/ver/${slugMatch[1].replace(/-\d+$/, '')}-${episodio}`
}

async function buscarEnLatAnime(nombre, episodio, temporada = 1) {
  const query = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre
  const html = await fetchHtml(`https://latanime.org/?s=${encodeURIComponent(query)}`)
  const $ = cheerio.load(html)

  const links = []
  $('a[href*="/ver/"], article a').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const title = $(el).text().trim().toLowerCase()
    if (href) links.push({ href, title })
  })
  if (links.length === 0) return null

  const elegido   = elegirPorTemporada(links, temporada)
  const slugMatch = elegido.href.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://latanime.org/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnMonosChinos(nombre, episodio, temporada = 1) {
  const query = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre
  const html = await fetchHtml(`https://vww.monoschinos2.net/buscar?q=${encodeURIComponent(query)}`)
  const $ = cheerio.load(html)

  const links = []
  $('a[href*="/ver/"]').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const title = $(el).text().trim().toLowerCase()
    if (href) links.push({ href, title })
  })
  if (links.length === 0) return null

  const elegido   = elegirPorTemporada(links, temporada)
  const slugMatch = elegido.href.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://vww.monoschinos2.net/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnAnimeDBS(nombre, episodio, temporada = 1) {
  const base  = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre
  const query = `${base} episodio ${episodio}`
  const html  = await fetchHtml(`https://www.animedbs.online/?s=${encodeURIComponent(query)}`)
  const $     = cheerio.load(html)
  const link  = $('article a, h2 a, .entry-title a').first().attr('href') || ''
  return link.startsWith('http') ? link : null
}

async function buscarEnJKanime(nombre, episodio, temporada = 1) {
  const query = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre
  const html  = await fetchHtml(`https://jkanime.net/buscar/?q=${encodeURIComponent(query)}`)
  const $     = cheerio.load(html)

  const links = []
  $('a[href*="jkanime.net/"]').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const title = $(el).text().trim().toLowerCase()
    if (href) links.push({ href, title })
  })
  if (links.length === 0) return null

  const elegido   = elegirPorTemporada(links, temporada)
  const slugMatch = elegido.href.match(/jkanime\.net\/([^/]+)/)
  if (!slugMatch) return null
  return `https://jkanime.net/${slugMatch[1]}/${episodio}/`
}

// ─── Descarga con yt-dlp ──────────────────────────────────────────────────────

async function descargarConYtDlp(embedUrl, outputDir) {
  const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s')

  // ── Paso 1: intentar resolver el embed con extractores especializados ──
  // (portados de CloudStream: Filemoon, Mp4Upload, DoodStream, StreamWish, Voe, Okru, Streamtape)
  let videoUrl = embedUrl
  const urlDirecta = await resolverEmbedAVideoDirecto(embedUrl)
  if (urlDirecta) {
    console.log(`[extractor] ✅ URL directa resuelta: ${urlDirecta.slice(0, 80)}...`)
    videoUrl = urlDirecta
  }

  // ── Paso 2: llamar yt-dlp con la mejor URL disponible ──
  const esHLS = videoUrl.includes('.m3u8')
  const referer = new URL(embedUrl).origin + '/'

  const cmd = [
    'yt-dlp',
    '--no-check-certificate',
    '--no-warnings',
    esHLS ? '--downloader ffmpeg' : '',
    '-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--max-filesize', CONFIG.maxFileSize,
    '--add-header', `"User-Agent: ${randomUA()}"`,
    '--add-header', `"Referer: ${referer}"`,
    '--add-header', '"Accept-Language: es-419,es;q=0.9"',
    '-o', `"${outputTemplate}"`,
    `"${videoUrl}"`,
  ].filter(Boolean).join(' ')

  await execAsync(cmd, { timeout: CONFIG.downloadTimeout })

  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (archivos.length === 0) throw new Error('yt-dlp no generó ningún archivo')
  return path.join(
    outputDir,
    archivos.map(f => ({ f, t: fs.statSync(path.join(outputDir, f)).mtimeMs }))
            .sort((a, b) => b.t - a.t)[0].f
  )
}

// ─── Handler principal ────────────────────────────────────────────────────────

const handler = async (m, { conn, text, args, usedPrefix, command }) => {

  // ── .anilist → mostrar sitios disponibles ──────────────────────────────
  if (command === 'anilist') {
    const lista = SITIOS.map(s =>
      `*${s.id}.* ${s.nombre}\n   🔗 ${s.url}`
    ).join('\n\n')

    return m.reply(
      `*🎌 Sitios de Anime Disponibles*\n\n` +
      `${lista}\n\n` +
      `*¿Cómo usar?*\n` +
      `• *.animedl <nombre> <ep>*\n` +
      `• *.animedl <nombre> t<N> <ep>*\n` +
      `• *.animedl <S> <nombre> t<N> <ep>*\n\n` +
      `*Ejemplos:*\n` +
      `  .animedl one piece 1100\n` +
      `  .animedl shingeki no kyojin t4 1\n` +
      `  .animedl 1 oshi no ko t2 3\n` +
      `  .animedl 6 solo leveling t2 5\n\n` +
      `_t<N> = temporada. Sin t = temporada 1_`
    )
  }

  // ── .cancelar / .stop ─────────────────────────────────────────────────────
  if (command === 'cancelar' || command === 'stop') {
    const quotedMsgId = m.quoted?.id
    if (!quotedMsgId) return m.reply(`❌ Responde al mensaje de progreso de la descarga.`)
    const dl = global.activeDownloads.get(quotedMsgId)
    if (!dl) return m.reply(`❌ No hay descarga activa para ese mensaje.`)
    dl.controller.abort()
    global.activeDownloads.delete(quotedMsgId)
    return m.reply(`🚫 Descarga cancelada.`)
  }

  // ── Sin argumentos → ayuda ────────────────────────────────────────────────
  if (!text || !text.trim()) {
    return m.reply(
      `*🎌 Descargador de Anime + Archivos*\n\n` +
      `*Comandos:*\n` +
      `• *.anilist* — Ver sitios disponibles\n` +
      `• *.animedl <nombre> <ep>* — Buscar en todos\n` +
      `• *.animedl <nombre> t<N> <ep>* — Temporada N\n` +
      `• *.animedl <S> <nombre> t<N> <ep>* — Sitio S + temporada N\n` +
      `• *.animedl <url>* — URL directa del episodio\n` +
      `• *.animedl <url mega/mediafire>* — Descargar archivo\n\n` +
      `*Ejemplos:*\n` +
      `  .animedl shingeki no kyojin t4 1\n` +
      `  .animedl 1 oshi no ko t2 3\n\n` +
      `_Usa .anilist para ver los números de sitio_`
    )
  }

  // ── Mega / MediaFire ──────────────────────────────────────────────────────
  const rawArg      = (args?.[0] || text?.trim() || '')
  const isMega      = /mega\.nz/.test(rawArg)
  const isMediaFire = /mediafire\.com/.test(rawArg)

  if (isMega || isMediaFire) {
    const { default: axios } = await import('axios')
    const controller = new AbortController()
    const { signal } = controller
    let tempPath, msgId

    try {
      const { key } = await m.reply(`⏳ *Preparando descarga...*`)
      msgId = key.id
      global.activeDownloads.set(msgId, { controller })

      if (isMega) {
        let file
        try {
          file = MegaFile.fromURL(rawArg)
          await file.loadAttributes()
        } catch (err) { return m.reply(parseMegaError(err)) }

        const name = file.name
        const sizeH = (file.size / 1024 / 1024).toFixed(2) + ' MB'
        await conn.sendMessage(m.chat, { text: `📥 *Mega:* ${name}\n⚖️ ${sizeH}\n\n_Descargando..._`, edit: key })
        tempPath = path.join(process.env.TMPDIR || '/tmp', `mega_${Date.now()}_${name}`)

        let fileStream
        try { fileStream = file.download({ signal }) }
        catch (err) { return m.reply(parseMegaError(err)) }

        let dld = 0
        fileStream.on('data', (chunk) => {
          dld += chunk.length
          process.stdout.write(`\r[MEGA] ${((dld / file.size) * 100).toFixed(1)}% | ${(dld / 1024 / 1024).toFixed(2)} MB`)
        })
        try {
          await pipeline(fileStream, fs.createWriteStream(tempPath), { signal })
        } catch (err) {
          if (err.name === 'AbortError') throw err
          return m.reply(parseMegaError(err))
        }

        await conn.sendMessage(m.chat, { text: `⬆️ Subiendo a WhatsApp...`, edit: key })
        await conn.sendMessage(m.chat, {
          document: { url: tempPath },
          fileName: name,
          mimetype: mimeLookup(name) || 'application/octet-stream',
          caption: `✅ *${name}*\n⚖️ ${sizeH}`,
        }, { quoted: m })

      } else {
        let mfData
        try { mfData = await mediafireDl(rawArg) }
        catch (err) { return m.reply(`❌ Error MediaFire: ${err.message}`) }
        if (!mfData.link) return m.reply(`❌ No encontré el enlace de descarga.`)

        const { name, link: downloadUrl } = mfData
        let sizeBytes = 0
        try {
          const ax = await import('axios')
          const head = await ax.default.head(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, signal })
          sizeBytes = parseInt(head.headers['content-length'] || '0')
        } catch (_) {}
        const sizeH = sizeBytes ? (sizeBytes / 1024 / 1024).toFixed(2) + ' MB' : '?'

        await conn.sendMessage(m.chat, { text: `📥 *MediaFire:* ${name}\n⚖️ ${sizeH}\n\n_Descargando..._`, edit: key })
        tempPath = path.join(process.env.TMPDIR || '/tmp', `mf_${Date.now()}_${name}`)

        const ax2 = await import('axios')
        const response = await ax2.default({ method: 'get', url: downloadUrl, responseType: 'stream', signal, httpsAgent })
        let dld = 0
        response.data.on('data', (chunk) => {
          dld += chunk.length
          const p = sizeBytes ? ((dld / sizeBytes) * 100).toFixed(1) : '?'
          process.stdout.write(`\r[MF] ${p}% | ${(dld / 1024 / 1024).toFixed(2)} MB`)
        })
        await pipeline(response.data, fs.createWriteStream(tempPath), { signal })

        await conn.sendMessage(m.chat, { text: `⬆️ Subiendo a WhatsApp...`, edit: key })
        await conn.sendMessage(m.chat, {
          document: { url: tempPath },
          fileName: name,
          mimetype: mimeLookup(name) || 'application/octet-stream',
          caption: `✅ *${name}*\n⚖️ ${sizeH}`,
        }, { quoted: m })
      }

      global.activeDownloads.delete(msgId)
    } catch (err) {
      if (err.name !== 'AbortError') await m.reply(`❌ Error: ${err.message}`)
      if (msgId) global.activeDownloads.delete(msgId)
    } finally {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
    }
    return
  }

  // ── Lógica principal de anime ──────────────────────────────────────────────
  const rawArgs = text.trim().split(/\s+/)

  // ── Paso 1: detectar número de sitio al inicio (opcional) ──
  // Formato: .animedl [S] <nombre> [tN] <ep>
  let sitioElegido  = null
  let argsParaAnime = rawArgs

  if (/^\d+$/.test(rawArgs[0]) && rawArgs.length >= 3) {
    const idNum = parseInt(rawArgs[0])
    const sitioCandidate = getSitioPorId(idNum)
    if (sitioCandidate && !isNaN(rawArgs[rawArgs.length - 1])) {
      sitioElegido  = sitioCandidate
      argsParaAnime = rawArgs.slice(1)
    }
  }

  let episodeUrl = null

  // ── Modo URL directa ──
  if (argsParaAnime[0].startsWith('http')) {
    episodeUrl    = argsParaAnime[0]
    sitioElegido  = getSitioPorDominio(episodeUrl)
  } else {
    // ── Paso 2: extraer episodio (último token numérico) ──
    const episodio = argsParaAnime[argsParaAnime.length - 1]
    if (isNaN(episodio)) {
      return m.reply(
        `❌ Formato incorrecto.\n\n` +
        `• *.animedl <nombre> <ep>*\n` +
        `• *.animedl <nombre> t<N> <ep>*\n` +
        `• *.animedl <S> <nombre> t<N> <ep>*\n\n` +
        `*Ejemplos:*\n` +
        `  .animedl shingeki no kyojin t4 1\n` +
        `  .animedl 1 oshi no ko t2 3\n\n` +
        `_Usa .anilist para ver los sitios disponibles_`
      )
    }

    // ── Paso 3: detectar temporada tN antes del episodio (opcional) ──
    // Acepta: t2, T2, temporada2, temp2 — siempre como penúltimo token
    let temporada = 1
    let tokensSinEp = argsParaAnime.slice(0, -1) // quitar episodio

    const tempIdx = tokensSinEp.findIndex(t => /^t(?:emperada|emp)?(\d+)$/i.test(t))
    if (tempIdx !== -1) {
      const match = tokensSinEp[tempIdx].match(/(\d+)/)
      temporada   = parseInt(match[1])
      tokensSinEp = tokensSinEp.filter((_, i) => i !== tempIdx) // quitar el tN
    }

    const nombre = tokensSinEp.join(' ')
    if (!nombre) {
      return m.reply(`❌ Falta el nombre del anime.\nEjemplo: *.animedl one piece t1 1*`)
    }

    // ── Paso 4: búsqueda ──
    const labelTemp = temporada > 1 ? ` temporada *${temporada}*` : ''
    const labelSitio = sitioElegido ? ` en *${sitioElegido.nombre}*` : ' en todos los sitios'

    await m.reply(`🔎 Buscando *${nombre}*${labelTemp} ep *${episodio}*${labelSitio}...`)

    if (sitioElegido) {
      episodeUrl = await sitioElegido.buscar(nombre, episodio, temporada)
      if (!episodeUrl) {
        const tSuffix = temporada > 1 ? ` t${temporada}` : ''
        return m.reply(
          `❌ No encontré *${nombre}* ep *${episodio}*${temporada > 1 ? ` (temporada ${temporada})` : ''} en *${sitioElegido.nombre}*.\n\n` +
          `Prueba con otro sitio:\n` +
          SITIOS.filter(s => s.id !== sitioElegido.id)
                .map(s => `  .animedl ${s.id} ${nombre}${tSuffix} ${episodio}`)
                .join('\n')
        )
      }
    } else {
      for (const sitio of SITIOS) {
        try {
          episodeUrl = await sitio.buscar(nombre, episodio, temporada)
          if (episodeUrl) {
            sitioElegido = sitio
            await m.reply(`✅ Encontrado en *${sitio.nombre}*`)
            break
          }
        } catch (_) {}
      }
      if (!episodeUrl) {
        return m.reply(
          `❌ No encontré *${nombre}* ep *${episodio}*${temporada > 1 ? ` (temporada ${temporada})` : ''} en ningún sitio.\n` +
          `Prueba con la URL directa del episodio.`
        )
      }
    }
  }

  await m.reply(
    `📡 Extrayendo servidores de *${sitioElegido?.nombre || 'sitio desconocido'}*...\n` +
    `🔗 ${episodeUrl}`
  )

  // ── Scraping ──
  let servidores = []
  try {
    if (sitioElegido?.scrape) {
      servidores = await sitioElegido.scrape(episodeUrl)
    } else {
      servidores = [{ nombre: 'directo', url: episodeUrl, directo: true }]
    }
  } catch (err) {
    return m.reply(`❌ Error al analizar la página:\n\`${err.message}\``)
  }

  if (servidores.length === 0) {
    return m.reply('❌ No encontré servidores de video en esa página.')
  }

  const directas     = servidores.filter(s => s.directo && CONFIG.videoExtensions.test(s.url))
  const listaIntentos = directas.length > 0
    ? [...directas, ...servidores.filter(s => !s.directo)]
    : servidores

  await m.reply(
    `⬇️ Descargando desde *${listaIntentos[0].nombre}*...\n` +
    `_Puede tardar hasta 2 min_`
  )

  const tmpDir = path.join(process.env.TMPDIR || '/tmp', `anime_${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  let archivoPath = null
  for (const srv of listaIntentos.slice(0, 4)) {
    try {
      archivoPath = await descargarConYtDlp(srv.url, tmpDir)
      break
    } catch (_) {
      await m.reply(`⚠️ *${srv.nombre}* falló → probando siguiente...`)
      fs.readdirSync(tmpDir).forEach(f => {
        try { fs.unlinkSync(path.join(tmpDir, f)) } catch (_) {}
      })
    }
  }

  if (!archivoPath) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    return m.reply(
      `❌ Todos los servidores fallaron.\n*Intentados:* ${listaIntentos.slice(0, 4).map(s => s.nombre).join(', ')}\n\n` +
      `Prueba con otro sitio:\n` +
      SITIOS.filter(s => s.id !== sitioElegido?.id)
            .slice(0, 3)
            .map(s => `  .animedl ${s.id} ${argsParaAnime.join(' ')}`)
            .join('\n')
    )
  }

  try {
    const finalPath = archivoPath
    const sizeMB    = fs.statSync(archivoPath).size / 1024 / 1024
    const fileName  = path.basename(finalPath).replace(/_c\.mp4$/, '.mp4')
    const caption   = `🎌 *${fileName.replace(/\.[^.]+$/, '')}*\n📦 ${sizeMB.toFixed(1)} MB · KanaArima-MD`

    await conn.sendMessage(m.chat, {
      document: { url: finalPath },
      caption,
      mimetype: 'video/mp4',
      fileName,
    }, { quoted: m })
  } catch (err) {
    await m.reply(`❌ Falló el envío:\n${err.message}`)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

handler.help = ['animedl <nombre> [tN] <ep>', 'animedl <S> <nombre> [tN] <ep>', 'anilist']
handler.tags = ['descargas']
handler.command = /^(animedl|anilist|cancelar|stop)$/i

export default handler
