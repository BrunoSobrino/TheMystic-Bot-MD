import axios from 'axios'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const cheerio = require('cheerio')

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_FEEDS_PER_CHAT = 20              // ↑ Aumentado de 10 a 20
const MAX_SEEN_GUIDS = 200
const REQUEST_TIMEOUT = 15_000
const MAX_CHATS_PER_FEED = 50              // Nuevo: límite de grupos por feed global

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
  global.db.data.rss_global = global.db.data.rss_global || {}  // Nuevo: almacén global de feeds
}

function feedsOf(chatId) {
  initDB()
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  return global.db.data.rss[chatId]
}

function getGlobalFeedStore() {
  initDB()
  return global.db.data.rss_global
}

/**
 * Obtiene todos los grupos que están suscritos a un feed específico
 */
function getChatsForUrl(url) {
  const store = getGlobalFeedStore()
  return store[url] || []
}

/**
 * Registra un grupo como suscriptor a un feed URL
 */
function addChatToUrl(url, chatId, label) {
  const store = getGlobalFeedStore()
  if (!store[url]) store[url] = []
  if (!store[url].some(c => c.chatId === chatId)) {
    store[url].push({ chatId, label, addedAt: new Date().toISOString() })
  }
}

/**
 * Desuscribe un grupo de un feed URL
 */
