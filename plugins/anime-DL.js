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

import { spawn } from 'child_process'
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

// ─── Helpers compartidos ─────────────────────────────────────────────────────

// P.A.C.K.E.R. decoder — usado por Filemoon, Mp4Upload, StreamWish y otros
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

// Intenta varias regex para extraer la URL de video del HTML o código desempacado
function extraerUrlDeVideo(code) {
  const patrones = [
    /sources\s*:\s*\[{[^}]*file\s*:\s*["']([^"']+)["']/,
    /file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /src\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /["']([^"']+\.m3u8[^"']*)["']/i,
    /source\s*=\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /videoUrl\s*[=:]\s*["']([^"']+)["']/i,
  ]
  for (const re of patrones) {
    const m = code.match(re)
    if (m?.[1]?.startsWith('http')) return m[1]
  }
  return null
}

// Headers base para embeds (acepta referer opcional)
function embedHeaders(referer, extra = {}) {
  return {
    'User-Agent'     : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer'        : referer,
    'Origin'         : new URL(referer).origin,
    'Accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
    'Sec-Fetch-Dest' : 'iframe',
    'Sec-Fetch-Mode' : 'navigate',
    'Sec-Fetch-Site' : 'cross-site',
    ...extra,
  }
}

// ─── Extractores de servidores ────────────────────────────────────────────────
// Fuentes: consumet.ts v1.8.1 + stream-bypass + CloudStream extractors
// Cada función recibe la URL del embed y devuelve la URL directa o null.

// ── Filemoon ──────────────────────────────────────────────────────────────────
// Técnica: GET embed → desempacar PACKER → sources:[{file:"...m3u8"}]
// Fix consumet v1.8.1: headers Sec-Fetch-Dest=iframe + Origin necesarios
async function extractFilemoon(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: embedHeaders(embedUrl), timeout: 15000 })
    let   html = await res.text()

    // Puede haber un iframe anidado (filemoon a veces redirige internamente)
    const iframeSrc = html.match(/<iframe[^>]+src=["']([^"']+filemoon[^"']+)["']/i)?.[1]
    if (iframeSrc) {
      const res2 = await fetch(iframeSrc, { headers: embedHeaders(embedUrl), timeout: 15000 })
      html = await res2.text()
    }

    // PACKER decode
    const packed  = html.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const unpacked = packed ? jsUnpack(packed[0]) : null
    const src = extraerUrlDeVideo(unpacked || html)
    if (src) return src
  } catch (e) { console.error('[filemoon]', e.message) }
  return null
}

// ── Mp4Upload ─────────────────────────────────────────────────────────────────
// Técnica: normalizar URL a /embed-ID.html → PACKER → player.src("...")
async function extractMp4Upload(embedUrl) {
  try {
    const idMatch = embedUrl.match(/mp4upload\.com\/(?:embed-)?([A-Za-z0-9]+)/)
    const url = idMatch
      ? `https://www.mp4upload.com/embed-${idMatch[1]}.html`
      : embedUrl
    const res  = await fetch(url, { headers: embedHeaders('https://www.mp4upload.com/'), timeout: 15000 })
    const text = await res.text()
    const packed = text.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const code   = packed ? jsUnpack(packed[0]) : text
    // player.src("url") o player.src({src:"url"})
    const m1 = (code || text).match(/player\.src\("([^"]+)"/)
    if (m1?.[1]) return m1[1]
    const m2 = (code || text).match(/player\.src\([^)]*src\s*:\s*"([^"]+)"/)
    if (m2?.[1]) return m2[1]
    const src = extraerUrlDeVideo(code || text)
    if (src) return src
  } catch (e) { console.error('[mp4upload]', e.message) }
  return null
}

