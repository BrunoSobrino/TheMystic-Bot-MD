/**
 * crunchyroll-notify.js
 * Plugin para KanaArima-MD / Rikka-Bot (Baileys)
 *
 * Variables de entorno (.env):
 *   CR_MINUTES       → cada cuántos minutos corre el cron        (default: 30)
 *   CR_LAST_MINUTES  → ventana de tiempo a revisar en el calendario  (default: 60)
 *   CR_TARGET_JID    → JID del grupo/chat destino automático
 *                      ej: 1234567890-1234567890@g.us  (grupo)
 *                          1234567890@s.whatsapp.net   (privado)
 *
 * Comandos:
 *   .crnotify        → fetch manual de episodios nuevos al chat actual
 *   .crnotify set    → guarda el chat actual como destino automático del cron
 *   .crnotify status → muestra configuración actual
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'


// ─── Rutas ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = join(__dirname, '../tmp')
const DB_PATH   = join(TMP_DIR, 'crunchyroll-seen.json')
const CFG_PATH  = join(TMP_DIR, 'crunchyroll-cfg.json')

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

// ─── Config ──────────────────────────────────────────────────────────────────

const CALENDAR_URL = 'https://www.crunchyroll.com/es/simulcastcalendar?filter=premium'
const CR_HEADERS   = {
  'User-Agent'     : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
}

function loadCfg() {
  try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} }
}
function saveCfg(data) {
  writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Deduplicación ───────────────────────────────────────────────────────────

function loadSeen() {
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}
function saveSeen(ids) {
  writeFileSync(DB_PATH, JSON.stringify(ids.slice(-300)), 'utf-8')
}

// ─── Scraper del calendario (Next.js __NEXT_DATA__) ──────────────────────────

/**
 * Busca recursivamente en el objeto de Next.js un array que contenga
 * elementos con forma de episodio del calendario de CR.
 */
function findCalendarDays(obj, depth = 0) {
  if (depth > 12 || obj === null || typeof obj !== 'object') return null

  if (Array.isArray(obj)) {
    // ¿Es un array de días? Los días tienen `date` y alguna lista de episodios/paneles
    if (
      obj.length > 0 &&
      typeof obj[0] === 'object' &&
      (obj[0].date || obj[0].simulcastDate || obj[0].airDate)
    ) {
      return obj
    }
    for (const item of obj) {
      const found = findCalendarDays(item, depth + 1)
      if (found) return found
    }
  } else {
    for (const val of Object.values(obj)) {
      const found = findCalendarDays(val, depth + 1)
      if (found) return found
    }
  }
  return null
}

/**
 * Extrae la imagen más grande de la estructura de thumbnails de CR.
 * Acepta array de arrays [[{source,width,height},...]] o string directo.
 */
function extractImage(images) {
  if (!images) return ''
  if (typeof images === 'string') return images

  // CR usa: { thumbnail: [[{source,width,height},...]] }
  const thumb = images.thumbnail || images.poster_tall || images.poster_wide
  if (!thumb) return ''
  if (typeof thumb === 'string') return thumb
  if (Array.isArray(thumb)) {
    // Aplana y toma el source del elemento con mayor width
    const flat = thumb.flat()
    const best = flat.sort((a, b) => (b.width || 0) - (a.width || 0))[0]
    return best?.source || best?.url || ''
  }
  return ''
}

/**
 * Normaliza un "día" del calendario a un array de episodios planos.
 * Intenta las estructuras más comunes de la API de CR.
 */
function normalizeDayEpisodes(day) {
  const date = day.date || day.simulcastDate || day.airDate || ''
  const episodes = []

  // Estructura: day.windows[].panels[] (API v2+)
  if (Array.isArray(day.windows)) {
    for (const win of day.windows) {
      const panels = win.panels || win.items || win.episodes || []
      for (const p of panels) {
        episodes.push({ date, window: win.time || win.startsAt || '', panel: p })
      }
    }
    return episodes
  }

  // Estructura: day.panels[] (API alternativa)
  if (Array.isArray(day.panels)) {
    for (const p of day.panels) {
      episodes.push({ date, window: p.startsAt || p.time || '', panel: p })
    }
    return episodes
  }

  // Estructura: day.episodes[]
  if (Array.isArray(day.episodes)) {
    for (const p of day.episodes) {
      episodes.push({ date, window: p.airDate || p.startsAt || '', panel: p })
    }
    return episodes
  }

  return episodes
}

