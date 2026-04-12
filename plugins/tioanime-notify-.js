// plugins/tioanime-notify.js — v1.0
//
// Notificador automático de nuevos episodios de TioAnime
// Scrapea https://tioanime.com/directorio para detectar episodios nuevos,
// descarga el video y lo envía con la imagen del anime.
//
// Comandos:
//   .tiostart               → inicia el notificador en el grupo/chat actual
//   .tiostop                → detiene el notificador en el chat actual
//   .tiostatus              → muestra estado, cola y próximo chequeo
//   .tioqueue               → ver episodios en cola pendientes
//   .tioflush               → vaciar la cola manualmente
//   .tiocheck               → forzar chequeo ahora (sin esperar el intervalo)
//   .tiointerval <minutos>  → cambiar el intervalo de chequeo (mín 5, máx 60)
//
// Comportamiento:
//   • Chequea TioAnime cada N minutos (por defecto 10)
//   • Si salen 2+ episodios al mismo tiempo → se ponen en cola, 1 por 1
//   • Envía: imagen del anime + video descargado
//   • Nombre del archivo: 01 <Nombre Anime> - Episodio XX.mp4
//   • Recuerda los episodios ya vistos (persiste en JSON local)

import fs          from 'fs'
import path        from 'path'
import fetch       from 'node-fetch'
import * as cheerio from 'cheerio'
import { spawn }   from 'child_process'
import { pipeline } from 'stream/promises'
import https       from 'https'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIOANIME_URL    = 'https://tioanime.com'
const SEEN_FILE       = path.join(process.env.TMPDIR || '/tmp', 'tioanime_seen.json')
const STATE_FILE      = path.join(process.env.TMPDIR || '/tmp', 'tioanime_state.json')
const CHECK_INTERVAL_DEFAULT = 10   // minutos
const QUEUE_DELAY    = 90_000       // ms entre items de la cola (90 seg)
const DL_TIMEOUT     = 3 * 60 * 60 * 1000  // 3 horas max por descarga

const httpsAgent = new https.Agent({ keepAlive: true })

// ─── Estado global ────────────────────────────────────────────────────────────

// activeChats: Map<chatId, { interval: NodeJS.Timeout, intervalMin: number }>
global.tioActiveChats   = global.tioActiveChats   || new Map()
// episodeQueue: Array<{ chatId, episodio, conn }>
global.tioEpisodeQueue  = global.tioEpisodeQueue  || []
global.tioQueueRunning  = global.tioQueueRunning  || false

// ─── Persistencia ─────────────────────────────────────────────────────────────

