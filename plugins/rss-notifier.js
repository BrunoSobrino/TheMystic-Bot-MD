import axios from 'axios'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const cheerio = require('cheerio')

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_FEEDS_PER_CHAT = 10
const MAX_SEEN_GUIDS = 50
const REQUEST_TIMEOUT = 15_000

const PRESET_FEEDS = {
  kudasai: 'https://somoskudasai.com/feed/',
  crunchyroll: 'https://www.crunchyroll.com/newsrss?lang=es'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  })

  const $ = cheerio.load(data, { xmlMode: true })
  const items = []

  // RSS 2.0 Parser
  $('item').each((_, el) => {
    const title = $(el).find('title').first().text().trim()
    const link = $(el).find('link').first().text().trim() || $(el).find('link').first().attr('href') || ''
    const guid = $(el).find('guid').first().text().trim() || link
    const pubDate = $(el).find('pubDate').first().text().trim()
    const desc = $(el).find('description').first().text().trim()
    const img = $(el).find('enclosure[type^="image"]').attr('url') ||
                $(el).find('media\\:thumbnail, media\\:content').first().attr('url') ||
                extractFirstImgSrc(desc)
    if (title && guid) items.push({ title, link, guid, pubDate, img })
  })

  // Atom Parser Fallback
  if (!items.length) {
    $('entry').each((_, el) => {
      const title = $(el).find('title').first().text().trim()
      const link = $(el).find('link[rel="alternate"]').attr('href') || $(el).find('link').first().attr('href') || ''
      const guid = $(el).find('id').first().text().trim() || link
      const pubDate = $(el).find('published, updated').first().text().trim()
      const img = extractFirstImgSrc($(el).find('content').first().text())
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

// ─── Poller Automático ────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkAllFeeds(conn) {
  if (!global.db?.data?.rss) return
  for (const [chatId, feeds] of Object.entries(global.db.data.rss)) {
    if (!feeds?.length) continue
    for (const feed of feeds) {
      try {
        const items = await fetchFeed(feed.url)
        if (!items.length) continue
        if (!feed.seenGuids) {
          feed.seenGuids = items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
          continue
        }
        const newItems = items.filter(i => !feed.seenGuids.includes(i.guid))
        for (const item of newItems.reverse().slice(0, 3)) { // Máximo 3 por ciclo para evitar spam
          const text = `📰 *${feed.label || 'RSS'}*\n━━━━━━━━━━━━━━━━\n🎌 *${item.title}*\n${formatDate(item.pubDate) ? '🕐 ' + formatDate(item.pubDate) + '\n' : ''}\n🔗 ${item.link}`
          if (item.img) await conn.sendMessage(chatId, { image: { url: item.img }, caption: text })
          else await conn.sendMessage(chatId, { text })
          await new Promise(r => setTimeout(r, 2000))
        }
        feed.seenGuids = [...newItems.map(i => i.guid), ...feed.seenGuids].slice(0, MAX_SEEN_GUIDS)
      } catch (e) { console.error(`[RSS Error] ${feed.url}:`, e.message) }
    }
  }
  global.db.write().catch(() => {})
}

function startPoller(conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[RSS] Poller Activo')
  setInterval(() => checkAllFeeds(conn), POLL_INTERVAL_MS)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const feeds = feedsOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  if (/list$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds.\nUsa *${usedPrefix}rssadd <url>*`)
    let msg = `📋 *Feeds Activos (${feeds.length}/${MAX_FEEDS_PER_CHAT})*\n━━━━━━━━━━━━━━━━\n`
    feeds.forEach((f, i) => msg += `*${i + 1}.* ${f.label}\n   🔗 ${f.url}\n`)
    return m.reply(msg)
  }

  if (/recientes$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds.`)
    const idx = parseInt(text) - 1
    const feed = feeds[idx] || feeds[0]
    m.reply(`⏳ Cargando de *${feed.label}*...`)
    const items = await fetchFeed(feed.url)
    const top = items.slice(0, 5)
    let res = `📰 *${feed.label}*\n━━━━━━━━━━━━━━━━\n`
    top.forEach((it, i) => res += `*${i + 1}.* ${it.title}\n🔗 ${it.link}\n───────────────\n`)
    return m.reply(res.trim())
  }

  if (/add$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo Admins.')
    if (!text) return m.reply(`Ejemplo: *${usedPrefix}rssadd kudasai*`)
    const url = PRESET_FEEDS[text.trim().toLowerCase()] || text.trim()
    if (!/^https?:\/\//.test(url)) return m.reply('❌ URL inválida.')
    
    await m.reply('⏳ Verificando...')
    const items = await fetchFeed(url)
    if (!items.length) return m.reply('❌ No es un feed válido.')
    
    const label = PRESET_FEEDS[text.toLowerCase()] ? text.toLowerCase() : new URL(url).hostname
    feeds.push({ url, label, seenGuids: items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS) })
    await global.db.write()
    return m.reply(`✅ Agregado: *${label}*`)
  }

  if (/del$/i.test(command)) {
    if (!canManage) return m.reply('⛔ Solo Admins.')
    const n = parseInt(text) - 1
    if (isNaN(n) || !feeds[n]) return m.reply('❌ Número inválido.')
    feeds.splice(n, 1)
    await global.db.write()
    return m.reply('🗑️ Feed eliminado.')
  }
  
  if (/check$/i.test(command)) {
    await m.reply('🔄 Revisando...')
    await checkAllFeeds(conn)
    return m.reply('✅ Hecho.')
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command = /^rss(add|del|list|recientes|check)$/i
handler.tags = ['tools']
handler.help = ['rssadd', 'rssdel', 'rsslist', 'rssrecientes', 'rsscheck']

export default handler
                                              
