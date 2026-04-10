// plugins/anime.js
// Comando: .anime <url> | .anime <nombre> <episodio>
// Soporta: AnimeFLV, TioAnime, JKanime
//
// Mejoras integradas de:
//  - AnyDownload  → detección dinámica + intercepción de red para capturar m3u8/mp4 directo
//  - pupflare     → puppeteer-extra-plugin-stealth para bypass Cloudflare
//  - cloudflare-scrape → headers anti-bot realistas
//  - web-scraping → patrones robustos de scraping con fallback

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import puppeteerExtra from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Activar stealth (igual que pupflare)
puppeteerExtra.use(StealthPlugin())

const execAsync = promisify(exec)

// ─── Configuración ────────────────────────────────────────────────────────────

const CONFIG = {
  maxFileSize: '200m',
  downloadTimeout: 150_000,
  puppeteerTimeout: 30_000,
  // User-agents rotativos (técnica de cloudflare-scrape)
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  ],
  // Headers anti-bot realistas (de cloudflare-scrape)
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

function randomUA() {
  return CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)]
}

function buildHeaders(extra = {}) {
  return { ...CONFIG.baseHeaders, 'User-Agent': randomUA(), ...extra }
}

// ─── Detección ────────────────────────────────────────────────────────────────

function detectarSitio(url) {
  if (url.includes('animeflv')) return 'animeflv'
  if (url.includes('tioanime')) return 'tioanime'
  if (url.includes('jkanime')) return 'jkanime'
  return null
}

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

// ─── Fetch estático → dinámico (patrón AnyDownload) ──────────────────────────

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: buildHeaders({ Referer: new URL(url).origin }),
      timeout: 15000,
    })
    const html = await res.text()

    // AnyDownload: detectar si la página necesita renderizado JS
    const necesitaDinamico =
      html.length < 5000 ||
      /<div id="app"|ng-app|window\.__INITIAL_STATE__|_next\/static/.test(html) ||
      html.includes('challenge-platform') ||
      html.includes('cf-browser-verification') ||
      html.includes('Just a moment')

    if (necesitaDinamico) {
      console.log('[anime] Página dinámica/protegida → Puppeteer stealth')
      return await fetchHtmlConPuppeteer(url)
    }
    return html
  } catch (_) {
    return await fetchHtmlConPuppeteer(url)
  }
}

// ─── Puppeteer stealth con intercepción de red (pupflare + AnyDownload) ──────

async function fetchHtmlConPuppeteer(url) {
  let capturedVideoUrl = null

  const browser = await puppeteerExtra.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })
  const page = await browser.newPage()
  await page.setUserAgent(randomUA())
  await page.setExtraHTTPHeaders(CONFIG.baseHeaders)

  // Interceptar responses para capturar URLs de video directas (AnyDownload)
  page.on('response', (response) => {
    const resUrl = response.url()
    if (CONFIG.videoExtensions.test(resUrl) && !capturedVideoUrl) {
      console.log('[anime] 🎯 Video capturado en red:', resUrl)
      capturedVideoUrl = resUrl
    }
  })

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: CONFIG.puppeteerTimeout })

    // Esperar resolución de Cloudflare challenge (pupflare)
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

    // Esperar que el reproductor JS cargue sus servidores
    await new Promise(r => setTimeout(r, 3000))

    const html = await page.content()
    await browser.close()

    // Adjuntar URL interceptada como comentario para que el scraper la encuentre
    if (capturedVideoUrl) {
      return html + `\n<!-- INTERCEPTED_VIDEO:${capturedVideoUrl} -->`
    }
    return html
  } catch (err) {
    await browser.close()
    throw err
  }
}

// ─── Extracción de URLs de video en scripts inline ────────────────────────────