function loadSeen() {
  try { return JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8')) } catch (_) { return {} }
}
function saveSeen(data) {
  try { fs.writeFileSync(SEEN_FILE, JSON.stringify(data, null, 2)) } catch (_) {}
}
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) } catch (_) { return {} }
}
function saveState(data) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2)) } catch (_) {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const baseHeaders = {
  'User-Agent'      : UA,
  'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language' : 'es-419,es;q=0.9,en;q=0.8',
  'DNT'             : '1',
}

function sanitizeFilename(str) {
  return str.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim()
}

function zeroPad(n, len = 2) {
  return String(n).padStart(len, '0')
}

// Construir nombre de archivo: "01 Nombre del Anime - Episodio 05.mp4"
function buildFileName(animeTitulo, epNum) {
  const ep   = zeroPad(epNum)
  const safe = sanitizeFilename(animeTitulo)
  return `01 ${safe} - Episodio ${ep}.mp4`
}

// ─── Scraping TioAnime ────────────────────────────────────────────────────────

// Scrapea la página de últimos episodios de TioAnime
// Devuelve array de { id, titulo, epNum, epUrl, imgUrl }
async function fetchLatestEpisodes() {
  // TioAnime muestra los últimos episodios en la portada
  const res  = await fetch(`${TIOANIME_URL}/directorio?p=0&type=0&status=2&order=updated`, {
    headers: { ...baseHeaders, Referer: TIOANIME_URL },
    timeout: 15000,
  })
  const html = await res.text()
  const $    = cheerio.load(html)
  const episodios = []

  // Intentar primero la portada (/)  — tiene los episodios más recientes directamente
  const resHome = await fetch(TIOANIME_URL, {
    headers: { ...baseHeaders, Referer: TIOANIME_URL },
    timeout: 15000,
  })
  const htmlHome = await resHome.text()
  const $h       = cheerio.load(htmlHome)

  // Portada: cards de episodios recientes
  // Estructura típica: article.anime-card a[href*="/ver/"] + img + h3
  $h('article, .anime-card, .episode-card, li').each((_, el) => {
    const $el   = $h(el)
    const aTag  = $el.find('a[href*="/ver/"]').first()
    const href  = aTag.attr('href') || ''
    if (!href) return

    const epMatch = href.match(/\/ver\/(.+?)-(\d+)\/?$/)
    if (!epMatch) return

    const slug   = epMatch[1]
    const epNum  = parseInt(epMatch[2])
    const titulo = ($el.find('h3, h2, .title, .anime-title').first().text() ||
                    aTag.attr('title') || slug.replace(/-/g, ' ')).trim()
    const imgSrc = $el.find('img').first().attr('src') ||
                   $el.find('img').first().attr('data-src') || ''
    const imgUrl = imgSrc.startsWith('http') ? imgSrc : imgSrc ? `${TIOANIME_URL}${imgSrc}` : ''
    const epUrl  = href.startsWith('http') ? href : `${TIOANIME_URL}${href}`
    const id     = `${slug}-${epNum}`

    if (!episodios.find(e => e.id === id)) {
      episodios.push({ id, slug, titulo, epNum, epUrl, imgUrl })
    }
  })

  // Fallback: usar el directorio si la portada no dio resultados
  if (episodios.length === 0) {
    $('article, .anime-card, li').each((_, el) => {
      const $el  = $(el)
      const aTag = $el.find('a[href*="/ver/"], a[href*="/anime/"]').first()
      const href = aTag.attr('href') || ''
      if (!href) return

      // Intentar extraer episodio del link
      const epMatch = href.match(/\/ver\/(.+?)-(\d+)\/?$/)
      if (!epMatch) return

      const slug   = epMatch[1]
      const epNum  = parseInt(epMatch[2])
      const titulo = ($el.find('h3, h2, .title').first().text() ||
                      aTag.attr('title') || slug.replace(/-/g, ' ')).trim()
      const imgSrc = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || ''
      const imgUrl = imgSrc.startsWith('http') ? imgSrc : imgSrc ? `${TIOANIME_URL}${imgSrc}` : ''
      const epUrl  = href.startsWith('http') ? href : `${TIOANIME_URL}${href}`
      const id     = `${slug}-${epNum}`

      if (!episodios.find(e => e.id === id)) {
        episodios.push({ id, slug, titulo, epNum, epUrl, imgUrl })
      }
    })
  }

  console.log(`[tioanime-notify] ${episodios.length} episodios en portada`)
  return episodios
}

// Scrapea los servidores de video de un episodio
// Devuelve array de { nombre, url }
async function scrapeServidores(epUrl) {
  const res  = await fetch(epUrl, {
    headers: { ...baseHeaders, Referer: TIOANIME_URL },
    timeout: 15000,
  })
  const html = await res.text()
  const $    = cheerio.load(html)
  const servidores = []

  $('script').each((_, el) => {
    const code = $(el).html() || ''
    if (!code.includes('var videos')) return

    // TioAnime: var videos = [[server, url], ...]
    const m = code.match(/var videos\s*=\s*(\[\[[\s\S]*?\]\])\s*[;,]?/)
    if (m) {
      try {
        const lista = JSON.parse(m[1])
        for (const item of lista) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            const nombre = String(item[0]).toLowerCase()
            const url    = item[1]
            if (!servidores.find(s => s.url === url))
              servidores.push({ nombre, url })
          }
        }
      } catch (_) {}
    }

    // Fallback array de objetos
    if (servidores.length === 0) {
      const mArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
      if (mArr) {
        try {
          const lista = JSON.parse(mArr[1])
          for (const item of lista) {
            const url = item?.url || item?.file || item?.code || ''
            const n   = item?.title || item?.label || item?.server || url
            if (url.startsWith('http') && !servidores.find(s => s.url === url))
              servidores.push({ nombre: n.toLowerCase(), url })
          }
        } catch (_) {}
      }
    }
  })

  // Iframes como fallback
  if (servidores.length === 0) {
    $('iframe[src]').each((_, el) => {
      const src = $(el).attr('src') || ''
      if (src.startsWith('http')) servidores.push({ nombre: 'iframe', url: src })
    })
  }

  console.log(`[tioanime-notify] ${servidores.length} servidores en ${epUrl}`)
  return servidores
}