/**
 * Convierte un panel de CR en el objeto unificado que usa el plugin.
 */
function panelToItem(entry) {
  const p    = entry.panel
  const slug = p.slug || p.id || ''
  const link = slug
    ? `https://www.crunchyroll.com/es/series/${slug}`
    : (p.link || p.url || p.seriesLink || '')

  // Título: prefiere título localizado
  const title = (
    p.title              ||
    p.seriesTitle        ||
    p.episodeTitle       ||
    p.name               || ''
  ).trim()

  const epNum = p.episodeNumber ?? p.episode_number ?? p.number ?? null
  const fullTitle = epNum !== null
    ? `${title} — Episodio ${epNum}`
    : title

  // Hora de emisión
  const airRaw = entry.window || p.startsAt || p.airDate || p.time || ''
  const airTime = airRaw ? new Date(airRaw).getTime() : 0

  const image = extractImage(p.images) || extractImage(p.thumbnailImage) || ''

  // Estreno
  const isNew = !!(p.isNew || p.isPremiere || p.firstEpisode || epNum === 1)

  // ID único para deduplicación
  const id = `${slug}-ep${epNum ?? title}`

  return { id, title: fullTitle, link, airTime, image, isNew }
}

async function scrapeCalendar() {
  const res = await fetch(CALENDAR_URL, {
    headers: CR_HEADERS,
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} al scrapear el calendario`)

  const html = await res.text()

  // ── Extraer __NEXT_DATA__ ──────────────────────────────────────────────────
  const ndMatch = html.match(
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  )
  if (!ndMatch) throw new Error('No se encontró __NEXT_DATA__ en la página')

  let nextData
  try { nextData = JSON.parse(ndMatch[1]) }
  catch { throw new Error('Error al parsear __NEXT_DATA__') }

  // ── Navegar la estructura ──────────────────────────────────────────────────
  const days = findCalendarDays(nextData)
  if (!days || !days.length) {
    // Log para debug — no lanza error para que el bot pueda informar
    console.warn('[CR-Notify] No se encontraron días en __NEXT_DATA__. Claves top-level:', Object.keys(nextData?.props?.pageProps || {}))
    return []
  }

  // Filtrar solo el día de HOY (zona America/Mexico_City)
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) // YYYY-MM-DD

  const todayDays = days.filter(d => {
    const dayDate = (d.date || d.simulcastDate || d.airDate || '').slice(0, 10)
    return dayDate === todayStr || dayDate === ''  // '' = incluye si no hay fecha
  })

  const rawEpisodes = (todayDays.length ? todayDays : days)
    .flatMap(normalizeDayEpisodes)
    .map(panelToItem)
    .filter(i => i.title && i.id)

  return rawEpisodes
}

async function fetchNewEpisodes() {
  const cfg         = loadCfg()
  const lastMinutes = parseInt(process.env.CR_LAST_MINUTES ?? cfg.lastMinutes ?? '60')
  const cutoff      = Date.now() - lastMinutes * 60_000

  const allItems = await scrapeCalendar()

  // Filtra solo los emitidos dentro de la ventana de tiempo
  const recent = allItems.filter(i => !i.airTime || i.airTime >= cutoff)
  if (!recent.length) return []

  const seen     = loadSeen()
  const newItems = recent.filter(i => !seen.includes(i.id))

  if (newItems.length) {
    saveSeen([...seen, ...newItems.map(i => i.id)])
  }

  return newItems
}

// ─── Formateo de mensaje ─────────────────────────────────────────────────────

function formatCaption(item) {
  const date = item.airTime
    ? new Date(item.airTime).toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : ''
  const estreno = item.isNew ? '🆕 *ESTRENO*\n' : ''
  const hora    = date ? `\n🕐 _${date}_` : ''
  return `🎌 *Nuevo episodio en Crunchyroll*\n\n${estreno}📺 *${item.title}*${hora}\n🔗 ${item.link}`
}

// ─── Envío a WhatsApp ────────────────────────────────────────────────────────

async function sendItem(conn, jid, item, quotedMsg = null) {
  const caption = formatCaption(item)
  const opts    = quotedMsg ? { quoted: quotedMsg } : {}

  if (item.image) {
    try {
      await conn.sendMessage(jid, { image: { url: item.image }, caption }, opts)
      return
    } catch {
      // fallback a texto si la imagen falla
    }
  }
  await conn.sendMessage(jid, { text: caption }, opts)
}

async function sendDelay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Cron ────────────────────────────────────────────────────────────────────

let cronTimer   = null
let storedConn  = null

function stopCron() {
  if (cronTimer) { clearInterval(cronTimer); cronTimer = null }
}

function startCron(conn) {
  storedConn = conn
  stopCron()

  const cfg     = loadCfg()
  const minutes = parseInt(process.env.CR_MINUTES ?? cfg.minutes ?? '30')
  const jid     = process.env.CR_TARGET_JID || cfg.targetJid || ''

  if (!jid) {
    console.log('[CR-Notify] Sin JID configurado, cron en standby.')
    return
  }

  const ms = minutes * 60 * 1000

  cronTimer = setInterval(async () => {
    try {
      const items = await fetchNewEpisodes()
      for (const item of items) {
        await sendItem(storedConn, jid, item)
        await sendDelay(2000)
      }
      if (items.length) {
        console.log(`[CR-Notify] ${items.length} episodio(s) enviado(s) a ${jid}`)
      }
    } catch (err) {
      console.error('[CR-Notify] Error en cron:', err.message)
    }
  }, ms)

  console.log(`[CR-Notify] Intervalo iniciado → cada ${minutes} min | destino: ${jid}`)
}

// ─── Handler del plugin ──────────────────────────────────────────────────────

let handler = async (m, { conn, args, isOwner }) => {
  // Inicializa / refresca la conexión almacenada
  if (!storedConn) startCron(conn)
  else storedConn = conn

  const sub = (args[0] || '').toLowerCase()

  // ── .crnotify set ──────────────────────────────────────────────────────────
  if (sub === 'set') {
    if (!isOwner) return conn.sendMessage(m.chat, { text: '⛔ Solo el dueño puede hacer esto.' }, { quoted: m })

    const cfg     = loadCfg()
    cfg.targetJid = m.chat
    saveCfg(cfg)
    process.env.CR_TARGET_JID = m.chat

    startCron(conn) // reinicia con el nuevo JID

    return conn.sendMessage(m.chat, {
      text: `✅ *Canal configurado*\n\`${m.chat}\`\n\nEl cron enviará las notificaciones aquí.`,
    }, { quoted: m })
  }

  // ── .crnotify status ───────────────────────────────────────────────────────
  if (sub === 'status') {
    const cfg     = loadCfg()
    const jid     = process.env.CR_TARGET_JID || cfg.targetJid || '_no configurado_'
    const minutes = process.env.CR_MINUTES    || cfg.minutes   || '30'
    const last    = process.env.CR_LAST_MINUTES || cfg.lastMinutes || '60'
    const seen    = loadSeen()

    return conn.sendMessage(m.chat, {
      text: `📊 *CR-Notify Status*\n\n` +
            `🎯 Destino: \`${jid}\`\n` +
            `⏱ Cron: cada *${minutes} min*\n` +
            `🕐 Ventana: últimos *${last} min*\n` +
            `💾 IDs guardados: *${seen.length}*\n` +
            `🔄 Cron activo: *${cronTimer ? 'Sí' : 'No'}*`,
    }, { quoted: m })
  }

  // ── .crnotify (fetch manual) ───────────────────────────────────────────────
  await conn.sendMessage(m.chat, { text: '🔍 Buscando episodios nuevos...' }, { quoted: m })

  try {
    const items = await fetchNewEpisodes()

    if (!items.length) {
      const last = process.env.CR_LAST_MINUTES || loadCfg().lastMinutes || '60'
      return conn.sendMessage(m.chat, {
        text: `📭 No hay episodios nuevos en los últimos *${last} min*.`,
      }, { quoted: m })
    }

    for (const item of items) {
      await sendItem(conn, m.chat, item, m)
      await sendDelay(1500)
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
  }
}

handler.help    = ['crnotify', 'crnotify set', 'crnotify status']
handler.tags    = ['anime']
handler.command = /^cr(notify|news)$/i

// Inicia el cron en cuanto el plugin se carga (si ya hay JID guardado)
;(async () => {
  const cfg = loadCfg()
  const jid = process.env.CR_TARGET_JID || cfg.targetJid || ''
  if (jid && !cronTimer) {
    // conn no está disponible aún en el arranque; el cron se inicia
    // cuando el primer comando llega y establece storedConn.
    // Solo logueamos que hay config lista.
    console.log(`[CR-Notify] Config cargada. JID destino: ${jid}`)
  }
})()

export default handler
      
