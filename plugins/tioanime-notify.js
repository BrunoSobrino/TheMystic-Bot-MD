// plugins/tioanime-notify.js — v2.0
//
// Notificador automático de nuevos episodios de TioAnime
//
// Comandos:
//   .tiostart               → inicia el notificador en el grupo/chat actual
//   .tiostop                → detiene el notificador en el chat actual
//   .tiostatus              → muestra estado y cola
//   .tioqueue               → ver episodios en cola
//   .tioflush               → vaciar la cola de este chat
//   .tiocheck               → forzar chequeo ahora
//   .tiointerval <minutos>  → cambiar intervalo (mín 5, máx 60)
//   .tioexample             → probar con el episodio más reciente (sin marcar como visto)

import axios        from 'axios'
import * as cheerio from 'cheerio'
import fs           from 'fs'
import path         from 'path'
import { spawn }    from 'child_process'
import { pipeline } from 'stream/promises'
import { File as MegaFile } from 'megajs'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIOANIME_URL           = 'https://tioanime.com'
const SEEN_FILE              = path.join(process.env.TMPDIR || '/tmp', 'tioanime_seen.json')
const STATE_FILE             = path.join(process.env.TMPDIR || '/tmp', 'tioanime_state.json')
const CHECK_INTERVAL_DEFAULT = 10        // minutos
const QUEUE_DELAY            = 90_000    // ms entre ítems de cola (90 seg)
const DL_TIMEOUT             = 3 * 60 * 60 * 1000

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const HEADERS = {
  'User-Agent'     : UA,
  'Accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
}

// ─── Estado global ────────────────────────────────────────────────────────────

global.tioActiveChats  = global.tioActiveChats  || new Map()
global.tioEpisodeQueue = global.tioEpisodeQueue || []
global.tioQueueRunning = global.tioQueueRunning || false

// ─── Persistencia ─────────────────────────────────────────────────────────────

function loadSeen()   { try { return JSON.parse(fs.readFileSync(SEEN_FILE,  'utf-8')) } catch (_) { return {} } }
function saveSeen(d)  { try { fs.writeFileSync(SEEN_FILE,  JSON.stringify(d, null, 2)) } catch (_) {} }
function loadState()  { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) } catch (_) { return {} } }
function saveState(d) { try { fs.writeFileSync(STATE_FILE, JSON.stringify(d, null, 2)) } catch (_) {} }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function zeroPad(n)  { return String(n).padStart(2, '0') }
function safeFile(s) { return s.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim() }
function buildFileName(titulo, epNum) { return `${zeroPad(epNum)} ${safeFile(titulo)}.mp4` }

// ─── Scraping ─────────────────────────────────────────────────────────────────

async function fetchLatestEpisodes() {
  const { data } = await axios.get(TIOANIME_URL, { headers: HEADERS, timeout: 15000 })
  const $    = cheerio.load(data)
  const lista = []

  $('ul.episodes-list li, .episodes-list li, article.episode, .episode-item, .anime-item').each((_, el) => {
    const $el   = $(el)
    const aTag  = $el.find('a').first()
    const href  = aTag.attr('href') || ''
    if (!href) return

    const m = href.match(/\/ver\/(.+?)[-_](\d+)\/?$/)
    if (!m) return

    const slug   = m[1]
    const epNum  = parseInt(m[2])
    const titulo = ($el.find('h3, h2, .title, .anime-title, p').first().text() || aTag.attr('title') || slug.replace(/-/g, ' ')).trim()
    const imgEl  = $el.find('img').first()
    const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || ''
    const imgUrl = imgSrc.startsWith('http') ? imgSrc : imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc ? TIOANIME_URL + imgSrc : ''
    const epUrl  = href.startsWith('http') ? href : TIOANIME_URL + href
    const id     = `${slug}-${epNum}`

    if (!lista.find(e => e.id === id)) lista.push({ id, slug, titulo, epNum, epUrl, imgUrl })
  })

  // Fallback: cualquier link /ver/
  if (lista.length === 0) {
    $('a[href*="/ver/"]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const m    = href.match(/\/ver\/(.+?)[-_](\d+)\/?$/)
      if (!m) return
      const slug   = m[1]
      const epNum  = parseInt(m[2])
      const titulo = ($(el).attr('title') || $(el).text() || slug.replace(/-/g, ' ')).trim()
      const epUrl  = href.startsWith('http') ? href : TIOANIME_URL + href
      const id     = `${slug}-${epNum}`
      if (!lista.find(e => e.id === id)) lista.push({ id, slug, titulo, epNum, epUrl, imgUrl: '' })
    })
  }

  console.log(`[tioanime-notify] ${lista.length} episodios en portada`)
  return lista
}