// Descarga la imagen del anime
async function descargarImagen(imgUrl, destDir) {
  if (!imgUrl) return null
  try {
    const res = await fetch(imgUrl, { headers: baseHeaders, timeout: 10000 })
    if (!res.ok) return null
    const ext      = imgUrl.split('.').pop().split('?')[0] || 'jpg'
    const imgPath  = path.join(destDir, `cover.${ext}`)
    await pipeline(res.body, fs.createWriteStream(imgPath))
    return imgPath
  } catch (_) { return null }
}

// ─── Orden de preferencia de servidores ──────────────────────────────────────

const PREFS = ['mp4upload', 'filemoon', 'streamwish', 'wishembed', 'streamtape',
               'doodstream', 'voe', 'vidhide', 'okru', 'mixdrop']

function elegirServidor(servidores) {
  for (const pref of PREFS) {
    const m = servidores.find(s => s.nombre.includes(pref) || s.url.includes(pref))
    if (m) return m
  }
  return servidores[0] || null
}

// ─── Descarga con yt-dlp ──────────────────────────────────────────────────────

async function descargarVideo(embedUrl, outputDir, fileName) {
  const outTemplate = path.join(outputDir, 'video.%(ext)s')

  // Intentar resolver embed → URL directa (reutilizando lógica de anime-DL)
  let videoUrl = embedUrl

  // P.A.C.K.E.R. / JWPlayer inline → intentar con fetch simple
  try {
    const res  = await fetch(embedUrl, {
      headers: { ...baseHeaders, Referer: TIOANIME_URL },
      timeout: 12000,
    })
    const text = await res.text()
    // Buscar URL directa de video
    const directMatch =
      text.match(/file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i) ||
      text.match(/"(https?:\/\/[^"]+\.(?:mp4|m3u8)[^"]*)"/)
    if (directMatch?.[1]) videoUrl = directMatch[1]
  } catch (_) {}

  const cmdArgs = [
    '--no-check-certificate',
    '--no-warnings',
    '-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best',
    '--merge-output-format', 'mp4',
    '--add-header', `User-Agent: ${UA}`,
    '--add-header', `Referer: ${TIOANIME_URL}/`,
    '--add-header', 'Accept-Language: es-419,es;q=0.9',
    '-o', outTemplate,
    videoUrl,
  ]

  console.log(`[tioanime-notify] yt-dlp: ${videoUrl.slice(0, 100)}`)

  await new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] })
    let errBuf = ''
    proc.stderr.on('data', d => { errBuf += d.toString(); process.stderr.write(`[tio-yt] ${d}`) })
    proc.stdout.on('data', d => process.stdout.write(`[tio-yt] ${d}`))
    const timer = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout')) }, DL_TIMEOUT)
    proc.on('close', code => {
      clearTimeout(timer)
      code === 0 ? resolve() : reject(new Error(errBuf.trim() || `yt-dlp code ${code}`))
    })
    proc.on('error', err => { clearTimeout(timer); reject(err) })
  })

  // Buscar el archivo descargado
  const archivos = fs.readdirSync(outputDir).filter(f => /\.(mp4|mkv|webm)$/i.test(f))
  if (!archivos.length) throw new Error('yt-dlp no generó archivo')

  // Renombrar al nombre formateado
  const srcPath  = path.join(outputDir, archivos[0])
  const destPath = path.join(outputDir, fileName)
  fs.renameSync(srcPath, destPath)
  return destPath
}

