// plugins/anime-DL.js
// Comandos: 
// .animelist -> Muestra sitios disponibles
// .animedl <url> | .animedl <num_sitio> <nombre> <episodio>
// Soporta: AnimeFLV, TioAnime, JKanime, LatAnime, MonosChinos, AnimeDBS

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

const SITIOS_DISPONIBLES = [
  { id: 1, nombre: 'AnimeFLV', url: 'https://www3.animeflv.net' },
  { id: 2, nombre: 'VerAnimes', url: 'https://wwv.veranimes.net' },
  { id: 3, nombre: 'LatAnime', url: 'https://latanime.org' },
  { id: 4, nombre: 'MonosChinos', url: 'https://vww.monoschinos2.net' },
  { id: 5, nombre: 'AnimeDBS', url: 'https://www.animedbs.online' }
]

const randomUA = () => CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)]
const buildHeaders = (extra = {}) => ({ ...CONFIG.baseHeaders, 'User-Agent': randomUA(), ...extra })

function detectarSitio(url) {
  if (url.includes('animeflv')) return 'animeflv'
  if (url.includes('veranimes'))  return 'veranimes'
  if (url.includes('latanime'))   return 'latanime'
  if (url.includes('animedbs'))   return 'animedbs'
  if (url.includes('monoschinos')) return 'monoschinos'
  if (url.includes('jkanime'))    return 'jkanime'
  return null
}

function detectarServidor(url) {
  for (const s of CONFIG.servidoresPreferidos) {
    if (url.includes(s)) return s
  }
  return 'generico'
}

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
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>
]+)/)
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
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>
]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    const matchArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (matchArr) {
      try {
        const lista = JSON.parse(matchArr[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            servidores.push({ nombre: String(item[0]).toLowerCase() || detectarServidor(item[1]), url: item[1] })
          } else if (item?.file?.startsWith('http')) {
            servidores.push({ nombre: item.label?.toLowerCase() || detectarServidor(item.file), url: item.file })
          }
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
  const intercepted = html.match(/INTERCEPTED_VIDEO:(https?:\/\/[^\s"<>
]+)/)
  if (intercepted) servidores.push({ nombre: detectarServidor(intercepted[1]), url: intercepted[1], directo: true })
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    const matchArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (matchArr) {
      try {
        const lista = JSON.parse(matchArr[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            servidores.push({ nombre: String(item[0]).toLowerCase() || detectarServidor(item[1]), url: item[1] })
          }
        }
      } catch (_) {}
    }
  })
  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src')
    if (src?.startsWith('http')) servidores.push({ nombre: detectarServidor(src), url: src })
  })
  extraerUrlsDeScripts($, html, servidores)
  return servidores
}

async function buscarEnLatAnime(nombre, episodio) {
  const query = encodeURIComponent(nombre)
  const html = await fetchHtml(`https://latanime.org/?s=${query}`)
  const $ = cheerio.load(html)
  const link = $('a[href*="/ver/"], article a').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://latanime.org/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnMonosChinos(nombre, episodio) {
  const query = encodeURIComponent(nombre)
  const html = await fetchHtml(`https://vww.monoschinos2.net/buscar?q=${query}`)
  const $ = cheerio.load(html)
  const link = $('a[href*="/ver/"]').first().attr('href') || ''
  if (!link) return null
  const slugMatch = link.match(/\/ver\/([^/]+?)(?:-episodio-\d+)?$/)
  if (!slugMatch) return null
  return `https://vww.monoschinos2.net/ver/${slugMatch[1]}-episodio-${episodio}`
}

async function buscarEnAnimeDBS(nombre, episodio) {
  const query = encodeURIComponent(`${nombre} episodio ${episodio}`)
  const html = await fetchHtml(`https://www.animedbs.online/?s=${query}`)
  const $ = cheerio.load(html)
  const link = $('article a, h2 a, .entry-title a').first().attr('href') || ''
  return link.startsWith('http') ? link : null
}

async function scrapeJKanime(url) {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const servidores = []
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
  return servidores
}

async function buscarEnAnimeFLV(nombre, episodio) {
  const query = encodeURIComponent(nombre)
  const html = await fetchHtml(`https://www3.animeflv.net/browse?q=${query}`)
  const $ = cheerio.load(html)
  const primerLink = $('ul.ListAnimes li a').first().attr('href') || $('article.Anime a').first().attr('href')
  if (!primerLink) return null
  const slug = primerLink.replace('/anime/', '').replace(/\/$/, '')
  return `https://www3.animeflv.net/ver/${slug}-${episodio}`
}