function removeChatFromUrl(url, chatId) {
  const store = getGlobalFeedStore()
  if (store[url]) {
    store[url] = store[url].filter(c => c.chatId !== chatId)
    if (store[url].length === 0) delete store[url]
  }
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
  const urlMap = {}
  for (const [chatId, feeds] of Object.entries(global.db.data.rss)) {
    if (!feeds?.length) continue
    for (const feed of feeds) {
      if (!urlMap[feed.url]) {
        urlMap[feed.url] = {
          subscribers: [],
          items: null,
          lastFetch: null
        }
      }
      urlMap[feed.url].subscribers.push({ chatId, feed })
    }
  }

  // ── Paso 2: fetch una sola vez por URL y distribuir a todos los grupos ────────
  for (const [url, data] of Object.entries(urlMap)) {
    try {
      data.items = await fetchFeed(url)
      if (!data.items.length) continue
    } catch (e) {
      if (e.code !== 'ECONNRESET') console.error(`[RSS Error] ${url}:`, e.message)
      continue
    }

    // Distribuir a cada suscriptor
    for (const { chatId, feed } of data.subscribers) {
      // Primera vez: inicializar sin enviar
      if (!feed.seenGuids || !feed.seenGuids.length) {
        feed.seenGuids = data.items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
        continue
      }

      const newItems = data.items.filter(i => !feed.seenGuids.includes(i.guid))
      if (!newItems.length) continue

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

      // Marcar todos los nuevos como vistos
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

  setTimeout(() => checkAllFeeds(conn).catch(e => console.error('[RSS Poller init]', e.message)), 30_000)

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
    
    // Info de grupos compartidos
    const store = getGlobalFeedStore()
    const sharedCount = feeds.filter(f => store[f.url]?.length > 1).length
    if (sharedCount > 0) {
      msg += `\n✨ *Feeds compartidos con otros grupos:* ${sharedCount}`
    }
    return m.reply(msg)
  }

  // .rssinfo [número] — información detallada de un feed
  if (/info$/i.test(command)) {
    const idx = parseInt(text) - 1
    if (isNaN(idx) || !feeds[idx]) {
      return m.reply(`❌ Número inválido.\nUsa *${usedPrefix}rssinfo <número>*`)
    }
    const feed = feeds[idx]
    const store = getGlobalFeedStore()
    const chats = store[feed.url] || []
    
    let msg = `📊 *Info: ${capitalize(feed.label)}*\n━━━━━━━━━━━━━━━━\n`
    msg += `🔗 ${feed.url}\n`
    msg += `📌 Noticias vistas: ${feed.seenGuids?.length || 0}\n`
    msg += `👥 Suscriptores (grupos): ${chats.length}\n`
    if (chats.length > 1) {
      msg += `\n   Grupos:\n`
      chats.slice(0, 5).forEach(c => {
        msg += `   • ${c.label || c.chatId}\n`
      })
      if (chats.length > 5) msg += `   ... y ${chats.length - 5} más`
    }
    return m.reply(msg)
  }

  // .rssrecientes [número]
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

  // .rssadd <url> [nombre personalizado]
  if (/add$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    if (!text)      return m.reply(`Ejemplo: *${usedPrefix}rssadd <url> [nombre]*`)

    const parts = text.trim().split('|')
    const url = parts[0].trim()
    const customLabel = parts[1]?.trim()
    
    if (!/^https?:\/\//.test(url))          return m.reply('❌ URL inválida.')
    if (feeds.some(f => f.url === url))      return m.reply('⚠️ Ya está en la lista.')
    if (feeds.length >= MAX_FEEDS_PER_CHAT)  return m.reply(`⚠️ Límite de ${MAX_FEEDS_PER_CHAT} feeds alcanzado.`)

    await m.reply('⏳ Verificando URL...')
    try {
      const items = await fetchFeed(url)
      if (!items.length) return m.reply('❌ No se encontraron noticias.')

      const label = customLabel || new URL(url).hostname
      feeds.push({ url, label, seenGuids: items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS) })
      addChatToUrl(url, chatId, label)
      
      await global.db.write()
      
      const chats = getChatsForUrl(url)
      let reply = `✅ Agregado: *${capitalize(label)}*\n━━━━━━━━━━━━━━━━\n`
      reply += `📌 Traducción automática: activada\n`
      if (chats.length > 1) {
        reply += `👥 También en ${chats.length - 1} grupo(s) más`
      }
      return m.reply(reply)
    } catch (e) {
      return m.reply(`❌ No se pudo conectar: ${e.message}`)
    }
  }

  // .rssdel <número>
  if (/del$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    const n = parseInt(text) - 1
    if (isNaN(n) || !feeds[n]) return m.reply('❌ Número inválido.')
    const [removed] = feeds.splice(n, 1)
    
    removeChatFromUrl(removed.url, chatId)
    
    await global.db.write()
    
    const chats = getChatsForUrl(removed.url)
    let reply = `🗑️ Feed *${removed.label}* eliminado de este grupo.\n`
    if (chats.length > 0) {
      reply += `ℹ️ Aún activo en ${chats.length} grupo(s).`
    }
    return m.reply(reply)
  }

  // .rssrename <número> | <nuevo nombre>
  if (/rename$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    const parts = text.split('|')
    const n = parseInt(parts[0]) - 1
    const newName = parts[1]?.trim()
    
    if (isNaN(n) || !feeds[n]) return m.reply('❌ Número inválido.')
    if (!newName) return m.reply(`Ejemplo: *${usedPrefix}rssrename 1 | Mi feed personalizado*`)
    
    const oldName = feeds[n].label
    feeds[n].label = newName
    await global.db.write()
    
    return m.reply(`✏️ Renombrado: *${oldName}* → *${newName}*`)
  }

  // .rsscheck — fuerza un check manual
  if (/check$/i.test(command)) {
    await m.reply('🔄 Buscando actualizaciones en todos los feeds...')
    await checkAllFeeds(conn)
    return m.reply('✅ Listo. Solo se enviaron noticias nuevas.')
  }

  // .rssstat — estadísticas globales
  if (/stat$/i.test(command)) {
    const allChats = new Set(Object.keys(global.db.data.rss))
    let totalFeeds = 0
    for (const f of Object.values(global.db.data.rss)) {
      totalFeeds += f.length
    }
    const store = getGlobalFeedStore()
    const uniqueUrls = Object.keys(store).length
    
    let msg = `📊 *Estadísticas RSS*\n━━━━━━━━━━━━━━━━\n`
    msg += `👥 Grupos activos: ${allChats.size}\n`
    msg += `📰 Feeds únicos: ${uniqueUrls}\n`
    msg += `📌 Total suscripciones: ${totalFeeds}\n`
    msg += `⏱️ Intervalo de check: ${POLL_INTERVAL_MS / 1000 / 60} min`
    
    if (canManage) {
      msg += `\n\n🔧 *Opciones de administrador:*\n`
      msg += `*${usedPrefix}rsscleanup* - Limpiar feeds huérfanos`
    }
    
    return m.reply(msg)
  }

  // .rsscleanup — limpia feeds sin suscriptores (admin)
  if (/cleanup$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo administradores.')
    
    const store = getGlobalFeedStore()
    const initialCount = Object.keys(store).length
    
    for (const url of Object.keys(store)) {
      if (!store[url] || store[url].length === 0) {
        delete store[url]
      }
    }
    
    const finalCount = Object.keys(store).length
    await global.db.write()
    
    return m.reply(`🧹 Limpieza completada.\nFeeds removidos: ${initialCount - finalCount}`)
  }
}

// Inicia el poller en cada mensaje
handler.all = async function (m, { conn } = {}) {
  const c = conn || global.conn
  if (!_pollerStarted && c) startPoller(c)
}

handler.command = /^rss(add|del|list|recientes|check|info|rename|stat|cleanup)$/i
handler.tags    = ['tools']
handler.help    = [
  'rssadd <url> [nombre]',
  'rssdel <número>',
  'rsslist',
  'rssinfo <número>',
  'rssrecientes [número]',
  'rssrename <número> | <nombre>',
  'rsscheck',
  'rssstat',
  'rsscleanup'
]

export default handler
        
