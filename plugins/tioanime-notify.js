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
function buildFileName(titulo, epNum) { return `01 ${safeFile(titulo)} - Episodio ${zeroPad(epNum)}.mp4` }

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

  $('script').each((_, el) => {
    const code = $(el).html() || ''
    if (!code.includes('var videos')) return

    const match = code.match(/var\s+videos\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])\s*[;,]?/)
    if (match) {
      try {
        for (const item of JSON.parse(match[1])) {
          if (Array.isArray(item) && typeof item[1] === 'string' && item[1].startsWith('http')) {
            if (!srvs.find(s => s.url === item[1])) srvs.push({ nombre: String(item[0]).toLowerCase(), url: item[1] })
          }
        }
      } catch (_) {}
    }

    if (srvs.length === 0) {
      const mArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
      if (mArr) {
        try {
          for (const item of JSON.parse(mArr[1])) {
            const url = item?.url || item?.file || item?.code || ''
            const nom = (item?.title || item?.label || item?.server || '').toLowerCase()
            if (url.startsWith('http') && !srvs.find(s => s.url === url)) srvs.push({ nombre: nom || url, url })
          }
        } catch (_) {}
      }
    }
  })

  if (srvs.length === 0) {
    $('iframe[src]').each((_, el) => {
      const src = $(el).attr('src') || ''
      if (src.startsWith('http')) srvs.push({ nombre: 'iframe', url: src })
    })
  }

  console.log(`[tioanime-notify] ${srvs.length} servidores`)
  return srvs
}

// ─── Descarga ─────────────────────────────────────────────────────────────────

const PREFS = ['mp4upload', 'filemoon', 'streamwish', 'streamtape', 'doodstream', 'voe', 'vidhide', 'okru', 'mixdrop']
function elegirServidor(srvs) {
  for (const p of PREFS) {
    const s = srvs.find(s => s.nombre.includes(p) || s.url.includes(p))
    if (s) return s
  }
  return srvs[0] || null
}

async function descargarVideo(embedUrl, outputDir, fileName) {
  let videoUrl = embedUrl
  try {
    const { data } = await axios.get(embedUrl, { headers: { ...HEADERS, Referer: TIOANIME_URL }, timeout: 12000 })
    const dm = data.match(/file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i) || data.match(/"(https?:\/\/[^"]+\.(?:mp4|m3u8)[^"]*)"/)
    if (dm?.[1]) videoUrl = dm[1]
  } catch (_) {}

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

    // 4. Descargar (hasta 4 servidores)
    const primero = elegirServidor(srvs)
    const orden   = [primero, ...srvs.filter(s => s !== primero)].slice(0, 4)
    let videoPath = null

    for (const srv of orden) {
      try {
        console.log(`[tioanime-notify] Servidor: ${srv.nombre}`)
        videoPath = await descargarVideo(srv.url, tmpDir, fileName)
        break
      } catch (err) {
        console.error(`[tioanime-notify] ${srv.nombre} falló: ${err.message}`)
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
  
export default handler
