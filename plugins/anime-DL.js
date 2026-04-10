// plugins/anime-DL.js
// Comandos:
//   .anilist              → muestra los sitios disponibles numerados
//   .animedl <url>          → descarga desde URL directa
//   .animedl <nombre> <ep>  → busca en AnimeFLV (sitio 1 por defecto)
//   .animedl <N> <nombre> <ep> → busca en el sitio número N de .anilist
//   .cancelar / .stop       → cancela descarga activa (responder al mensaje)
//   .animedl <mega url>     → descarga desde Mega
//   .animedl <mediafire url>→ descarga desde MediaFire

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

async function buscarEnAnimeFLV(nombre, episodio) {
  const html = await fetchHtml(`https://www3.animeflv.net/browse?q=${encodeURIComponent(nombre)}`)
  const $ = cheerio.load(html)
  const link = $('ul.ListAnimes li a').first().attr('href') || $('article.Anime a').first().attr('href')
  if (!link) return null
  const slug = link.replace('/anime/', '').replace(/\/$/, '')
  return `https://www3.animeflv.net/ver/${slug}-${episodio}`
}

async function buscarEnVerAnimes(nombre, episodio) {
  const html = await fetchHtml(`https://wwv.veranimes.net/?s=${encodeURIComponent(nombre)}`)
  const $ = cheerio.load(html)
  const link = $('article a, .item a, h2 a, .title a').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/\/(?:anime|ver)\/([^/]+?)(?:-\d+)?$/)
  if (!slugMatch) return null
  return `https://wwv.veranimes.net/ver/${slugMatch[1].replace(/-\d+$/, '')}-${episodio}`
}

async function buscarEnLatAnime(nombre, episodio) {
  const html = await fetchHtml(`https://latanime.org/?s=${encodeURIComponent(nombre)}`)
  const $ = cheerio.load(html)
  const link = $('a[href*="/ver/"], article a').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://latanime.org/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnMonosChinos(nombre, episodio) {
  const html = await fetchHtml(`https://vww.monoschinos2.net/buscar?q=${encodeURIComponent(nombre)}`)
  const $ = cheerio.load(html)
  const link = $('a[href*="/ver/"]').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://vww.monoschinos2.net/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnAnimeDBS(nombre, episodio) {
  const html = await fetchHtml(`https://www.animedbs.online/?s=${encodeURIComponent(`${nombre} episodio ${episodio}`)}`)
  const $ = cheerio.load(html)
  const link = $('article a, h2 a, .entry-title a').first().attr('href') || ''
  return link.startsWith('http') ? link : null
}

async function buscarEnJKanime(nombre, episodio) {
  const html = await fetchHtml(`https://jkanime.net/buscar/?q=${encodeURIComponent(nombre)}`)
  const $ = cheerio.load(html)
  const link = $('a[href*="jkanime.net/"]').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/jkanime\.net\/([^/]+)/)
  if (!slugMatch) return null
  return `https://jkanime.net/${slugMatch[1]}/${episodio}/`
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
      `• *.animedl <N> <nombre> <ep>*\n` +
      `  Busca en el sitio número N\n\n` +
      `*Ejemplos:*\n` +
      `  .animedl 1 one piece 1100\n` +
      `  .animedl 6 oshi no ko 1\n` +
      `  .animedl 3 solo leveling 5\n\n` +
      `_Sin número = busca en todos hasta encontrarlo_`
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
      `• *.animedl <N> <nombre> <ep>* — Buscar en sitio N\n` +
      `• *.animedl <nombre> <ep>* — Buscar en todos\n` +
      `• *.animedl <url>* — URL directa del episodio\n` +
      `• *.animedl <url mega/mediafire>* — Descargar archivo\n\n` +
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

  // Detectar si el primer argumento es un número de sitio: .animedl 1 oshi no ko 1
  let sitioElegido = null
  let argsParaAnime = rawArgs

  if (/^\d+$/.test(rawArgs[0]) && rawArgs.length >= 3) {
    const idNum = parseInt(rawArgs[0])
    const sitioCandidate = getSitioPorId(idNum)
    // Confirmar que hay al menos nombre + episodio después del número
    if (sitioCandidate && !isNaN(rawArgs[rawArgs.length - 1])) {
      sitioElegido = sitioCandidate
      argsParaAnime = rawArgs.slice(1) // quitar el número
    }
  }

  let episodeUrl = null

  // ── Modo URL directa ──
  if (argsParaAnime[0].startsWith('http')) {
    episodeUrl = argsParaAnime[0]
    // Detectar sitio por dominio
    sitioElegido = getSitioPorDominio(episodeUrl)
  } else {
    // ── Modo búsqueda ──
    const episodio = argsParaAnime[argsParaAnime.length - 1]
    const nombre   = argsParaAnime.slice(0, -1).join(' ')

    if (!nombre || isNaN(episodio)) {
      return m.reply(
        `❌ Formato incorrecto.\n\n` +
        `• *.animedl <nombre> <ep>*\n` +
        `• *.animedl <N> <nombre> <ep>*\n\n` +
        `_Usa .anilist para ver los sitios disponibles_`
      )
    }

    if (sitioElegido) {
      // Buscar solo en el sitio elegido
      await m.reply(`🔎 Buscando *${nombre}* ep *${episodio}* en *${sitioElegido.nombre}*...`)
      episodeUrl = await sitioElegido.buscar(nombre, episodio)
      if (!episodeUrl) {
        return m.reply(
          `❌ No encontré *${nombre}* episodio *${episodio}* en *${sitioElegido.nombre}*.\n\n` +
          `Prueba con otro sitio:\n` +
          SITIOS.filter(s => s.id !== sitioElegido.id)
                .map(s => `  .animedl ${s.id} ${nombre} ${episodio}`)
                .join('\n')
        )
      }
    } else {
      // Sin número → buscar en todos en orden
      await m.reply(`🔎 Buscando *${nombre}* episodio *${episodio}* en todos los sitios...`)
      for (const sitio of SITIOS) {
        try {
          episodeUrl = await sitio.buscar(nombre, episodio)
          if (episodeUrl) {
            sitioElegido = sitio
            await m.reply(`✅ Encontrado en *${sitio.nombre}*`)
            break
          }
        } catch (_) {}
      }
      if (!episodeUrl) {
        return m.reply(
          `❌ No encontré *${nombre}* episodio *${episodio}* en ningún sitio.\n` +
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

handler.help = ['animedl <N|url|nombre> <ep>', 'anilist']
handler.tags = ['descargas']
handler.command = /^(animedl|anilist|cancelar|stop)$/i

export default handler
