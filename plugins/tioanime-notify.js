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

  // ── Extraer el slug del episodio desde la URL o el HTML ───────────────────
  // URL: https://tioanime.com/ver/slug-del-anime-ep
  const slugMatch = epUrl.match(/\/ver\/(.+)$/)
  const epSlug    = slugMatch?.[1]?.replace(/\/$/, '') || ''

  // ── 1. API oficial de descargas de TioAnime ───────────────────────────────
  // TioAnime expone: GET /api/download?episode={slug}
  // Responde JSON: [{ server: "Mega", idiom: "SUB", url: "https://mega.nz/..." }, ...]
  if (epSlug) {
    try {
      const apiUrl = `${TIOANIME_URL}/api/download?episode=${epSlug}`
      console.log(`[tioanime-notify] API descargas: ${apiUrl}`)
      const apiRes = await axios.get(apiUrl, {
        headers: { ...HEADERS, Referer: epUrl, 'X-Requested-With': 'XMLHttpRequest' },
        timeout: 12000,
      })
      const descargas = Array.isArray(apiRes.data) ? apiRes.data : (apiRes.data?.downloads || apiRes.data?.data || [])
      for (const d of descargas) {
        const url    = d.url || d.link || d.href || ''
        const nombre = (d.server || d.name || d.label || '').toLowerCase()
        if (!url.startsWith('http') || srvs.find(s => s.url === url)) continue
        const sinSoporte = url.includes('hqq.tv') || url.includes('netu.tv') || url.includes('netu.ac')
        if (sinSoporte) continue
        const esMega      = url.includes('mega.nz') || url.includes('mega.co.nz')
        const esMediafire = url.includes('mediafire.com')
        srvs.push({ nombre: esMega ? 'mega' : esMediafire ? 'mediafire' : nombre, url, directo: esMega || esMediafire })
      }
      console.log(`[tioanime-notify] API devolvió ${descargas.length} descarga(s)`)
    } catch (err) {
      console.log(`[tioanime-notify] API descargas falló: ${err.message}`)
    }
  }

  // ── 2. Links directos en el HTML (botones <a href="https://mega.nz/...">)  ─
  $('a[href]').each((_, el) => {
    const href  = $(el).attr('href') || ''
    if (!href.startsWith('http')) return
    const esMega      = href.includes('mega.nz') || href.includes('mega.co.nz')
    const esMediafire = href.includes('mediafire.com')
    const esOtro      = href.includes('gofile.io') || href.includes('1fichier') || href.includes('pixeldrain')
    const sinSoporte  = href.includes('hqq.tv') || href.includes('netu.tv')
    if (sinSoporte || (!esMega && !esMediafire && !esOtro)) return
    if (!srvs.find(s => s.url === href)) {
      const label = $(el).text().trim().toLowerCase()
      srvs.push({ nombre: esMega ? 'mega' : esMediafire ? 'mediafire' : label || 'descarga', url: href, directo: true })
    }
  })

  // ── 3. var videos = [["servidor", "url"], ...] (reproductores embed) ──────
  $('script').each((_, el) => {
    const code = $(el).html() || ''
    if (!code.includes('var videos')) return

    const match = code.match(/var\s+videos\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])\s*[;,]?/)
    if (match) {
      try {
        for (const item of JSON.parse(match[1])) {
          if (!Array.isArray(item) || !item[1]?.startsWith('http')) continue
          const url    = item[1]
          const nombre = String(item[0]).toLowerCase()
          if (srvs.find(s => s.url === url)) continue
          const esMega      = url.includes('mega.nz') || url.includes('mega.co.nz')
          const esMediafire = url.includes('mediafire.com')
          const sinSoporte  = url.includes('hqq.tv') || url.includes('netu.tv') || url.includes('netu.ac')
          if (sinSoporte) continue
          srvs.push({ nombre: esMega ? 'mega' : esMediafire ? 'mediafire' : nombre, url, directo: esMega || esMediafire })
        }
      } catch (_) {}
    }

    // Fallback array de objetos
    const mArr = code.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/)
    if (mArr && !srvs.find(s => !s.directo)) {
      try {
        for (const item of JSON.parse(mArr[1])) {
          const url = item?.url || item?.file || item?.code || ''
          const nom = (item?.title || item?.label || item?.server || '').toLowerCase()
          if (!url.startsWith('http') || srvs.find(s => s.url === url)) continue
          const esMega     = url.includes('mega.nz')
          const sinSoporte = url.includes('hqq.tv') || url.includes('netu.tv') || url.includes('netu.ac')
          if (sinSoporte) continue
          srvs.push({ nombre: esMega ? 'mega' : nom || url, url, directo: esMega })
        }
      } catch (_) {}
    }
  })

  // ── 4. iframes como último recurso ────────────────────────────────────────
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
        `📺 *${titulo}*\n` +
        `📌 Episodio *${zeroPad(epNum)}*\n` +
        `🔗 ${epUrl}\n\n` +
        `⬇️ _Descargando..._`
    })

    // 2. Servidores
    const srvs = await scrapeServidores(epUrl)
    if (!srvs.length) throw new Error('No se encontraron servidores de video')

    // 3. Descargar — solo Mega
    const megaSrvs = srvs.filter(s => s.nombre === 'mega')
    if (!megaSrvs.length) throw new Error('No se encontró enlace de Mega para este episodio')

    console.log(`[tioanime-notify] Mega encontrado: ${megaSrvs.length} enlace(s)`)

    let videoPath = null

    for (const srv of megaSrvs) {
      try {
        console.log(`[tioanime-notify] Descargando desde Mega: ${srv.url.slice(0, 60)}`)
        videoPath = await descargarMega(srv.url, tmpDir, fileName)
        break
      } catch (err) {
        console.error(`[tioanime-notify] Mega falló: ${err.message}`)
        fs.readdirSync(tmpDir).forEach(f => {
          try { fs.unlinkSync(path.join(tmpDir, f)) } catch (_) {}
        })
      }
    }

    if (!videoPath) throw new Error('Descarga desde Mega falló')

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
  // Si ya está corriendo, no iniciar otra instancia
  if (global.tioQueueRunning) {
    console.log('[tioanime-notify] Cola ya está corriendo, ignorando llamada duplicada')
    return
  }

  if (!global.tioEpisodeQueue.length) return

  global.tioQueueRunning = true
  console.log(`[tioanime-notify] Cola iniciada — ${global.tioEpisodeQueue.length} episodio(s)`)

  try {
    while (global.tioEpisodeQueue.length > 0) {
      // Leer sin sacar todavía — así si falla podemos decidir qué hacer
      const item = global.tioEpisodeQueue[0]
      if (!item) { global.tioEpisodeQueue.shift(); continue }

      const { chatId, ep, conn } = item

      try {
        await enviarEpisodio(chatId, ep, conn)
        // Éxito → sacar de la cola
        global.tioEpisodeQueue.shift()
        console.log(`[tioanime-notify] ✅ Cola: completado ${ep.titulo} ep ${zeroPad(ep.epNum)}`)
      } catch (err) {
        // Error → sacar igual (no reintentar automáticamente para no bloquear)
        global.tioEpisodeQueue.shift()
        console.error(`[tioanime-notify] ❌ Cola error: ${err.message}`)
        try {
          await conn.sendMessage(chatId, {
            text: `❌ Error enviando *${ep.titulo}* ep *${zeroPad(ep.epNum)}*:\n${err.message}`
          })
        } catch (_) {}
      }

      // Pausa entre episodios si hay más en cola
      if (global.tioEpisodeQueue.length > 0) {
        console.log(`[tioanime-notify] Cola: ${global.tioEpisodeQueue.length} pendiente(s), esperando ${QUEUE_DELAY / 1000}s...`)
        await new Promise(r => setTimeout(r, QUEUE_DELAY))
      }
    }
  } catch (fatalErr) {
    // Error inesperado fuera del try interno — loguear y continuar
    console.error('[tioanime-notify] Error fatal en cola:', fatalErr.message)
  } finally {
    // SIEMPRE resetear el flag, pase lo que pase
    global.tioQueueRunning = false
    console.log('[tioanime-notify] Cola finalizada')
  }
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

  // .tiounblock — desbloquea la cola si quedó trabada
  if (command === 'tiounblock') {
    const estaba = global.tioQueueRunning
    global.tioQueueRunning = false
    if (global.tioEpisodeQueue.length > 0) {
      await m.reply(`🔓 Cola desbloqueada${estaba ? ' (estaba trabada)' : ''}.\n▶️ Reanudando ${global.tioEpisodeQueue.length} episodio(s)...`)
      procesarCola().catch(e => console.error('[tioanime-notify] cola error:', e.message))
    } else {
      await m.reply(`🔓 Cola desbloqueada${estaba ? ' (estaba trabada)' : ''}.\nℹ️ No hay episodios pendientes.`)
    }
    return
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
        `📺 *${ep.titulo}*\n` +
        `📌 Episodio *${zeroPad(ep.epNum)}*\n` +
        `🔗 ${ep.epUrl}\n\n` +
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

handler.command = /^(tiostart|tiostop|tiostatus|tiocheck|tioqueue|tioflush|tiounblock|tiointerval|tioexample)$/i
handler.tags    = ['anime', 'notificaciones']
handler.help    = ['tiostart', 'tiostop', 'tiostatus', 'tiocheck', 'tioqueue', 'tioflush', 'tiounblock', 'tiointerval <min>', 'tioexample']
handler.exp     = 0
handler.level   = 0
handler.limit   = false

export default handler