async function buscarEnVerAnimes(nombre, episodio) {
  const query = encodeURIComponent(nombre)
  const html = await fetchHtml(`https://wwv.veranimes.net/?s=${query}`)
  const $ = cheerio.load(html)
  const primerLink = $('article a, .item a, h2 a, .title a').first().attr('href') || ''
  if (!primerLink) return null
  const slugMatch = primerLink.match(/\/(?:anime|ver)\/([^/]+?)(?:-\d+)?$/)
  if (!slugMatch) return null
  const slug = slugMatch[1].replace(/-\d+$/, '')
  return `https://wwv.veranimes.net/ver/${slug}-${episodio}`
}

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
    '-o', `"${outputTemplate}"`,
    `"${videoUrl}"`,
  ].filter(Boolean).join(' ')
  await execAsync(cmd, { timeout: CONFIG.downloadTimeout })
  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (archivos.length === 0) throw new Error('yt-dlp no generó ningún archivo')
  return path.join(outputDir, archivos[0])
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command === 'animelist') {
    let listaTxt = `*🎌 Lista de Sitios Disponibles*\n\n`
    SITIOS_DISPONIBLES.forEach(s => { listaTxt += `*${s.id}.* ${s.nombre} (${s.url})\n` })
    listaTxt += `\nUso: \`${usedPrefix}animedl <número> <nombre> <episodio>\``
    return m.reply(listaTxt)
  }

  if (!text || !text.trim()) {
    return m.reply(`*🎌 Descargador de Anime*\n\n• *${usedPrefix}animelist*\n• *${usedPrefix + command} <url>*\n• *${usedPrefix + command} <num> <nombre> <ep>*`)
  }

  const args = text.trim().split(/\s+/)
  let episodeUrl = null

  if (args[0].startsWith('http')) {
    episodeUrl = args[0]
  } else {
    let siteSelector = /\d+/.test(args[0]) ? parseInt(args[0]) : null
    let startIndex = siteSelector ? 1 : 0
    const episodio = args[args.length - 1]
    const nombre = args.slice(startIndex, -1).join(' ')

    if (!nombre || isNaN(episodio)) return m.reply(`❌ Formato incorrecto.`)

    await m.reply(`🔎 Buscando *${nombre}* ep *${episodio}*...`)
    if (siteSelector === 1) episodeUrl = await buscarEnAnimeFLV(nombre, episodio)
    else if (siteSelector === 2) episodeUrl = await buscarEnVerAnimes(nombre, episodio)
    else if (siteSelector === 3) episodeUrl = await buscarEnLatAnime(nombre, episodio)
    else if (siteSelector === 4) episodeUrl = await buscarEnMonosChinos(nombre, episodio)
    else if (siteSelector === 5) episodeUrl = await buscarEnAnimeDBS(nombre, episodio)
    else episodeUrl = await buscarEnAnimeFLV(nombre, episodio) || await buscarEnVerAnimes(nombre, episodio)
  }

  if (!episodeUrl) return m.reply('❌ No encontrado.')
  const sitio = detectarSitio(episodeUrl)
  await m.reply(`📡 Analizando *${sitio || 'sitio'}*...`)

  let servidores = []
  try {
    if (sitio === 'animeflv') servidores = await scrapeAnimeFLV(episodeUrl)
    else if (sitio === 'veranimes') servidores = await scrapeVerAnimes(episodeUrl)
    else if (sitio === 'jkanime') servidores = await scrapeJKanime(episodeUrl)
    else servidores = await scrapeGenerico(episodeUrl)
  } catch (err) { return m.reply(`❌ Error: ${err.message}`) }

  if (servidores.length === 0) return m.reply('❌ Sin servidores.')
  await m.reply(`⬇️ Descargando...`)

  const tmpDir = path.join('/tmp', `anime_${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    const archivoPath = await descargarConYtDlp(servidores[0].url, tmpDir)
    const sizeMB = fs.statSync(archivoPath).size / 1024 / 1024
    const fileName = path.basename(archivoPath)
    const caption = `🎌 *${fileName.replace(/\.[^.]+$/, '')}*\n📦 ${sizeMB.toFixed(1)} MB\n🤖 KanaArima-MD`

    await conn.sendMessage(m.chat, { document: { url: archivoPath }, caption, mimetype: 'video/mp4', fileName }, { quoted: m })
  } catch (err) { await m.reply(`❌ Falló: ${err.message}`) }
  finally { fs.rmSync(tmpDir, { recursive: true, force: true }) }
}

handler.help = ['animelist', 'animedl']
handler.tags = ['descargas']
handler.command = /^(animedl|animelist)$/i
export default handler;