function extraerUrlsDeScripts($, html, servidores) {
  $('script:not([src])').each((_, el) => {
    const code = $(el).html() || ''
    const re = /['"](https?:\/\/[^'"]{10,}\.(?:mp4|m3u8|webm|mkv)[^'"]*)['"]/gi
    let match
    while ((match = re.exec(code)) !== null) {
      const u = match[1]
      if (!servidores.find(s => s.url === u)) {
        servidores.push({ nombre: detectarServidor(u), url: u, directo: true })
      }
    }
  })
}

// ─── Scrapers por sitio ───────────────────────────────────────────────────────

async function scrapeAnimeFLV(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []

  // URL capturada por Puppeteer (máxima prioridad)
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })

  // var videos = { SUB: [...] } — patrón AnimeFLV
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

async function scrapeTioAnime(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []

  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })

  // data-player en base64
  $('[data-player]').each((_, el) => {
    try {
      const decoded = Buffer.from($(el).attr('data-player'), 'base64').toString('utf-8')
      const nombre = $(el).text().trim().toLowerCase() || detectarServidor(decoded)
      if (decoded.startsWith('http')) servidores.push({ nombre, url: decoded })
    } catch (_) {}
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

  // data-url — puede ser base64 o directo
  $('span[data-url], a[data-url], div[data-url]').each((_, el) => {
    const raw = $(el).attr('data-url') || ''
    const nombre = $(el).text().trim().toLowerCase()
    let finalUrl = raw
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8')
      if (decoded.startsWith('http')) finalUrl = decoded
    } catch (_) {}
    if (finalUrl.startsWith('http')) servidores.push({ nombre: nombre || detectarServidor(finalUrl), url: finalUrl })
  })

  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src')
    if (src?.startsWith('http')) servidores.push({ nombre: detectarServidor(src), url: src })
  })

  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

// ─── Búsqueda en AnimeFLV ─────────────────────────────────────────────────────

async function buscarEnAnimeFLV(nombre, episodio) {
  const query = encodeURIComponent(nombre)
  const html = await fetchHtml(`https://www3.animeflv.net/browse?q=${query}`)
  const $ = cheerio.load(html)

  const primerLink =
    $('ul.ListAnimes li a').first().attr('href') ||
    $('article.Anime a').first().attr('href')

  if (!primerLink) return null

  const slug = primerLink.replace('/anime/', '').replace(/\/$/, '')
  return `https://www3.animeflv.net/ver/${slug}-${episodio}`
}

// ─── Descarga con yt-dlp ──────────────────────────────────────────────────────