// ── DoodStream ────────────────────────────────────────────────────────────────
// Técnica: /e/ → /pass_md5/... → token → URL real + hash aleatorio
// Dominios actualizados 2025: dood.wf, dood.to, ds2play.com, doodstream.com
async function extractDoodStream(embedUrl) {
  try {
    const url   = embedUrl.replace(/\/(d|watch)\//, '/e/')
    const res   = await fetch(url, { headers: embedHeaders('https://dood.wf/'), timeout: 15000 })
    const text  = await res.text()
    const host  = new URL(res.url).origin
    const pass  = text.match(/\/pass_md5\/[^'"<\s]*/)?.[0]
    if (!pass) return null
    const token = pass.split('/').pop()
    const r2    = await fetch(host + pass, { headers: { Referer: url, 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
    const base  = await r2.text()
    const rand  = Array.from({ length: 10 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('')
    return `${base}${rand}?token=${token}&expiry=${Date.now()}`
  } catch (e) { console.error('[doodstream]', e.message) }
  return null
}

// ── StreamWish / Wishembed / VidHide / FileLions ──────────────────────────────
// Técnica fix consumet v1.8.1 (#589, #592):
//   1. Usar el embed URL propio como Referer (no el origin) → evita 403
//   2. Si PACKER falla, buscar sources en base64 (nuevo encoding 2024)
//   3. Dominios soportados: streamwish, wishembed, dwish, filelions, vidhide, dlions
async function extractStreamWish(embedUrl) {
  // StreamWish y sus clones (VidHide, FileLions, Senvid, etc.) usan JWPlayer
  // con el source encriptado en PACKER o base64. Si el fetch estático falla,
  // Puppeteer intercepta el .m3u8 directamente de la red.
  const norm = embedUrl.replace(/\/(f|e)\//, '/')

  // ── Intento 1: fetch estático ──────────────────────────────────────────────
  try {
    const res  = await fetch(norm, {
      headers: {
        ...embedHeaders(embedUrl),
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site' : 'none',
        'Cache-Control'  : 'no-cache',
      },
      timeout: 15000,
    })
    const text = await res.text()

    // 1a. PACKER
    const packed = text.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    if (packed) {
      const code = jsUnpack(packed[0])
      if (code) {
        const src = extraerUrlDeVideo(code)
        if (src) { console.log('[streamwish] URL via PACKER'); return src }
      }
    }

    // 1b. Base64 encodificado (patrón 2024/2025)
    const b64Patterns = [
      /atob\(["']([A-Za-z0-9+/=]{60,})["']\)/,
      /window\.\w+\s*=\s*["']([A-Za-z0-9+/=]{60,})["']/,
      /["']([A-Za-z0-9+/=]{100,})["']\s*[;,]/,
    ]
    for (const re of b64Patterns) {
      const m = text.match(re)
      if (m) {
        try {
          const decoded = Buffer.from(m[1], 'base64').toString('utf-8')
          const src = extraerUrlDeVideo(decoded)
          if (src) { console.log('[streamwish] URL via base64'); return src }
        } catch (_) {}
      }
    }

    // 1c. URL directa en el HTML sin ofuscar
    const src = extraerUrlDeVideo(text)
    if (src) { console.log('[streamwish] URL directa en HTML'); return src }

    console.log('[streamwish] Fetch estático sin resultado, usando Puppeteer...')
  } catch (e) {
    console.error('[streamwish] fetch error:', e.message)
  }

  // ── Intento 2: Puppeteer — interceptar petición .m3u8 de red ──────────────
  try {
    let capturedUrl = null
    const browser = await puppeteerExtra.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    })
    const page = await browser.newPage()
    await page.setUserAgent(randomUA())
    await page.setExtraHTTPHeaders({ Referer: embedUrl })

    page.on('response', async (response) => {
      const url = response.url()
      if (!capturedUrl && /\.m3u8/.test(url)) {
        capturedUrl = url
        console.log('[streamwish] m3u8 interceptado:', url.slice(0, 80))
      }
    })

    try {
      await page.goto(norm, { waitUntil: 'networkidle2', timeout: 25000 })
    } catch (_) {}

    // Esperar hasta 8s a que aparezca el m3u8
    for (let i = 0; i < 16 && !capturedUrl; i++) {
      await new Promise(r => setTimeout(r, 500))
    }
    await browser.close()
    if (capturedUrl) return capturedUrl
  } catch (e) {
    console.error('[streamwish] puppeteer error:', e.message)
  }

  return null
}

// ── StreamTape ────────────────────────────────────────────────────────────────
// Técnica: extraer dos fragmentos del JS ofuscado y concatenarlos
async function extractStreamtape(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: embedHeaders('https://streamtape.com/'), timeout: 15000 })
    const text = await res.text()
    // Patrón moderno: robotlink innerHTML con dos partes concatenadas
    const m1 = text.match(/robotlink['"]?\)\.innerHTML\s*=\s*["']([^"']+)["']\s*\+\s*["']([^"']+)["']/)
    if (m1) return 'https:' + m1[1] + m1[2]
    // Patrón alternativo: id=... token=...
    const m2 = text.match(/get_video\?id=([^&"'\s]+)&token=([^&"'\s]+)/)
    if (m2) return `https://streamtape.com/get_video?id=${m2[1]}&token=${m2[2]}&stream=1`
    // Patrón viejo por si acaso
    const m3 = text.match(/id=([^&"']+).*?token=([^&"'\s]+)/)
    if (m3) return `https://streamtape.com/get_video?id=${m3[1]}&token=${m3[2]}&stream=1`
  } catch (e) { console.error('[streamtape]', e.message) }
  return null
}

// ── Voe ───────────────────────────────────────────────────────────────────────
// Técnica fix consumet v1.8.1 (#590 por @aleganza):
//   - Nuevo Voe usa var voe_player={hls:"...",mp4:"..."} o window.___GLOB en JSON
//   - Fallback: algoritmo rot13+base64+charShift anterior (aún activo en algunos CDNs)
async function extractVoe(embedUrl) {
  try {
    // Voe a veces redirige a subdominio diferente
    const res  = await fetch(embedUrl, { headers: embedHeaders(embedUrl), timeout: 15000, redirect: 'follow' })
    const html = await res.text()

    // 1. Nuevo patrón 2024: var sources = {hls:"url"} o window.voe_player
    const m1 = html.match(/(?:var\s+sources|window\.voe_player)\s*=\s*({[^}]+})/)
    if (m1) {
      try {
        const obj = JSON.parse(m1[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'))
        if (obj.hls) return obj.hls
        if (obj.mp4) return obj.mp4
      } catch (_) {}
    }

    // 2. Patrón simple: hls:"url" o mp4:"url" sin envoltura
    const mHls = html.match(/["']hls["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/)
    if (mHls?.[1]) return mHls[1]

    // 3. Algoritmo decrypt heredado (rot13 → replace → base64 → charShift(-3) → reverse → base64)
    const enc = html.match(/\["([A-Za-z0-9+/=@$^~!#&%?*]{20,})"\]/)
    if (enc?.[1]) {
      try {
        let v = enc[1]
        // rot13
        v = v.replace(/[A-Za-z]/g, c => {
          const b = c <= 'Z' ? 65 : 97
          return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b)
        })
        // replace patterns
        for (const p of ['@$', '^^', '~@', '%?', '*~', '!!', '#&']) v = v.split(p).join('_')
        v = v.replace(/_/g, '')
        v = Buffer.from(v, 'base64').toString('utf-8')
        v = v.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('')
        v = v.split('').reverse().join('')
        v = Buffer.from(v, 'base64').toString('utf-8')
        const json = JSON.parse(v)
        return json.source || json.direct_access_url || json.hls || null
      } catch (_) {}
    }
  } catch (e) { console.error('[voe]', e.message) }
  return null
}

// ── Ok.ru ─────────────────────────────────────────────────────────────────────
// Técnica: data-options → flashvars.metadata → videos[].url (HLS > SD)
async function extractOkru(embedUrl) {
  try {
    const vid = embedUrl.match(/ok\.ru\/(?:videoembed|video)\/(\d+)/)?.[1]
    if (!vid) return null
    const res  = await fetch(`https://ok.ru/videoembed/${vid}`, {
      headers: embedHeaders('https://ok.ru/'), timeout: 15000,
    })
    const text = await res.text()
    const dataOpts = text.match(/data-options="([^"]+)"/)
    if (!dataOpts) return null
    const json      = JSON.parse(dataOpts[1].replace(/&quot;/g, '"'))
    const flashVars = JSON.parse(json.flashvars?.metadata || '{}')
    const videos    = flashVars.videos || []
    const hls = videos.find(v => v.name === 'hls')
    const sd  = videos.find(v => v.name?.match(/SD|360|480/))
    return hls?.url || sd?.url || videos[0]?.url || null
  } catch (e) { console.error('[okru]', e.message) }
  return null
}

// ── UpStream ──────────────────────────────────────────────────────────────────
// Técnica: GET embed → PACKER → sources:[{file:"..."}]
async function extractUpStream(embedUrl) {
  try {
    const url = embedUrl.replace(/upstream\.to\//, 'upstream.to/e/')
    const res  = await fetch(url, { headers: embedHeaders(embedUrl), timeout: 15000 })
    const text = await res.text()
    const packed = text.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
    const code   = packed ? jsUnpack(packed[0]) : text
    return extraerUrlDeVideo(code || text)
  } catch (e) { console.error('[upstream]', e.message) }
  return null
}

// ── VidMoly ───────────────────────────────────────────────────────────────────
// Técnica: GET embed → buscar sources JSON o jwplayer setup
async function extractVidMoly(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: embedHeaders(embedUrl), timeout: 15000 })
    const text = await res.text()
    // jwplayer sources array
    const m = text.match(/sources\s*:\s*\[([^\]]+)\]/)
    if (m) {
      const fileMatch = m[1].match(/file\s*:\s*["']([^"']+)["']/)
      if (fileMatch?.[1]) return fileMatch[1]
    }
    return extraerUrlDeVideo(text)
  } catch (e) { console.error('[vidmoly]', e.message) }
  return null
}

// ── Uqload ────────────────────────────────────────────────────────────────────
// Técnica: GET embed → sources:[{file:"url.mp4"}]
async function extractUqload(embedUrl) {
  try {
    const res  = await fetch(embedUrl, { headers: embedHeaders(embedUrl), timeout: 15000 })
    const text = await res.text()
    const src = text.match(/sources\s*:\s*\[{[^}]*file\s*:\s*["']([^"']+)["']/)
    return src?.[1] || null
  } catch (e) { console.error('[uqload]', e.message) }
  return null
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
// Detecta el servidor por dominio y llama al extractor correcto.
// Orden: extractores especializados primero → null si no hay match (yt-dlp lo intenta)

async function resolverEmbedAVideoDirecto(embedUrl) {
  const u = embedUrl.toLowerCase()

  if (u.includes('filemoon') || u.includes('moonplayer') || u.includes('moonvid'))
    return extractFilemoon(embedUrl)

  if (u.includes('mp4upload'))
    return extractMp4Upload(embedUrl)

  if (u.includes('dood') || u.includes('ds2play') || u.includes('dooood') ||
      u.includes('d0000d') || u.includes('dood.wf') || u.includes('dood.to'))
    return extractDoodStream(embedUrl)

  if (u.includes('streamwish') || u.includes('wishembed') || u.includes('embedwish') ||
      u.includes('dwish') || u.includes('awish') || u.includes('mwish') || u.includes('swdyu') ||
      u.includes('vidhide') || u.includes('dlions') || u.includes('filelions') ||
      u.includes('vidhidepre') || u.includes('senvid') || u.includes('vidscr'))
    return extractStreamWish(embedUrl)

  if (u.includes('streamtape') || u.includes('streamta.pe'))
    return extractStreamtape(embedUrl)

  if (u.includes('voe.sx') || u.includes('/voe/') || u.match(/voe\d*\.sx/))
    return extractVoe(embedUrl)

  if (u.includes('ok.ru') || u.includes('okru'))
    return extractOkru(embedUrl)

  if (u.includes('upstream.to') || u.includes('upstream'))
    return extractUpStream(embedUrl)

  if (u.includes('vidmoly'))
    return extractVidMoly(embedUrl)

  if (u.includes('uqload') || u.includes('uqload.co'))
    return extractUqload(embedUrl)

  return null  // sin extractor → yt-dlp lo intenta directamente
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
  const servidores = []

  // ── Estrategia 1: API oficial de JKAnime para obtener los embeds ─────────
  // ani-scrapy usa get_table_download_links que accede a la API interna
  // Endpoint documentado: /ajax/episode/2/?id={slug}&cap={ep}&server={srv}
  // Servidores comunes en JKAnime 2024-2025
  const jkMatch = url.match(/jkanime\.net\/([^/]+)\/(\d+)/)
  if (jkMatch) {
    const slug = jkMatch[1], cap = jkMatch[2]
    const SERVIDORES_JK = [
      'sw',          // StreamWish (más común)
      'jkvideo',     // JK propio
      'okru',        // ok.ru
      'stape',       // StreamTape
      'mp4upload',   // Mp4Upload
      'filemoon',    // Filemoon
      'voe',         // Voe
      'uqload',      // Uqload
      'doodstream',  // DoodStream
    ]
    const headers = {
      ...buildHeaders({ Referer: url }),
      'X-Requested-With': 'XMLHttpRequest',
    }
    for (const srv of SERVIDORES_JK) {
      try {
        const apiUrl = `https://jkanime.net/ajax/episode/2/?id=${slug}&cap=${cap}&server=${srv}`
        const res = await fetch(apiUrl, { headers, timeout: 12000 })
        if (!res.ok) continue
        const json = await res.json()
        // La API retorna: {source:[{file:"url"}]} o {iframe:"url"} o {url:"url"}
        const embedUrl =
          json?.source?.[0]?.file ||
          json?.iframe ||
          json?.url ||
          json?.embed ||
          json?.data?.url ||
          json?.data?.iframe
        if (embedUrl && embedUrl.startsWith('http')) {
          console.log(`[jkanime] servidor ${srv}: ${embedUrl.slice(0, 60)}`)
          servidores.push({ nombre: srv, url: embedUrl })
        }
      } catch (e) { console.error(`[jkanime] API ${srv}:`, e.message) }
    }
  }

  // ── Estrategia 2: parsear __NEXT_DATA__ o script vars del HTML estático ──
  // ani-scrapy detecta que JKAnime es Next.js y extrae datos de __NEXT_DATA__
  if (servidores.length === 0) {
    try {
      const html = await fetchHtml(url)
      const $ = cheerio.load(html)

      // __NEXT_DATA__ JSON (Next.js)
      const nextData = $('script#__NEXT_DATA__').html()
      if (nextData) {
        try {
          const data = JSON.parse(nextData)
          // Buscar arrays de servidores dentro del JSON de Next.js
          const str = JSON.stringify(data)
          const urlMatches = [...str.matchAll(/"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/g)]
          for (const [, u] of urlMatches) {
            if (!servidores.find(s => s.url === u))
              servidores.push({ nombre: detectarServidor(u), url: u, directo: true })
          }
          // Buscar objetos con {server, code} o {name, embed}
          const serverMatches = [...str.matchAll(/"(?:server|embed|iframe)"\s*:\s*"(https?:\/\/[^"]+)"/g)]
          for (const [, u] of serverMatches) {
            if (u.startsWith('http') && !servidores.find(s => s.url === u))
              servidores.push({ nombre: detectarServidor(u), url: u })
          }
        } catch (_) {}
      }

      // Var con lista de servidores en scripts inline (patrón legado)
      $('script:not([src])').each((_, el) => {
        const code = $(el).html() || ''
        // var video = [{...}]
        const videoVar = code.match(/var\s+(?:video|videos|servers?)\s*=\s*(\[[\s\S]*?\]);/)
        if (videoVar) {
          try {
            const lista = JSON.parse(videoVar[1])
            for (const item of lista) {
              const u = item.file || item.url || item.embed || item.src || item.code
              const n = item.name || item.title || item.server || detectarServidor(u || '')
              if (u && u.startsWith('http') && !servidores.find(s => s.url === u))
                servidores.push({ nombre: n.toLowerCase(), url: u })
            }
          } catch (_) {}
        }
      })

      // iframes con src de servidores conocidos
      $('iframe[src]').each((_, el) => {
        const src = $(el).attr('src') || ''
        if (src.startsWith('http') && !servidores.find(s => s.url === src))
          servidores.push({ nombre: detectarServidor(src), url: src })
      })

      // data-url encodificado en base64 (patrón JKAnime viejo)
      $('[data-url]').each((_, el) => {
        const raw = $(el).attr('data-url') || ''
        let finalUrl = raw
        try {
          const decoded = Buffer.from(raw, 'base64').toString('utf-8')
          if (decoded.startsWith('http')) finalUrl = decoded
        } catch (_) {}
        if (finalUrl.startsWith('http') && !servidores.find(s => s.url === finalUrl))
          servidores.push({ nombre: detectarServidor(finalUrl), url: finalUrl })
      })
    } catch (e) { console.error('[jkanime] HTML parse:', e.message) }
  }

  // ── Estrategia 3: Puppeteer — ani-scrapy usa browser para JKAnime ────────
  // Necesario porque JKAnime renderiza los servidores con JS puro (Next.js)
  if (servidores.length === 0) {
    console.log('[jkanime] Usando Puppeteer (sitio JS-renderizado)...')
    try {
      let captured = []
      const browser = await puppeteerExtra.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      })
      const page = await browser.newPage()
      await page.setUserAgent(randomUA())
      await page.setExtraHTTPHeaders(buildHeaders({ Referer: 'https://jkanime.net/' }))

      // Interceptar peticiones de la API y los embeds
      await page.setRequestInterception(true)
      page.on('request', req => {
        // Bloquear recursos pesados para cargar rápido
        const tipo = req.resourceType()
        if (['image','stylesheet','font','media'].includes(tipo)) req.abort()
        else req.continue()
      })
      page.on('response', async response => {
        const rUrl = response.url()
        // Capturar respuestas de la API interna de JKAnime
        if (rUrl.includes('/ajax/episode/') || rUrl.includes('/stream/')) {
          try {
            const json = await response.json()
            const embedUrl = json?.source?.[0]?.file || json?.iframe || json?.url
            if (embedUrl && !captured.find(u => u === embedUrl)) captured.push(embedUrl)
          } catch (_) {}
        }
        // Capturar iframes cargados
        if (/\.(m3u8|mp4)/.test(rUrl) && !captured.find(u => u === rUrl)) {
          captured.push(rUrl)
        }
      })

      try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }) }
      catch (_) {}

      // Intentar hacer clic en cada botón de servidor
      try {
        const botones = await page.$$('.server-item, [data-server], .nav-server a, .servidor-btn, button[data-s]')
        for (const btn of botones.slice(0, 6)) {
          try { await btn.click(); await new Promise(r => setTimeout(r, 1500)) }
          catch (_) {}
        }
      } catch (_) {}

      // Extraer iframes del DOM final
      const iframes = await page.evaluate(() =>
        [...document.querySelectorAll('iframe[src]')].map(f => f.src).filter(s => s.startsWith('http'))
      )
      for (const src of iframes) {
        if (!captured.find(u => u === src)) captured.push(src)
      }

      await browser.close()

      for (const u of captured) {
        servidores.push({
          nombre: detectarServidor(u),
          url: u,
          directo: /\.(m3u8|mp4)/.test(u),
        })
      }
    } catch (e) { console.error('[jkanime] Puppeteer:', e.message) }
  }

  console.log(`[jkanime] ${servidores.length} servidor(es) encontrados`)
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
  // ani-scrapy estrategia: primero buscar el slug exacto del anime,
  // luego construir la URL del episodio directamente.
  const query = temporada > 1 ? `${nombre} temporada ${temporada}` : nombre

  // ── Estrategia 1: API de búsqueda interna de JKAnime ─────────────────────
  // JKAnime tiene una API AJAX para búsqueda en tiempo real
  try {
    const apiSearch = `https://jkanime.net/api/search/?q=${encodeURIComponent(nombre)}`
    const res = await fetch(apiSearch, {
      headers: {
        ...buildHeaders({ Referer: 'https://jkanime.net/' }),
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
      timeout: 10000,
    })
    if (res.ok) {
      const json = await res.json()
      const animes = json?.animes || json?.results || json?.data || []
      if (Array.isArray(animes) && animes.length > 0) {
        // Buscar el mejor match por título
        const nombreNorm = nombre.toLowerCase().trim()
        const mejor = animes.find(a => {
          const t = (a.title || a.name || a.titulo || '').toLowerCase()
          return t.includes(nombreNorm) || nombreNorm.includes(t.split(' ').slice(0,3).join(' '))
        }) || animes[0]
        const slug = mejor.slug || mejor.id || mejor.url?.split('/').filter(Boolean).pop()
        if (slug) {
          const epUrl = `https://jkanime.net/${slug}/${episodio}/`
          console.log(`[jkanime] API search → slug: ${slug}`)
          return epUrl
        }
      }
    }
  } catch (e) { console.error('[jkanime] API search:', e.message) }

  // ── Estrategia 2: Búsqueda HTML con cheerio (misma que ani-scrapy static) ─
  try {
    const html = await fetchHtml(`https://jkanime.net/buscar/?q=${encodeURIComponent(query)}`)
    const $ = cheerio.load(html)

    const links = []
    // Selectores modernos de JKAnime (Next.js renderiza articles/divs)
    $('a[href*="jkanime.net/"], a[href^="/"]').each((_, el) => {
      const href  = $(el).attr('href') || ''
      const title = ($(el).attr('title') || $(el).text()).trim().toLowerCase()
      // Filtrar solo links de anime (no de episodios, categorías, etc.)
      if (href.match(/jkanime\.net\/[a-z0-9-]+\/?$/) || href.match(/^\/[a-z0-9-]+\/?$/)) {
        if (!href.includes('/buscar') && !href.includes('/categoria') && !href.includes('/contacto')) {
          const fullHref = href.startsWith('http') ? href : `https://jkanime.net${href}`
          links.push({ href: fullHref, title })
        }
      }
    })

    if (links.length > 0) {
      // Elegir mejor match: prefer temporada si aplica
      const elegido = elegirPorTemporada(links, temporada)
      const slugMatch = elegido.href.match(/jkanime\.net\/([a-z0-9-]+)\/?$/)
      if (slugMatch) {
        const epUrl = `https://jkanime.net/${slugMatch[1]}/${episodio}/`
        console.log(`[jkanime] HTML search → slug: ${slugMatch[1]}`)
        return epUrl
      }
    }
  } catch (e) { console.error('[jkanime] HTML search:', e.message) }

  // ── Estrategia 3: Slug directo (ani-scrapy: construir desde el nombre) ────
  // JKAnime usa slugs tipo "shingeki-no-kyojin", "one-piece", etc.
  // Para temporadas > 1: "shingeki-no-kyojin-2nd-season" o "-temporada-N"
  try {
    const slugBase = nombre.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // quitar tildes
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')

    const slugsACandidatos = [slugBase]
    if (temporada > 1) {
      slugsACandidatos.push(`${slugBase}-${temporada}nd-season`)
      slugsACandidatos.push(`${slugBase}-temporada-${temporada}`)
      slugsACandidatos.push(`${slugBase}-season-${temporada}`)
    }

    for (const slug of slugsACandidatos) {
      const epUrl = `https://jkanime.net/${slug}/${episodio}/`
      try {
        const res = await fetch(epUrl, {
          headers: buildHeaders({ Referer: 'https://jkanime.net/' }),
          timeout: 8000,
          redirect: 'manual',
        })
        // Si responde 200 o redirige (no 404), la URL existe
        if (res.status === 200 || res.status === 301 || res.status === 302) {
          console.log(`[jkanime] Slug directo: ${slug}`)
          return res.status === 200 ? epUrl : (res.headers.get('location') || epUrl)
        }
      } catch (_) {}
    }
  } catch (e) { console.error('[jkanime] slug directo:', e.message) }

  return null
}



// ─── Descarga con yt-dlp ──────────────────────────────────────────────────────

async function descargarConYtDlp(embedUrl, outputDir) {
  const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s')

  // Paso 0: rechazar URLs que yt-dlp no puede manejar
  const embedLower = embedUrl.toLowerCase()

  // Mega: usar megajs (el handler de Mega/MediaFire está arriba, esto no debería llegar,
  // pero si llega como servidor scrapeado lo saltamos limpiamente)
  if (embedLower.includes('mega.nz') || embedLower.includes('mega.co.nz')) {
    throw new Error('URL de Mega — usar handler de Mega separado')
  }

  // Paso 1: resolver embed con extractores especializados
  let videoUrl = embedUrl
  const urlDirecta = await resolverEmbedAVideoDirecto(embedUrl)
  if (urlDirecta) {
    console.log(`[extractor] URL directa: ${urlDirecta.slice(0, 100)}`)
    videoUrl = urlDirecta
  }

  // Paso 2: yt-dlp con salida en tiempo real en la terminal
  // okcdn.ru: son URLs directas de video (mp4/flv) IP-bound — usar ffmpeg
  const esOkCdn = videoUrl.includes('okcdn.ru')
  const esHLS   = videoUrl.includes('.m3u8') || esOkCdn
  // Para URLs CDN de ok.ru (okcdn.ru) usar referer de ok.ru directamente
  const isOkCdn = videoUrl.includes('okcdn.ru') || videoUrl.includes('ok.ru')
  const referer = isOkCdn ? 'https://ok.ru/' : new URL(embedUrl).origin + '/'

  const cmdArgs = [
    '--no-check-certificate',
    '--no-warnings',
    ...(esHLS ? ['--downloader', 'ffmpeg'] : []),
    '-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--max-filesize', CONFIG.maxFileSize,
    '--add-header', `User-Agent: ${randomUA()}`,
    '--add-header', `Referer: ${referer}`,
    '--add-header', 'Accept-Language: es-419,es;q=0.9',
    '-o', outputTemplate,
    videoUrl,
  ]

  console.log(`\n[yt-dlp] Descargando: ${videoUrl.slice(0, 100)}`)

  await new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderrBuf = ''

    proc.stdout.on('data', d => process.stdout.write(`[yt-dlp] ${d}`))
    proc.stderr.on('data', d => {
      const t = d.toString()
      stderrBuf += t
      process.stderr.write(`[yt-dlp ERR] ${t}`)
    })

    const timer = setTimeout(() => {
      proc.kill()
      reject(new Error(`yt-dlp timeout (${CONFIG.downloadTimeout / 1000}s)`))
    }, CONFIG.downloadTimeout)

    proc.on('close', code => {
      clearTimeout(timer)
      if (code === 0) { resolve() }
      else {
        const msg = stderrBuf.trim() || `yt-dlp salio con codigo ${code}`
        console.error(`[yt-dlp] FALLO (codigo ${code}):\n${msg}`)
        reject(new Error(msg))
      }
    })

    proc.on('error', err => {
      clearTimeout(timer)
      console.error(`[yt-dlp] Error al lanzar proceso: ${err.message}`)
      reject(err)
    })
  })

  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (archivos.length === 0) throw new Error('yt-dlp no genero ningun archivo')
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
      console.error('[animedl] Error:', err)
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
        } catch (err) { console.error(`[busqueda] ${sitio.nombre}:`, err.message) }
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
    } catch (err) {
      console.error(`[descarga] ${srv.nombre} fallo:`, err.message)
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
    console.error('[animedl] Error envio:', err)
    await m.reply(`❌ Falló el envío:\n${err.message}`)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

handler.help = ['animedl <nombre> [tN] <ep>', 'animedl <S> <nombre> [tN] <ep>', 'anilist']
handler.tags = ['descargas']
handler.command = /^(animedl|anilist|cancelar|stop)$/i

export default handler