async function scrapeServidores(epUrl) {
  const { data } = await axios.get(epUrl, { headers: { ...HEADERS, Referer: TIOANIME_URL }, timeout: 15000 })
  const $    = cheerio.load(data)
  const srvs = []

  // ── 1. Links de descarga directa (Mega, MediaFire, etc.) ─────────────────
  // TioAnime tiene una sección "Descargas" con botones <a href="https://mega.nz/...">
  $('a[href]').each((_, el) => {
    const href  = $(el).attr('href') || ''
    const label = $(el).text().trim().toLowerCase()
    if (!href.startsWith('http')) return
    const esMega      = href.includes('mega.nz') || href.includes('mega.co.nz')
    const esMediafire = href.includes('mediafire.com')
    const esOtro      = href.includes('gofile.io') || href.includes('1fichier') || href.includes('pixeldrain')
    if ((esMega || esMediafire || esOtro) && !srvs.find(s => s.url === href)) {
      const nombre = esMega ? 'mega' : esMediafire ? 'mediafire' : label || 'descarga'
      srvs.push({ nombre, url: href, directo: true })
    }
  })

  // ── 2. var videos = [["servidor", "url"], ...] (embeds) ──────────────────
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    if (!code.includes('var videos')) return

    const match = code.match(/var\s+videos\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])\s*[;,]?/)
    if (match) {
      try {
        for (const item of JSON.parse(match[1])) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            const url    = item[1]
            const nombre = String(item[0]).toLowerCase()
            if (srvs.find(s => s.url === url)) return
            // Mega/MediaFire dentro de var videos → tratarlos como directos
            const esMega      = url.includes('mega.nz') || url.includes('mega.co.nz')
            const esMediafire = url.includes('mediafire.com')
            // Saltar servidores sin soporte real
            const sinSoporte  = url.includes('hqq.tv') || url.includes('netu.tv') || url.includes('netu.ac')
            if (sinSoporte) return
            srvs.push({
              nombre : esMega ? 'mega' : esMediafire ? 'mediafire' : nombre,
              url,
              directo: esMega || esMediafire,
            })
          }
        }
      } catch (_) {}
    }

    if (!srvs.find(s => !s.directo)) {
      const mArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
      if (mArr) {
        try {
          for (const item of JSON.parse(mArr[1])) {
            const url = item?.url || item?.file || item?.code || ''
            const nom = (item?.title || item?.label || item?.server || '').toLowerCase()
            if (!url.startsWith('http') || srvs.find(s => s.url === url)) return
            const esMega      = url.includes('mega.nz')
            const esMediafire = url.includes('mediafire.com')
            const sinSoporte  = url.includes('hqq.tv') || url.includes('netu.tv') || url.includes('netu.ac')
            if (sinSoporte) return
            srvs.push({
              nombre : esMega ? 'mega' : esMediafire ? 'mediafire' : nom || url,
              url,
              directo: esMega || esMediafire,
            })
          }
        } catch (_) {}
      }
    }
  })

  // ── 3. iframes como último recurso ────────────────────────────────────────
  if (srvs.length === 0) {
    $('iframe[src]').each((_, el) => {
      const src = $(el).attr('src') || ''
      if (src.startsWith('http')) srvs.push({ nombre: 'iframe', url: src, directo: false })
    })
  }

  console.log(`[tioanime-notify] ${srvs.length} servidores — Mega: ${srvs.filter(s => s.nombre === 'mega').length}`)
  return srvs
}

// ─── Descarga ─────────────────────────────────────────────────────────────────