// ─── Procesador de cola ───────────────────────────────────────────────────────

async function procesarCola() {
  if (global.tioQueueRunning) return
  if (global.tioEpisodeQueue.length === 0) return

  global.tioQueueRunning = true

  while (global.tioEpisodeQueue.length > 0) {
    const item = global.tioEpisodeQueue.shift()
    const { chatId, episodio, conn } = item

    try {
      await enviarEpisodio(chatId, episodio, conn)
    } catch (err) {
      console.error(`[tioanime-notify] Error procesando cola:`, err.message)
      try {
        await conn.sendMessage(chatId, {
          text: `❌ Error al enviar *${episodio.titulo}* ep *${episodio.epNum}*:\n${err.message}`
        })
      } catch (_) {}
    }

    // Pausa entre items para no saturar
    if (global.tioEpisodeQueue.length > 0) {
      console.log(`[tioanime-notify] Cola: ${global.tioEpisodeQueue.length} pendiente(s). Esperando ${QUEUE_DELAY / 1000}s...`)
      await new Promise(r => setTimeout(r, QUEUE_DELAY))
    }
  }

  global.tioQueueRunning = false
}

// ─── Enviar un episodio al chat ───────────────────────────────────────────────

async function enviarEpisodio(chatId, episodio, conn) {
  const { titulo, epNum, epUrl, imgUrl } = episodio
  const fileName = buildFileName(titulo, epNum)
  const tmpDir   = path.join(process.env.TMPDIR || '/tmp', `tio_${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  console.log(`[tioanime-notify] → Enviando: ${fileName}`)

  // 1. Avisar que viene el episodio
  await conn.sendMessage(chatId, {
    text: `🎌 *Nuevo episodio disponible*\n\n` +
          `📺 *${titulo}*\n` +
          `📌 Episodio *${zeroPad(epNum)}*\n` +
          `🔗 ${epUrl}\n\n` +
          `⬇️ _Descargando..._`
  })

  // 2. Descargar imagen de portada y enviarla
  const imgPath = await descargarImagen(imgUrl, tmpDir)
  if (imgPath && fs.existsSync(imgPath)) {
    try {
      await conn.sendMessage(chatId, {
        image: fs.readFileSync(imgPath),
        caption: `🎌 *${titulo}*\n📌 Episodio ${zeroPad(epNum)}`,
      })
    } catch (_) {}
  }

  // 3. Scrape de servidores
  let servidores = []
  try {
    servidores = await scrapeServidores(epUrl)
  } catch (err) {
    throw new Error(`No pude obtener servidores: ${err.message}`)
  }

  if (!servidores.length) throw new Error('No se encontraron servidores de video')

  const srv = elegirServidor(servidores)
  if (!srv) throw new Error('Sin servidor disponible')

  console.log(`[tioanime-notify] Servidor elegido: ${srv.nombre} → ${srv.url.slice(0, 80)}`)

  // 4. Descargar video
  let videoPath
  let intentoOk = false
  for (const candidato of [srv, ...servidores.filter(s => s !== srv)].slice(0, 4)) {
    try {
      videoPath  = await descargarVideo(candidato.url, tmpDir, fileName)
      intentoOk  = true
      break
    } catch (err) {
      console.error(`[tioanime-notify] ${candidato.nombre} falló:`, err.message)
    }
  }

  if (!intentoOk || !videoPath) throw new Error('Todos los servidores fallaron al descargar')

  // 5. Enviar video
  const sizeMB  = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(1)
  await conn.sendMessage(chatId, {
    document: { url: videoPath },
    fileName,
    mimetype : 'video/mp4',
    caption  : `✅ *${titulo}*\n📌 Episodio ${zeroPad(epNum)}\n📦 ${sizeMB} MB · TioAnime`,
  })

  console.log(`[tioanime-notify] ✅ Enviado: ${fileName}`)

  // Cleanup
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (_) {}
}

// ─── Chequeo periódico ────────────────────────────────────────────────────────

async function checkNuevosEpisodios(chatId, conn) {
  console.log(`[tioanime-notify] Chequeando episodios nuevos para chat ${chatId}...`)

  let episodios = []
  try {
    episodios = await fetchLatestEpisodes()
  } catch (err) {
    console.error('[tioanime-notify] Error fetching:', err.message)
    return
  }

  if (!episodios.length) return

  const seen = loadSeen()
  if (!seen[chatId]) seen[chatId] = []

  const nuevos = episodios.filter(e => !seen[chatId].includes(e.id))

  if (!nuevos.length) {
    console.log(`[tioanime-notify] Sin episodios nuevos.`)
    return
  }

  console.log(`[tioanime-notify] ${nuevos.length} episodio(s) nuevo(s):`, nuevos.map(e => e.id).join(', '))

  // Marcar como vistos ANTES de encolar (evitar duplicados en próximo chequeo)
  for (const ep of nuevos) seen[chatId].push(ep.id)
  // Mantener solo los últimos 500 IDs
  if (seen[chatId].length > 500) seen[chatId] = seen[chatId].slice(-500)
  saveSeen(seen)

  // Si hay más de 1 episodio nuevo → avisar de la cola
  if (nuevos.length > 1) {
    try {
      await conn.sendMessage(chatId, {
        text: `📋 *${nuevos.length} episodios nuevos detectados*\n` +
              nuevos.map((e, i) => `${i + 1}. *${e.titulo}* ep ${zeroPad(e.epNum)}`).join('\n') +
              `\n\n⏳ _Se enviarán de a uno para no saturar..._`
      })
    } catch (_) {}
  }

  // Encolar todos los nuevos
  for (const ep of nuevos) {
    global.tioEpisodeQueue.push({ chatId, episodio: ep, conn })
  }

  // Arrancar el procesador de cola si no está corriendo
  procesarCola().catch(err => console.error('[tioanime-notify] Cola error:', err.message))
}

// ─── Iniciar / detener el intervalo de un chat ────────────────────────────────

function iniciarNotificador(chatId, conn, intervalMin = CHECK_INTERVAL_DEFAULT) {
  // Detener el intervalo anterior si existe
  if (global.tioActiveChats.has(chatId)) {
    clearInterval(global.tioActiveChats.get(chatId).timer)
  }

  const ms    = intervalMin * 60 * 1000
  const timer = setInterval(() => {
    checkNuevosEpisodios(chatId, conn).catch(e =>
      console.error('[tioanime-notify] Check error:', e.message)
    )
  }, ms)

  global.tioActiveChats.set(chatId, { timer, intervalMin, startedAt: Date.now() })

  // Persistir estado
  const state = loadState()
  state[chatId] = { intervalMin, startedAt: Date.now() }
  saveState(state)

  console.log(`[tioanime-notify] Notificador iniciado en ${chatId} cada ${intervalMin} min`)
}

function detenerNotificador(chatId) {
  const entry = global.tioActiveChats.get(chatId)
  if (entry) {
    clearInterval(entry.timer)
    global.tioActiveChats.delete(chatId)
  }

  const state = loadState()
  delete state[chatId]
  saveState(state)
}

// ─── Restaurar notificadores al reiniciar el bot ──────────────────────────────
// Se llama desde el handler al primer uso si hay estado guardado

function restaurarNotificadores(conn) {
  const state = loadState()
  let restaurados = 0
  for (const [chatId, cfg] of Object.entries(state)) {
    if (!global.tioActiveChats.has(chatId)) {
      iniciarNotificador(chatId, conn, cfg.intervalMin || CHECK_INTERVAL_DEFAULT)
      restaurados++
    }
  }
  if (restaurados > 0)
    console.log(`[tioanime-notify] ♻️ ${restaurados} notificador(es) restaurados`)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const handler = async (m, { conn, text, command }) => {

  // Restaurar notificadores caídos al usar cualquier comando tio*
  restaurarNotificadores(conn)

  // ── .tiostart ──────────────────────────────────────────────────────────────
  if (command === 'tiostart') {
    let intervalMin = CHECK_INTERVAL_DEFAULT
    const numArg = parseInt(text?.trim())
    if (!isNaN(numArg) && numArg >= 5 && numArg <= 60) intervalMin = numArg

    iniciarNotificador(m.chat, conn, intervalMin)

    await m.reply(
      `✅ *Notificador TioAnime activado*\n\n` +
      `📡 Chequeando cada *${intervalMin} min*\n` +
      `💬 Chat: \`${m.chat}\`\n\n` +
      `_Se avisará cuando salgan nuevos episodios._\n` +
      `_Usa .tiostop para detener._`
    )

    // Hacer un chequeo inmediato para registrar el estado actual (sin enviar nada nuevo todavía)
    try {
      const eps = await fetchLatestEpisodes()
      const seen = loadSeen()
      if (!seen[m.chat]) seen[m.chat] = []
      for (const ep of eps) {
        if (!seen[m.chat].includes(ep.id)) seen[m.chat].push(ep.id)
      }
      if (seen[m.chat].length > 500) seen[m.chat] = seen[m.chat].slice(-500)
      saveSeen(seen)
      await m.reply(`📋 Registrados *${eps.length}* episodios actuales como base.\n_Solo los NUEVOS que salgan se enviarán._`)
    } catch (err) {
      await m.reply(`⚠️ No pude hacer el chequeo inicial: ${err.message}`)
    }
    return
  }

  // ── .tiostop ───────────────────────────────────────────────────────────────
  if (command === 'tiostop') {
    if (!global.tioActiveChats.has(m.chat)) {
      return m.reply(`ℹ️ El notificador no estaba activo en este chat.`)
    }
    detenerNotificador(m.chat)
    return m.reply(`🛑 *Notificador TioAnime detenido.*\n_Usa .tiostart para reactivar._`)
  }

  // ── .tiostatus ─────────────────────────────────────────────────────────────
  if (command === 'tiostatus') {
    const activo = global.tioActiveChats.has(m.chat)
    const entry  = global.tioActiveChats.get(m.chat)
    const cola   = global.tioEpisodeQueue.filter(i => i.chatId === m.chat)
    const seen   = loadSeen()
    const vistos = seen[m.chat]?.length || 0

    let txt = `📡 *Estado TioAnime Notificador*\n\n`
    txt += activo
      ? `✅ *Activo* — cada ${entry.intervalMin} min\n`
      : `🔴 *Inactivo*\n`
    txt += `📋 Cola: *${cola.length}* episodio(s) pendiente(s)\n`
    txt += `🔵 Cola corriendo: *${global.tioQueueRunning ? 'Sí' : 'No'}*\n`
    txt += `👁️ Episodios registrados: *${vistos}*\n`
    if (global.tioEpisodeQueue.length > 0) {
      txt += `\n*En cola (global):*\n`
      txt += global.tioEpisodeQueue.slice(0, 5).map((i, n) =>
        `  ${n + 1}. ${i.episodio.titulo} ep ${zeroPad(i.episodio.epNum)}`
      ).join('\n')
      if (global.tioEpisodeQueue.length > 5) txt += `\n  ...y ${global.tioEpisodeQueue.length - 5} más`
    }
    return m.reply(txt)
  }

  // ── .tioqueue ──────────────────────────────────────────────────────────────
  if (command === 'tioqueue') {
    if (!global.tioEpisodeQueue.length) return m.reply(`✅ Cola vacía.`)
    const lista = global.tioEpisodeQueue.map((i, n) =>
      `${n + 1}. *${i.episodio.titulo}* — ep ${zeroPad(i.episodio.epNum)} [${i.chatId === m.chat ? 'este chat' : 'otro chat'}]`
    ).join('\n')
    return m.reply(`📋 *Cola de episodios (${global.tioEpisodeQueue.length}):*\n\n${lista}`)
  }

  // ── .tioflush ──────────────────────────────────────────────────────────────
  if (command === 'tioflush') {
    const antes = global.tioEpisodeQueue.length
    global.tioEpisodeQueue = global.tioEpisodeQueue.filter(i => i.chatId !== m.chat)
    const eliminados = antes - global.tioEpisodeQueue.length
    return m.reply(`🗑️ Cola vaciada para este chat. *${eliminados}* episodio(s) eliminado(s).`)
  }

  // ── .tiocheck ──────────────────────────────────────────────────────────────
  if (command === 'tiocheck') {
    await m.reply(`🔍 Chequeando TioAnime ahora...`)
    try {
      await checkNuevosEpisodios(m.chat, conn)
      if (global.tioEpisodeQueue.filter(i => i.chatId === m.chat).length === 0) {
        await m.reply(`✅ Sin episodios nuevos en este momento.`)
      }
    } catch (err) {
      await m.reply(`❌ Error al chequear: ${err.message}`)
    }
    return
  }

  // ── .tioexample ────────────────────────────────────────────────────────────
  // Toma el episodio más reciente de TioAnime y lo envía como prueba (sin marcarlo como visto)
  if (command === 'tioexample') {
    await m.reply(`🔍 Obteniendo el episodio más reciente de TioAnime...`)
    let episodios = []
    try {
      episodios = await fetchLatestEpisodes()
    } catch (err) {
      return m.reply(`❌ No pude obtener episodios: ${err.message}`)
    }

    if (!episodios.length) {
      return m.reply(`❌ TioAnime no devolvió episodios. Intenta más tarde.`)
    }

    const ep = episodios[0]  // el más reciente
    await m.reply(
      `📌 *Episodio de prueba:*\n` +
      `📺 *${ep.titulo}*\n` +
      `🔢 Episodio ${zeroPad(ep.epNum)}\n` +
      `🔗 ${ep.epUrl}\n\n` +
      `⬇️ _Descargando y enviando..._`
    )

    try {
      await enviarEpisodio(m.chat, ep, conn)
    } catch (err) {
      return m.reply(`❌ Error al enviar el episodio de prueba:\n${err.message}`)
    }
    return
  }

  // ── .tiointerval ───────────────────────────────────────────────────────────
  if (command === 'tiointerval') {
    const min = parseInt(text?.trim())
    if (isNaN(min) || min < 5 || min > 60) {
      return m.reply(`❌ Intervalo inválido. Usa un número entre *5* y *60* minutos.\nEjemplo: *.tiointerval 15*`)
    }
    if (!global.tioActiveChats.has(m.chat)) {
      return m.reply(`⚠️ El notificador no está activo. Usa *.tiostart* primero.`)
    }
    iniciarNotificador(m.chat, conn, min)  // reinicia con nuevo intervalo
    return m.reply(`⏱️ Intervalo actualizado a *${min} minutos*.`)
  }
}

handler.help     = ['tiostart', 'tiostop', 'tiostatus', 'tiocheck', 'tioqueue', 'tioflush', 'tiointerval <min>', 'tioexample']
handler.tags     = ['anime', 'notificaciones']
handler.command  = /^(tiostart|tiostop|tiostatus|tiocheck|tioqueue|tioflush|tiointerval|tioexample)$/i
handler.exp      = 0
handler.level    = 0
handler.limit    = false

export default handler