async function descargarConYtDlp(videoUrl, outputDir) {
  const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s')
  const esHLS = videoUrl.includes('.m3u8')

  const cmd = [
    'yt-dlp',
    '--no-check-certificate',
    '--no-warnings',
    esHLS ? '--downloader ffmpeg' : '',
    '-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--max-filesize', CONFIG.maxFileSize,
    '--add-header', `"User-Agent: ${randomUA()}"`,
    '--add-header', '"Accept-Language: es-419,es;q=0.9"',
    '-o', `"${outputTemplate}"`,
    `"${videoUrl}"`,
  ].filter(Boolean).join(' ')

  await execAsync(cmd, { timeout: CONFIG.downloadTimeout })

  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (archivos.length === 0) throw new Error('yt-dlp no generó ningún archivo')

  const masReciente = archivos
    .map(f => ({ f, t: fs.statSync(path.join(outputDir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0].f

  return path.join(outputDir, masReciente)
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function animeHandler(sock, msg, args) {
  const from = msg.key.remoteJid

  if (!args || args.length === 0) {
    return sock.sendMessage(from, {
      text: `*🎌 Descargador de Anime*\n\n` +
            `• *.anime <url>* — URL directa del episodio\n` +
            `• *.anime <nombre> <episodio>* — Busca en AnimeFLV\n\n` +
            `*Sitios:* AnimeFLV · TioAnime · JKanime\n` +
            `_Bypass de Cloudflare incluido_ ☁️`
    }, { quoted: msg })
  }

  let episodeUrl = null

  if (args[0].startsWith('http')) {
    episodeUrl = args[0]
  } else {
    const episodio = args[args.length - 1]
    const nombre = args.slice(0, -1).join(' ')

    if (!nombre || isNaN(episodio)) {
      return sock.sendMessage(from, {
        text: '❌ Formato: `.anime one piece 1100`'
      }, { quoted: msg })
    }

    await sock.sendMessage(from, { text: `🔎 Buscando *${nombre}* episodio *${episodio}*...` }, { quoted: msg })

    episodeUrl = await buscarEnAnimeFLV(nombre, episodio)
    if (!episodeUrl) {
      return sock.sendMessage(from, {
        text: '❌ No encontré ese anime.\nPrueba con la URL directa del episodio.'
      }, { quoted: msg })
    }
    await sock.sendMessage(from, { text: `✅ ${episodeUrl}` }, { quoted: msg })
  }

  const sitio = detectarSitio(episodeUrl)
  await sock.sendMessage(from, {
    text: `📡 Extrayendo servidores de *${sitio || 'sitio desconocido'}*...`
  }, { quoted: msg })

  let servidores = []
  try {
    if (sitio === 'animeflv') servidores = await scrapeAnimeFLV(episodeUrl)
    else if (sitio === 'tioanime') servidores = await scrapeTioAnime(episodeUrl)
    else if (sitio === 'jkanime') servidores = await scrapeJKanime(episodeUrl)
    else servidores = [{ nombre: 'directo', url: episodeUrl, directo: true }]
  } catch (err) {
    return sock.sendMessage(from, { text: `❌ Error al analizar la página:\n\`${err.message}\`` }, { quoted: msg })
  }

  if (servidores.length === 0) {
    return sock.sendMessage(from, {
      text: '❌ No encontré servidores. El sitio pudo haber cambiado su estructura.'
    }, { quoted: msg })
  }

  // Prioridad: URLs directas de video (mp4/m3u8) capturadas por Puppeteer
  const directas = servidores.filter(s => s.directo && CONFIG.videoExtensions.test(s.url))
  const listaIntentos = directas.length > 0
    ? [...directas, ...servidores.filter(s => !s.directo)]
    : servidores

  const primerServidor = listaIntentos[0]
  await sock.sendMessage(from, {
    text: `⬇️ Descargando desde *${primerServidor.nombre}*...\n_Puede tardar hasta 2 min_`
  }, { quoted: msg })

  const tmpDir = `/tmp/anime_${Date.now()}`
  fs.mkdirSync(tmpDir, { recursive: true })

  let archivoPath = null
  for (const srv of listaIntentos.slice(0, 4)) {
    try {
      archivoPath = await descargarConYtDlp(srv.url, tmpDir)
      break
    } catch (_) {
      await sock.sendMessage(from, {
        text: `⚠️ *${srv.nombre}* falló → probando siguiente...`
      }, { quoted: msg })
      fs.readdirSync(tmpDir).forEach(f => {
        try { fs.unlinkSync(path.join(tmpDir, f)) } catch (_) {}
      })
    }
  }

  if (!archivoPath) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    return sock.sendMessage(from, {
      text: `❌ Todos los servidores fallaron.\n*Intentados:* ${listaIntentos.slice(0, 4).map(s => s.nombre).join(', ')}`
    }, { quoted: msg })
  }

  try {
    const videoBuffer = fs.readFileSync(archivoPath)
    const fileName = path.basename(archivoPath)
    const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1)

    await sock.sendMessage(from, {
      video: videoBuffer,
      caption: `🎌 *${fileName.replace(/\.[^.]+$/, '')}*\n📦 ${sizeMB} MB · KanaArima-MD`,
      mimetype: 'video/mp4',
      fileName,
    }, { quoted: msg })
  } catch (err) {
    await sock.sendMessage(from, {
      text: `❌ Descargado pero falló el envío:\n${err.message}`
    }, { quoted: msg })
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
