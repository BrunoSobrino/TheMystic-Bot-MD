import axios from 'axios'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const cheerio = require('cheerio')

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_FEEDS_PER_CHAT = 10
const MAX_SEEN_GUIDS = 200   // subido para reducir falsas "novedades" tras reinicio
const REQUEST_TIMEOUT = 15_000

// ─── Helpers de Traducción ────────────────────────────────────────────────────

async function translateText(text) {
  try {
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(text)}`,
      { timeout: 5000 }
    )
    return res.data[0][0][0]
  } catch {
    return text
  }
}

// ─── Helpers de RSS ───────────────────────────────────────────────────────────

function initDB() {
  if (!global.db?.data) return
  global.db.data.rss = global.db.data.rss || {}
}

function feedsOf(chatId) {
  initDB()
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  return global.db.data.rss[chatId]
}

async function fetchFeed(url) {
  const { data } = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/xml,text/xml,application/xhtml+xml',
      'Cache-Control': 'no-cache'
    }
  })

  const $ = cheerio.load(data, { xmlMode: true })
  const items = []

  $('item').each((_, el) => {
    const title   = $(el).find('title').first().text().trim()
    const link    = $(el).find('link').first().text().trim() || $(el).find('link').first().attr('href') || ''
    const guid    = $(el).find('guid').first().text().trim() || link
    const pubDate = $(el).find('pubDate').first().text().trim()
    const desc    = $(el).find('description').first().text().trim()
    const img     = $(el).find('enclosure[type^="image"]').attr('url') ||
                    $(el).find('media\\:thumbnail, media\\:content').first().attr('url') ||
                    extractFirstImgSrc(desc)
    if (title && guid) items.push({ title, link, guid, pubDate, img })
  })

  if (!items.length) {
    $('entry').each((_, el) => {
      const title   = $(el).find('title').first().text().trim()
      const link    = $(el).find('link[rel="alternate"]').attr('href') || $(el).find('link').first().attr('href') || ''
      const guid    = $(el).find('id').first().text().trim() || link
      const pubDate = $(el).find('published, updated').first().text().trim()
      const img     = extractFirstImgSrc($(el).find('content').first().text())
      if (title && guid) items.push({ title, link, guid, pubDate, img })
    })
  }
  return items
}

function extractFirstImgSrc(html = '') {
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i)
  return m ? m[1] : null
}

function formatDate(pubDate) {
  if (!pubDate) return ''
  const d = new Date(pubDate)
  return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Poller Automático ────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkAllFeeds(conn) {
  if (!global.db?.data?.rss) return

  // ── Paso 1: agrupar todas las suscripciones por URL ──────────────────────────
  // urlMap[url] = [ { chatId, feed }, ... ]
  const urlMap = {}
  for (const [chatId, feeds] of Object.entries(global.db.data.rss)) {
    if (!feeds?.length) continue
    for (const feed of feeds) {
      if (!urlMap[feed.url]) urlMap[feed.url] = []
      urlMap[feed.url].push({ chatId, feed })
    }
  }

  // ── Paso 2: fetch una sola vez por URL y distribuir a todos los grupos ────────
  for (const [url, subscribers] of Object.entries(urlMap)) {
    let items
    try {
      items = await fetchFeed(url)
      if (!items.length) continue
    } catch (e) {
      if (e.code !== 'ECONNRESET') console.error(`[RSS Error] ${url}:`, e.message)
      continue
    }

    // Pre-traducir títulos de items nuevos una sola vez (se reutiliza por grupo)
    // Se calcula por suscriptor porque cada uno tiene su propio seenGuids
    for (const { chatId, feed } of subscribers) {
      // Primera vez: inicializar sin enviar
      if (!feed.seenGuids || !feed.seenGuids.length) {
        feed.seenGuids = items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
        continue
      }

      const newItems = items.filter(i => !feed.seenGuids.includes(i.guid))
      if (!newItems.length) continue

      // Traducir una sola vez para este lote (mismo feed, mismo contenido)
      const toSend = newItems.reverse().slice(0, 3)
      for (const item of toSend) {
        try {
          const translatedTitle = await translateText(item.title)
          const dateStr = formatDate(item.pubDate)
          const text = `📰 *${feed.label || 'RSS'}*\n━━━━━━━━━━━━━━━━\n🎌 *${translatedTitle}*\n${dateStr ? '🕐 ' + dateStr + '\n' : ''}\n🔗 ${item.link}`

          if (item.img) await conn.sendMessage(chatId, { image: { url: item.img }, caption: text })
          else          await conn.sendMessage(chatId, { text })
          await new Promise(r => setTimeout(r, 1500))
        } catch (e) {
          console.error(`[RSS Send] ${chatId}:`, e.message)
        }
      }

      // Marcar todos los nuevos como vistos (no solo los enviados)
      feed.seenGuids = [
        ...newItems.map(i => i.guid),
        ...feed.seenGuids
      ].slice(0, MAX_SEEN_GUIDS)
    }
  }

  try { await global.db.write() } catch (e) { console.error('[RSS] db.write error:', e.message) }
}

function startPoller(conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[RSS] Poller activo ✓')

  // Primer check a los 30 s del arranque (no esperar 10 min)
  setTimeout(() => checkAllFeeds(conn).catch(e => console.error('[RSS Poller init]', e.message)), 30_000)

  // Check periódico: el .catch() evita que el setInterval muera por un error
  setInterval(
    () => checkAllFeeds(conn).catch(e => console.error('[RSS Poller tick]', e.message)),
    POLL_INTERVAL_MS
  )
}

// ─── Handler ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const feeds  = feedsOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  // .rsslist
  if (/list$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds activos.\nUsa *${usedPrefix}rssadd <url>*`)
    let msg = `📋 *Feeds Activos (${feeds.length}/${MAX_FEEDS_PER_CHAT})*\n━━━━━━━━━━━━━━━━\n`
    feeds.forEach((f, i) => msg += `*${i + 1}.* ${capitalize(f.label)}\n   🔗 ${f.url}\n`)
    return m.reply(msg)
  }

  // .rssrecientes
  if (/recientes$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds registrados.`)
    const idx  = parseInt(text) - 1
    const feed = feeds[idx] || feeds[0]
    m.reply(`⏳ Cargando noticias de *${feed.label}*...`)
    try {
      const items = await fetchFeed(feed.url)
      const top   = items.slice(0, 5)
      let res = `📰 *${capitalize(feed.label)}*\n━━━━━━━━━━━━━━━━\n`
      for (const [i, it] of top.entries()) {
        const translated = await translateText(it.title)
        res += `*${i + 1}.* ${translated}\n🔗 ${it.link}\n───────────────\n`
      }
      return m.reply(res.trim())
    } catch (e) {
      return m.reply(`❌ Error al conectar con el feed: ${e.message}`)
    }
  }

  // .rssadd
  if (/add$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    if (!text)      return m.reply(`Ejemplo: *${usedPrefix}rssadd <url>*`)

    const url = text.trim()
    if (!/^https?:\/\//.test(url))          return m.reply('❌ URL inválida.')
    if (feeds.some(f => f.url === url))      return m.reply('⚠️ Ya está en la lista.')
    if (feeds.length >= MAX_FEEDS_PER_CHAT)  return m.reply('⚠️ Límite alcanzado.')

    await m.reply('⏳ Verificando URL...')
    try {
      const items = await fetchFeed(url)
      if (!items.length) return m.reply('❌ No se encontraron noticias.')

      const label = new URL(url).hostname
      // seenGuids inicializado con los items actuales → no notifica noticias viejas
      feeds.push({ url, label, seenGuids: items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS) })
      await global.db.write()
      return m.reply(`✅ Agregado: *${capitalize(label)}* (traducción automática activada)`)
    } catch (e) {
      return m.reply(`❌ No se pudo conectar: ${e.message}`)
    }
  }

  // .rssdel
  if (/del$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    const n = parseInt(text) - 1
    if (isNaN(n) || !feeds[n]) return m.reply('❌ Número inválido.')
    const [removed] = feeds.splice(n, 1)
    await global.db.write()
    return m.reply(`🗑️ Feed *${removed.label}* eliminado.`)
  }

  // .rsscheck — fuerza un check manual y notifica solo novedades reales
  if (/check$/i.test(command)) {
    await m.reply('🔄 Buscando actualizaciones...')
    await checkAllFeeds(conn)
    return m.reply('✅ Listo. Solo se enviaron items no vistos anteriormente.')
  }
}

// Inicia el poller en cada mensaje (solo arranca una vez por _pollerStarted)
handler.all = async function (m, { conn } = {}) {
  const c = conn || global.conn
  if (!_pollerStarted && c) startPoller(c)
}

handler.command = /^rss(add|del|list|recientes|check)$/i
handler.tags    = ['tools']
handler.help    = ['rssadd <url>', 'rssdel <número>', 'rsslist', 'rssrecientes', 'rsscheck']

export default handler
          
