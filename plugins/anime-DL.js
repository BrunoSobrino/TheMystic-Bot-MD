// plugins/anime-DL.js
// Comando: .animedl <url> | .animedl <nombre> <episodio>
// Soporta: AnimeFLV, TioAnime, JKanime
//
// Mejoras integradas de:
//  - AnyDownload  → detección dinámica + intercepción de red para capturar m3u8/mp4 directo
//  - pupflare     → puppeteer-extra-plugin-stealth para bypass Cloudflare
//  - cloudflare-scrape → headers anti-bot realistas

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import puppeteerExtra from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteerExtra.use(StealthPlugin())

const execAsync = promisify(exec)

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

const randomUA = () => CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)]
const buildHeaders = (extra = {}) => ({ ...CONFIG.baseHeaders, 'User-Agent': randomUA(), ...extra })

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
    if (capturedVideoUrl) return html + `\n`
    return html
  } catch (err) {
    await browser.close()
    throw err
  }
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

async function scrapeTioAnime(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []

  // URL capturada por Puppeteer (máxima prioridad)
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })

  // Estructura ACTUAL TioAnime: var videos = [["Servidor", "url"], ...]
  $('script').each((_, el) => {
    const code = $(el).html() || ''

    // Array de arrays [nombre, url]
    const matchArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (matchArr) {
      try {
        const lista = JSON.parse(matchArr[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            servidores.push({ nombre: String(item[0]).toLowerCase() || detectarServidor(item[1]), url: item[1] })
          } else if (item?.file?.startsWith('http')) {
            // Variante objeto {file, label}
            servidores.push({ nombre: item.label?.toLowerCase() || detectarServidor(item.file), url: item.file })
          }
        }
      } catch (_) {}
    }

    // Fallback: objeto {SUB:[...], LAT:[...]} (estructura antigua)
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
  })

  // Fallback: [data-player] base64 (estructura antigua)
  if (servidores.length === 0) {
    $('[data-player]').each((_, el) => {
      try {
        const raw = $(el).attr('data-player') || ''
        const decoded = Buffer.from(raw, 'base64').toString('utf-8')
        const nombre = $(el).text().trim().toLowerCase() || detectarServidor(decoded)
        if (decoded.startsWith('http')) servidores.push({ nombre, url: decoded })
      } catch (_) {}
    })
  }

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

  // URL capturada por Puppeteer
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>\n]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })

  // Estructura ACTUAL JKanime: API AJAX /ajax/episode/2/?id=SLUG&cap=N&server=S
  // Extraer slug y número de episodio de la URL: /SLUG/EP/
  const jkMatch = url.match(/jkanime\.net\/([^/]+)\/(\d+)/)
  if (jkMatch) {
    const slug = jkMatch[1]
    const cap  = jkMatch[2]
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

  // Fallback: selectores HTML (estructura anterior con data-url base64)
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

  return path.join(
    outputDir,
    archivos.map(f => ({ f, t: fs.statSync(path.join(outputDir, f)).mtimeMs }))
           .sort((a, b) => b.t - a.t)[0].f
  )
}

// ─── Handler principal (formato KanaArima-MD) ─────────────────────────────────

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Sin argumentos → mostrar ayuda
  if (!text || !text.trim()) {
    return m.reply(
      `*🎌 Descargador de Anime*\n\n` +
      `• *${usedPrefix + command} <url>* — URL directa del episodio\n` +
      `• *${usedPrefix + command} <nombre> <episodio>* — Busca en AnimeFLV\n\n` +
      `*Sitios soportados:* AnimeFLV · TioAnime · JKanime\n` +
      `_Bypass de Cloudflare incluido_ ☁️`
    )
  }

  const args = text.trim().split(/\s+/)
  let episodeUrl = null

  if (args[0].startsWith('http')) {
    episodeUrl = args[0]
  } else {
    const episodio = args[args.length - 1]
    const nombre = args.slice(0, -1).join(' ')

    if (!nombre || isNaN(episodio)) {
      return m.reply(`❌ Formato correcto: *${usedPrefix + command} one piece 1100*`)
    }

    await m.reply(`🔎 Buscando *${nombre}* episodio *${episodio}*...`)
    episodeUrl = await buscarEnAnimeFLV(nombre, episodio)

    if (!episodeUrl) {
      return m.reply('❌ No encontré ese anime.\nPrueba con la URL directa del episodio.')
    }
    await m.reply(`✅ ${episodeUrl}`)
  }

  const sitio = detectarSitio(episodeUrl)
  await m.reply(`📡 Extrayendo servidores de *${sitio || 'sitio desconocido'}*...`)

  let servidores = []
  try {
    if (sitio === 'animeflv')     servidores = await scrapeAnimeFLV(episodeUrl)
    else if (sitio === 'tioanime') servidores = await scrapeTioAnime(episodeUrl)
    else if (sitio === 'jkanime') servidores = await scrapeJKanime(episodeUrl)
    else                           servidores = [{ nombre: 'directo', url: episodeUrl, directo: true }]
  } catch (err) {
    return m.reply(`❌ Error al analizar la página:\n\`${err.message}\``)
  }

  if (servidores.length === 0) {
    return m.reply('❌ No encontré servidores. El sitio pudo haber cambiado su estructura.')
  }

  const directas = servidores.filter(s => s.directo && CONFIG.videoExtensions.test(s.url))
  const listaIntentos = directas.length > 0
    ? [...directas, ...servidores.filter(s => !s.directo)]
    : servidores

  await m.reply(`⬇️ Descargando desde *${listaIntentos[0].nombre}*...\n_Puede tardar hasta 2 min_`)

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
      `❌ Todos los servidores fallaron.\n*Intentados:* ${listaIntentos.slice(0, 4).map(s => s.nombre).join(', ')}`
    )
  }

  try {
    let finalPath = archivoPath
    let sizeMB = fs.statSync(archivoPath).size / 1024 / 1024

    // Comprimir con ffmpeg si supera 50 MB
    if (sizeMB > 50) {
      await m.reply(`⚙️ Archivo grande (${sizeMB.toFixed(1)} MB) → comprimiendo...`)
      const compPath = archivoPath.replace(/\.[^.]+$/, '_c.mp4')
      try {
        await execAsync(
          `ffmpeg -i "${archivoPath}" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -movflags +faststart "${compPath}"`,
          { timeout: 180_000 }
        )
        if (fs.existsSync(compPath)) {
          finalPath = compPath
          sizeMB = fs.statSync(compPath).size / 1024 / 1024
        }
      } catch (_) {}
    }

    const fileName = path.basename(finalPath).replace(/_c\.mp4$/, '.mp4')
    const caption  = `🎌 *${fileName.replace(/\.[^.]+$/, '')}*\n📦 ${sizeMB.toFixed(1)} MB · KanaArima-MD`

    // Usar { url: path } en vez de readFileSync — Baileys sube en stream
    const fileRef = { url: finalPath }

    try {
      await conn.sendMessage(m.chat, {
        video: fileRef,
        caption,
        mimetype: 'video/mp4',
        fileName,
      }, { quoted: m })
    } catch (_videoErr) {
      // Fallback: documento (igual stream, sin límite de preview)
      await m.reply('⚠️ Reintentando como documento...')
      await conn.sendMessage(m.chat, {
        document: fileRef,
        caption,
        mimetype: 'video/mp4',
        fileName,
      }, { quoted: m })
    }
  } catch (err) {
    await m.reply(`❌ Falló el envío:\n${err.message}`)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

handler.help = ['animedl <url|nombre episodio>']
handler.tags = ['descargas']
handler.command = /^animedl$/i

export default handler
      