// Mega siempre primero, luego embeds por preferencia
const PREFS_EMBED = ['mp4upload', 'filemoon', 'streamwish', 'streamtape', 'doodstream', 'voe', 'vidhide', 'okru', 'mixdrop']

function ordenarServidores(srvs) {
  const mega      = srvs.filter(s => s.nombre === 'mega')
  const mediafire = srvs.filter(s => s.nombre === 'mediafire')
  const otros     = srvs.filter(s => s.directo && s.nombre !== 'mega' && s.nombre !== 'mediafire')
  const embeds    = [...srvs.filter(s => !s.directo)].sort((a, b) => {
    const ia = PREFS_EMBED.findIndex(p => a.nombre.includes(p) || a.url.includes(p))
    const ib = PREFS_EMBED.findIndex(p => b.nombre.includes(p) || b.url.includes(p))
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  // Orden: Mega → MediaFire → otros directos → embeds
  return [...mega, ...mediafire, ...otros, ...embeds]
}

// Descarga desde Mega con megajs
async function descargarMega(megaUrl, outputDir, fileName) {
  // Normalizar URL: /embed/!ID!KEY → /file/ID#KEY
  let url = megaUrl
  const m1 = megaUrl.match(/mega\.nz\/(?:embed\/)?[#!]*([A-Za-z0-9_-]{8,})!([A-Za-z0-9_-]{40,})/)
  if (m1) url = `https://mega.nz/file/${m1[1]}#${m1[2]}`
  const m2 = megaUrl.match(/mega\.nz\/file\/([A-Za-z0-9_-]+)!([A-Za-z0-9_-]+)/)
  if (m2) url = `https://mega.nz/file/${m2[1]}#${m2[2]}`

  console.log(`[tioanime-notify] Mega → ${url.slice(0, 80)}`)

  const file = MegaFile.fromURL(url)
  await file.loadAttributes()

  const megaName = file.name || fileName
  const sizeMB   = (file.size / 1024 / 1024).toFixed(1)
  console.log(`[tioanime-notify] Mega: ${megaName} (${sizeMB} MB)`)

  const destPath   = path.join(outputDir, fileName)
  const fileStream = file.download()

  let downloaded = 0
  fileStream.on('data', chunk => {
    downloaded += chunk.length
    process.stdout.write(`\r[MEGA] ${((downloaded / file.size) * 100).toFixed(1)}% | ${(downloaded / 1024 / 1024).toFixed(1)} MB`)
  })

  await pipeline(fileStream, fs.createWriteStream(destPath))
  console.log(`\n[tioanime-notify] Mega ✅ ${fileName}`)
  return destPath
}

// ─── Extractores de embed → URL directa ──────────────────────────────────────

function jsUnpack(packed) {
  try {
    const m = packed.match(/}\s*\('(.*)',\s*(.*?),\s*(\d+),\s*'(.*?)'\.split\('\|'\)/)
    if (!m) return null
    const payload = m[1].replace(/\\'/g, "'")
    const radix   = parseInt(m[2]) || 36
    const symtab  = m[4].split('|')
    return payload.replace(/\b[a-zA-Z0-9_]+\b/g, word => {
      const idx = parseInt(word, radix)
      return (symtab[idx] && symtab[idx] !== '') ? symtab[idx] : word
    })
  } catch (_) { return null }
}

function extraerUrlVideo(code) {
  const patrones = [
    /sources\s*:\s*\[{[^}]*file\s*:\s*["']([^"']+)["']/,
    /file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /src\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /["']([^"']+\.m3u8[^"']*)["']/i,
  ]
  for (const re of patrones) {
    const m = code.match(re)
    if (m?.[1]?.startsWith('http')) return m[1]
  }
  return null
}

async function resolverEmbed(embedUrl) {
  const u = embedUrl.toLowerCase()

  // ── Voe ──────────────────────────────────────────────────────────────────
  if (u.includes('voe.sx') || u.match(/voe\d*\.sx/)) {
    try {
      const { data } = await axios.get(embedUrl.replace(/\/e\//, '/'), { headers: { ...HEADERS, Referer: embedUrl }, timeout: 15000 })
      const mHls = data.match(/["']hls["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/)
      if (mHls?.[1]) return mHls[1]
      // Patrón ROT13 + base64 (Voe nuevo)
      const enc = data.match(/\["([A-Za-z0-9+/=@$^~!#&%?*]{20,})"\]/)
      if (enc?.[1]) {
        try {
          let v = enc[1]
          v = v.replace(/[A-Za-z]/g, c => {
            const b = c <= 'Z' ? 65 : 97
            return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b)
          })
          for (const p of ['@$', '^^', '~@', '%?', '*~', '!!', '#&']) v = v.split(p).join('_')
          v = Buffer.from(v.replace(/_/g, ''), 'base64').toString('utf-8')
          v = v.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('')
          v = Buffer.from(v.split('').reverse().join(''), 'base64').toString('utf-8')
          const json = JSON.parse(v)
          return json.source || json.direct_access_url || json.hls || null
        } catch (_) {}
      }
      const mAny = data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)
      if (mAny?.[1]) return mAny[1]
    } catch (_) {}
    return null
  }

  // ── Filemoon ──────────────────────────────────────────────────────────────
  if (u.includes('filemoon') || u.includes('moonplayer')) {
    try {
      const { data } = await axios.get(embedUrl, { headers: { ...HEADERS, Referer: embedUrl }, timeout: 15000 })
      const packed   = data.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
      const unpacked = packed ? jsUnpack(packed[0]) : null
      const src      = extraerUrlVideo(unpacked || data)
      if (src) return src
    } catch (_) {}
    return null
  }

  // ── Mp4Upload ─────────────────────────────────────────────────────────────
  if (u.includes('mp4upload')) {
    try {
      const idMatch = embedUrl.match(/mp4upload\.com\/(?:embed-)?([A-Za-z0-9]+)/)
      const url     = idMatch ? `https://www.mp4upload.com/embed-${idMatch[1]}.html` : embedUrl
      const { data } = await axios.get(url, { headers: { ...HEADERS, Referer: 'https://www.mp4upload.com/' }, timeout: 15000 })
      const packed   = data.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
      const code     = packed ? jsUnpack(packed[0]) : data
      const m1 = (code || data).match(/player\.src\("([^"]+)"/)
      if (m1?.[1]) return m1[1]
      return extraerUrlVideo(code || data)
    } catch (_) {}
    return null
  }

  // ── DoodStream ────────────────────────────────────────────────────────────
  if (u.includes('dood') || u.includes('ds2play')) {
    try {
      const url  = embedUrl.replace(/\/(d|watch)\//, '/e/')
      const res  = await axios.get(url, { headers: { ...HEADERS, Referer: 'https://dood.wf/' }, timeout: 15000 })
      const text = res.data
      const host = new URL(res.request?.res?.responseUrl || url).origin
      const pass = text.match(/\/pass_md5\/[^'"<\s]*/)?.[0]
      if (!pass) return null
      const token = pass.split('/').pop()
      const r2    = await axios.get(host + pass, { headers: { Referer: url }, timeout: 15000 })
      const rand  = Array.from({ length: 10 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')
      return `${r2.data}${rand}?token=${token}&expiry=${Date.now()}`
    } catch (_) {}
    return null
  }

  // ── StreamWish / Vidhide / Filelions ──────────────────────────────────────
  if (u.includes('streamwish') || u.includes('wishembed') || u.includes('vidhide') || u.includes('filelions')) {
    try {
      const { data } = await axios.get(embedUrl, { headers: { ...HEADERS, 'Sec-Fetch-Dest': 'document' }, timeout: 15000 })
      const packed   = data.match(/eval\(function\(p,a,c,k,e[,\w]*\)[\s\S]+?\)\)/)
      if (packed) {
        const code = jsUnpack(packed[0])
        const src  = code ? extraerUrlVideo(code) : null
        if (src) return src
      }
      return extraerUrlVideo(data)
    } catch (_) {}
    return null
  }

  return null  // sin extractor conocido → yt-dlp lo intenta directamente
}

// Descarga con yt-dlp para embeds
async function descargarEmbed(embedUrl, outputDir, fileName) {
  // Saltar dominios sin soporte real
  const u = embedUrl.toLowerCase()
  if (u.includes('hqq.tv') || u.includes('netu.tv') || u.includes('netu.ac') || u.includes('biribup.com'))
    throw new Error(`Servidor sin soporte: ${embedUrl.split('/')[2]}`)

  // Intentar resolver embed → URL directa con extractores nativos
  let videoUrl = embedUrl
  const resuelto = await resolverEmbed(embedUrl)
  if (resuelto) {
    console.log(`[tioanime-notify] Embed resuelto → ${resuelto.slice(0, 80)}`)
    videoUrl = resuelto
  } else {
    // Fallback: fetch simple buscando patrones mp4/m3u8
    try {
      const { data } = await axios.get(embedUrl, { headers: { ...HEADERS, Referer: TIOANIME_URL }, timeout: 12000 })
      const dm = data.match(/file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i) ||
                 data.match(/"(https?:\/\/[^"]+\.(?:mp4|m3u8)[^"]*)"/)
      if (dm?.[1]) videoUrl = dm[1]
    } catch (_) {}
  }

  const outTemplate = path.join(outputDir, 'video.%(ext)s')
  const cmdArgs = [
    '--no-check-certificate', '--no-warnings',
    '-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--add-header', `User-Agent: ${UA}`,
    '--add-header', `Referer: ${TIOANIME_URL}/`,
    '-o', outTemplate,
    videoUrl,
  ]

  console.log(`[tioanime-notify] yt-dlp → ${videoUrl.slice(0, 100)}`)

  await new Promise((resolve, reject) => {
    const proc  = spawn('yt-dlp', cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
    let errBuf  = ''
    proc.stderr.on('data', d => { errBuf += d.toString() })
    proc.stdout.on('data', d => process.stdout.write(`[tio] ${d}`))
    const timer = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout')) }, DL_TIMEOUT)
    proc.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(errBuf.trim() || `código ${code}`)) })
    proc.on('error', err  => { clearTimeout(timer); reject(err) })
  })

  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (!archivos.length) throw new Error('yt-dlp no generó ningún archivo')

  const srcPath  = path.join(outputDir, archivos[0])
  const destPath = path.join(outputDir, fileName)
  fs.renameSync(srcPath, destPath)
  return destPath
}

// ─── Enviar episodio ──────────────────────────────────────────────────────────

async function enviarEpisodio(chatId, ep, conn) {
  const { titulo, epNum, epUrl, imgUrl } = ep
  const fileName = buildFileName(titulo, epNum)
  const tmpDir   = path.join(process.env.TMPDIR || '/tmp', `tio_${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  console.log(`[tioanime-notify] Enviando: ${fileName}`)

  try {
    // 1. Aviso
    await conn.sendMessage(chatId, {
      text:
        `🎌 *Nuevo episodio disponible*\n\n` +
        `╭━━━━━━〔 📺 〕━━━━━━\n` +
        `┃ *${titulo}*\n` +
        `┃ 📌 Episodio *${zeroPad(epNum)}*\n` +
        `┃ 🔗 ${epUrl}\n` +
        `╰━━━━━━━━━━━━━━━━━━\n\n` +
        `⬇️ _Descargando..._`
    })

    // 2. Imagen de portada
    if (imgUrl) {
      try {
        const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', headers: HEADERS, timeout: 10000 })
        await conn.sendMessage(chatId, {
          image  : Buffer.from(imgRes.data),
          caption: `🎌 *${titulo}*\n📌 Episodio ${zeroPad(epNum)}`,
        })
      } catch (_) { console.log('[tioanime-notify] Imagen no disponible') }
    }

    // 3. Servidores
    const srvs = await scrapeServidores(epUrl)
    if (!srvs.length) throw new Error('No se encontraron servidores de video')

    // 4. Descargar — Mega primero, luego embeds (hasta 5 intentos)
    const orden = ordenarServidores(srvs).slice(0, 5)
    console.log(`[tioanime-notify] Orden de descarga: ${orden.map(s => s.nombre).join(' → ')}`)

    let videoPath = null

    for (const srv of orden) {
      try {
        console.log(`[tioanime-notify] Intentando: ${srv.nombre}`)

        if (srv.nombre === 'mega') {
          videoPath = await descargarMega(srv.url, tmpDir, fileName)
        } else if (srv.nombre === 'mediafire') {
          // MediaFire: extraer link directo y descargar con axios
          const { data: mfPage } = await axios.get(srv.url, { headers: HEADERS, timeout: 12000 })
          const mfLink =
            mfPage.match(/href=["'](https?:\/\/download\d+\.mediafire\.com[^"']+)["']/)?.[1] ||
            mfPage.match(/id="downloadButton"[^>]+href=["']([^"']+)["']/)?.[1]
          if (!mfLink) throw new Error('MediaFire: no encontré link de descarga')
          const mfRes = await axios.get(mfLink, { responseType: 'stream', headers: HEADERS, timeout: DL_TIMEOUT })
          const destPath = path.join(tmpDir, fileName)
          await pipeline(mfRes.data, fs.createWriteStream(destPath))
          videoPath = destPath
        } else {
          videoPath = await descargarEmbed(srv.url, tmpDir, fileName)
        }

        break  // éxito → salir del loop
      } catch (err) {
        console.error(`[tioanime-notify] ${srv.nombre} falló: ${err.message}`)
        // Limpiar archivos parciales antes del siguiente intento
        fs.readdirSync(tmpDir).forEach(f => {
          try { if (f !== 'cover.jpg') fs.unlinkSync(path.join(tmpDir, f)) } catch (_) {}
        })
      }
    }

    if (!videoPath) throw new Error('Todos los servidores fallaron')

    // 5. Enviar video
    const sizeMB = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(1)
    await conn.sendMessage(chatId, {
      document : fs.readFileSync(videoPath),
      fileName,
      mimetype : 'video/mp4',
      caption  : `✅ *${titulo}*\n📌 Episodio ${zeroPad(epNum)}\n📦 ${sizeMB} MB · TioAnime`,
    })

    console.log(`[tioanime-notify] ✅ ${fileName}`)

  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (_) {}
  }
}

// ─── Cola ─────────────────────────────────────────────────────────────────────

async function procesarCola() {
  if (global.tioQueueRunning) return
  if (!global.tioEpisodeQueue.length) return
  global.tioQueueRunning = true

  while (global.tioEpisodeQueue.length > 0) {
    const { chatId, ep, conn } = global.tioEpisodeQueue.shift()
    try {
      await enviarEpisodio(chatId, ep, conn)
    } catch (err) {
      console.error('[tioanime-notify] Error cola:', err.message)
      try { await conn.sendMessage(chatId, { text: `❌ Error enviando *${ep.titulo}* ep *${zeroPad(ep.epNum)}*:\n${err.message}` }) } catch (_) {}
    }
    if (global.tioEpisodeQueue.length > 0) {
      console.log(`[tioanime-notify] Cola: ${global.tioEpisodeQueue.length} pendiente(s), esperando ${QUEUE_DELAY / 1000}s...`)
      await new Promise(r => setTimeout(r, QUEUE_DELAY))
    }
  }

  global.tioQueueRunning = false
}

// ─── Chequeo periódico ────────────────────────────────────────────────────────

async function checkNuevosEpisodios(chatId, conn) {
  console.log(`[tioanime-notify] Chequeando para ${chatId}...`)
  let lista = []
  try { lista = await fetchLatestEpisodes() }
  catch (err) { console.error('[tioanime-notify] fetch error:', err.message); return }
  if (!lista.length) return

  const seen = loadSeen()
  if (!seen[chatId]) seen[chatId] = []
  const nuevos = lista.filter(e => !seen[chatId].includes(e.id))
  if (!nuevos.length) { console.log('[tioanime-notify] Sin novedades'); return }

  console.log(`[tioanime-notify] ${nuevos.length} nuevo(s):`, nuevos.map(e => e.id).join(', '))

  for (const ep of nuevos) seen[chatId].push(ep.id)
  if (seen[chatId].length > 500) seen[chatId] = seen[chatId].slice(-500)
  saveSeen(seen)

  if (nuevos.length > 1) {
    try {
      await conn.sendMessage(chatId, {
        text:
          `📋 *${nuevos.length} episodios nuevos detectados*\n\n` +
          nuevos.map((e, i) => `${i + 1}. *${e.titulo}* — Ep ${zeroPad(e.epNum)}`).join('\n') +
          `\n\n⏳ _Se enviarán de uno en uno..._`
      })
    } catch (_) {}
  }

  for (const ep of nuevos) global.tioEpisodeQueue.push({ chatId, ep, conn })
  procesarCola().catch(err => console.error('[tioanime-notify] cola error:', err.message))
}

// ─── Notificador ─────────────────────────────────────────────────────────────

function iniciarNotificador(chatId, conn, intervalMin = CHECK_INTERVAL_DEFAULT) {
  if (global.tioActiveChats.has(chatId)) clearInterval(global.tioActiveChats.get(chatId).timer)
  const timer = setInterval(() => {
    checkNuevosEpisodios(chatId, conn).catch(e => console.error('[tioanime-notify] interval error:', e.message))
  }, intervalMin * 60 * 1000)
  global.tioActiveChats.set(chatId, { timer, intervalMin, startedAt: Date.now() })
  const state = loadState()
  state[chatId] = { intervalMin, startedAt: Date.now() }
  saveState(state)
  console.log(`[tioanime-notify] Iniciado en ${chatId} cada ${intervalMin} min`)
}

function detenerNotificador(chatId) {
  const entry = global.tioActiveChats.get(chatId)
  if (entry) { clearInterval(entry.timer); global.tioActiveChats.delete(chatId) }
  const state = loadState()
  delete state[chatId]
  saveState(state)
}

function restaurarNotificadores(conn) {
  const state = loadState()
  for (const [chatId, cfg] of Object.entries(state)) {
    if (!global.tioActiveChats.has(chatId)) iniciarNotificador(chatId, conn, cfg.intervalMin || CHECK_INTERVAL_DEFAULT)
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {

  restaurarNotificadores(conn)

  // .tiostart
  if (command === 'tiostart') {
    const min = parseInt(text?.trim())
    const intervalMin = (!isNaN(min) && min >= 5 && min <= 60) ? min : CHECK_INTERVAL_DEFAULT
    iniciarNotificador(m.chat, conn, intervalMin)
    await conn.sendMessage(m.chat, {
      text:
        `✅ *Notificador TioAnime activado*\n\n` +
        `╭━━━━━━〔 📡 〕━━━━━━\n` +
        `┃ ⏱️ Intervalo: *${intervalMin} min*\n` +
        `┃ 💬 Chat registrado\n` +
        `╰━━━━━━━━━━━━━━━━━━\n\n` +
        `_Usa ${usedPrefix}tiostop para detener._`
    }, { quoted: m })
    try {
      const lista = await fetchLatestEpisodes()
      const seen  = loadSeen()
      if (!seen[m.chat]) seen[m.chat] = []
      for (const ep of lista) { if (!seen[m.chat].includes(ep.id)) seen[m.chat].push(ep.id) }
      if (seen[m.chat].length > 500) seen[m.chat] = seen[m.chat].slice(-500)
      saveSeen(seen)
      await conn.sendMessage(m.chat, { text: `📋 *${lista.length}* episodios actuales registrados como base.\n_Solo los nuevos se enviarán._` }, { quoted: m })
    } catch (err) {
      await conn.sendMessage(m.chat, { text: `⚠️ Chequeo inicial falló: ${err.message}` }, { quoted: m })
    }
    return
  }

  // .tiostop
  if (command === 'tiostop') {
    if (!global.tioActiveChats.has(m.chat)) return m.reply(`ℹ️ El notificador no estaba activo.`)
    detenerNotificador(m.chat)
    return m.reply(`🛑 *Notificador detenido.*\n_Usa ${usedPrefix}tiostart para reactivar._`)
  }

  // .tiostatus
  if (command === 'tiostatus') {
    const activo = global.tioActiveChats.has(m.chat)
    const entry  = global.tioActiveChats.get(m.chat)
    const cola   = global.tioEpisodeQueue.filter(i => i.chatId === m.chat)
    const vistos = (loadSeen()[m.chat] || []).length
    let txt = `📡 *Estado TioAnime*\n\n`
    txt += activo ? `✅ *Activo* — cada ${entry.intervalMin} min\n` : `🔴 *Inactivo*\n`
    txt += `📋 Cola: *${cola.length}* pendiente(s)\n`
    txt += `🔵 Procesando: *${global.tioQueueRunning ? 'Sí' : 'No'}*\n`
    txt += `👁️ Vistos: *${vistos}*`
    if (cola.length > 0) txt += `\n\n*En cola:*\n` + cola.slice(0, 5).map((i, n) => `  ${n + 1}. ${i.ep.titulo} ep ${zeroPad(i.ep.epNum)}`).join('\n')
    return m.reply(txt)
  }

  // .tioqueue
  if (command === 'tioqueue') {
    if (!global.tioEpisodeQueue.length) return m.reply(`✅ Cola vacía.`)
    return m.reply(
      `📋 *Cola (${global.tioEpisodeQueue.length}):*\n\n` +
      global.tioEpisodeQueue.map((i, n) =>
        `${n + 1}. *${i.ep.titulo}* ep ${zeroPad(i.ep.epNum)} [${i.chatId === m.chat ? 'este chat' : 'otro chat'}]`
      ).join('\n')
    )
  }

  // .tioflush
  if (command === 'tioflush') {
    const antes = global.tioEpisodeQueue.length
    global.tioEpisodeQueue = global.tioEpisodeQueue.filter(i => i.chatId !== m.chat)
    return m.reply(`🗑️ *${antes - global.tioEpisodeQueue.length}* episodio(s) eliminado(s).`)
  }

  // .tiocheck
  if (command === 'tiocheck') {
    await m.reply(`🔍 Chequeando TioAnime...`)
    try {
      await checkNuevosEpisodios(m.chat, conn)
      if (!global.tioEpisodeQueue.some(i => i.chatId === m.chat)) await m.reply(`✅ Sin episodios nuevos.`)
    } catch (err) { await m.reply(`❌ Error: ${err.message}`) }
    return
  }

  // .tiointerval
  if (command === 'tiointerval') {
    const min = parseInt(text?.trim())
    if (isNaN(min) || min < 5 || min > 60) return m.reply(`❌ Número entre *5* y *60*.\nEj: *${usedPrefix}tiointerval 15*`)
    if (!global.tioActiveChats.has(m.chat)) return m.reply(`⚠️ Usa *${usedPrefix}tiostart* primero.`)
    iniciarNotificador(m.chat, conn, min)
    return m.reply(`⏱️ Intervalo actualizado a *${min} minutos*.`)
  }

  // .tioexample
  if (command === 'tioexample') {
    await m.reply(`🔍 Obteniendo episodio más reciente...`)
    let lista = []
    try { lista = await fetchLatestEpisodes() }
    catch (err) { return m.reply(`❌ Error: ${err.message}`) }
    if (!lista.length) return m.reply(`❌ Sin episodios disponibles. Intenta más tarde.`)

    const ep = lista[0]
    await conn.sendMessage(m.chat, {
      text:
        `📌 *Prueba — NO marca como visto*\n\n` +
        `╭━━━━━━〔 📺 〕━━━━━━\n` +
        `┃ *${ep.titulo}*\n` +
        `┃ 📌 Episodio *${zeroPad(ep.epNum)}*\n` +
        `┃ 🔗 ${ep.epUrl}\n` +
        `╰━━━━━━━━━━━━━━━━━━\n\n` +
        `⬇️ _Descargando..._`
    }, { quoted: m })

    try {
      await enviarEpisodio(m.chat, ep, conn)
    } catch (err) {
      return m.reply(`❌ Error en prueba:\n${err.message}`)
    }
    return
  }
}

handler.command = /^(tiostart|tiostop|tiostatus|tiocheck|tioqueue|tioflush|tiointerval|tioexample)$/i
handler.tags    = ['anime', 'notificaciones']
handler.help    = ['tiostart', 'tiostop', 'tiostatus', 'tiocheck', 'tioqueue', 'tioflush', 'tiointerval <min>', 'tioexample']
handler.exp     = 0
handler.level   = 0
handler.limit   = false

export default handler
