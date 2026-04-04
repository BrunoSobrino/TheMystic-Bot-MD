/**
 * rss-notifier.js — KanaArima-MD
 *
 * Comandos:
 *   .rssadd <url|preset>   → Agrega feed (máx. 10 por chat)
 *   .rssdel <número>       → Elimina feed por número
 *   .rsslist               → Lista feeds del chat
 *   .rssrecientes [#feed]  → Muestra los 10 artículos más recientes
 *   .rsscheck              → Fuerza revisión ahora
 *
 * Notificación automática cada 10 minutos.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10 * 60 * 1000
const MAX_FEEDS_PER_CHAT = 10
const MAX_SEEN_GUIDS = 50
const REQUEST_TIMEOUT = 15_000

const PRESET_FEEDS = {
  kudasai:     'https://somoskudasai.com/feed/',
  crunchyroll: 'https://www.crunchyroll.com/newsrss?lang=es'
}

// ─── Helpers de DB ────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.rss) global.db.data.rss = {}
}

function feedsOf (chatId) {
  initDB()
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  return global.db.data.rss[chatId]
}

// ─── Parser RSS/Atom ─────────────────────────────────────────────────────────

async function fetchFeed (url) {
  const { data } = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: { 'User-Agent': 'KanaArima-MD RSS Bot/1.0' }
  })

  const $ = cheerio.load(data, { xmlMode: true })
  const items = []

  // RSS 2.0
  $('item').each((_, el) => {
    const title   = $(el).find('title').first().text().trim()
    const link    = $(el).find('link').first().text().trim()
                 || $(el).find('link').first().attr('href') || ''
    const guid    = $(el).find('guid').first().text().trim() || link
    const pubDate = $(el).find('pubDate').first().text().trim()
    const desc    = $(el).find('description').first().text().trim()
    const img     = $(el).find('enclosure[type^="image"]').attr('url')
                 || $(el).find('media\\:thumbnail,media\\:content').first().attr('url')
                 || extractFirstImgSrc(desc)
    if (title && guid) items.push({ title, link, guid, pubDate, img })
  })

  // Atom
  if (!items.length) {
    $('entry').each((_, el) => {
      const title   = $(el).find('title').first().text().trim()
      const link    = $(el).find('link[rel="alternate"]').attr('href')
                   || $(el).find('link').first().attr('href') || ''
      const guid    = $(el).find('id').first().text().trim() || link
      const pubDate = $(el).find('published,updated').first().text().trim()
      const img     = extractFirstImgSrc($(el).find('content').first().text())
      if (title && guid) items.push({ title, link, guid, pubDate, img })
    })
  }

  return items
}

function extractFirstImgSrc (html = '') {
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i)
  return m ? m[1] : null
}

function formatDate (pubDate) {
  if (!pubDate) return ''
  const d = new Date(pubDate)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildNotifText (item, label) {
  let text = `📰 *${label}*\n`
  text += `━━━━━━━━━━━━━━━━\n`
  text += `🎌 *${item.title}*\n`
  const fecha = formatDate(item.pubDate)
  if (fecha) text += `🕐 ${fecha}\n`
  text += `\n🔗 ${item.link}`
  return text
}

// ─── Poller ───────────────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkAllFeeds (conn) {
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

        for (const item of newItems.reverse()) {
          try {
            const text = buildNotifText(item, feed.label || 'RSS')
            if (item.img) {
              await conn.sendMessage(chatId, { image: { url: item.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
          } catch (e) {
            console.error(`[RSS] Error enviando a ${chatId}:`, e.message)
          }
          await new Promise(r => setTimeout(r, 1500))
        }

        feed.seenGuids = [
          ...newItems.map(i => i.guid),
          ...feed.seenGuids
        ].slice(0, MAX_SEEN_GUIDS)

      } catch (e) {
        console.error(`[RSS] Error en "${feed.url}":`, e.message)
      }
    }
  }

  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[RSS] Poller iniciado — cada', POLL_INTERVAL_MS / 60000, 'min')
  setTimeout(() => checkAllFeeds(conn), 30_000)
  setInterval(() => checkAllFeeds(conn), POLL_INTERVAL_MS)
}

// ─── Comandos ─────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const feeds  = feedsOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  // ── .rsslist ──────────────────────────────────────────────────────────────
  if (/^rsslist$/i.test(command)) {
    if (!feeds.length)
      return m.reply(`❌ No hay feeds en este chat.\nUsa *${usedPrefix}rssadd <url|preset>* para agregar uno.`)

    let msg = `📋 *Feeds RSS — ${feeds.length}/${MAX_FEEDS_PER_CHAT}*\n`
    msg += `━━━━━━━━━━━━━━━━\n`
    feeds.forEach((f, i) => {
      msg += `*${i + 1}.* ${f.label || 'Sin nombre'}\n`
      msg += `   🔗 ${f.url}\n`
    })
    msg += `\n*Presets:* ${Object.keys(PRESET_FEEDS).join(', ')}\n`
    msg += `*Eliminar:* ${usedPrefix}rssdel <número>`
    return m.reply(msg)
  }

  // ── .rssrecientes [#feed] ─────────────────────────────────────────────────
  if (/^rssrecientes$/i.test(command)) {
    if (!feeds.length)
      return m.reply(`❌ No hay feeds en este chat.`)

    const idx = parseInt(text?.trim()) - 1
    const feed = (!isNaN(idx) && idx >= 0 && idx < feeds.length)
      ? feeds[idx]
      : feeds[0]

    // Si hay varios feeds y no especificó cuál, mostrar selector
    if (feeds.length > 1 && (isNaN(idx) || idx < 0 || idx >= feeds.length)) {
      let sel = `📋 *¿De cuál feed quieres los recientes?*\n━━━━━━━━━━━━━━━━\n`
      feeds.forEach((f, i) => { sel += `*${i + 1}.* ${f.label || f.url}\n` })
      sel += `\nUsa *${usedPrefix}rssrecientes <número>*`
      return m.reply(sel)
    }

    await m.reply(`⏳ Cargando recientes de *${feed.label || feed.url}*...`)

    let items
    try {
      items = await fetchFeed(feed.url)
    } catch (e) {
      return m.reply(`❌ No se pudo leer el feed:\n${e.message}`)
    }

    if (!items.length) return m.reply(`⚠️ El feed no tiene artículos.`)

    const top10 = items.slice(0, 10)

    // Primer artículo con imagen (si tiene)
    const primero = top10[0]
    const headerText = `📰 *${feed.label || 'RSS'} — Últimas noticias*\n━━━━━━━━━━━━━━━━`
    if (primero.img) {
      await conn.sendMessage(chatId, { image: { url: primero.img }, caption: headerText }, { quoted: m })
    } else {
      await conn.sendMessage(chatId, { text: headerText }, { quoted: m })
    }

    // Lista de los 10
    let lista = ''
    top10.forEach((item, i) => {
      const fecha = formatDate(item.pubDate)
      lista += `*${i + 1}.* ${item.title}\n`
      if (fecha) lista += `   🕐 ${fecha}\n`
      lista += `   🔗 ${item.link}\n`
      if (i < top10.length - 1) lista += `───────────────\n`
    })

    return conn.sendMessage(chatId, { text: lista.trim() })
  }

  // ── .rsscheck ─────────────────────────────────────────────────────────────
  if (/^rsscheck$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds en este chat.`)
    await m.reply(`🔄 Verificando todos los feeds...`)
    await checkAllFeeds(conn)
    return m.reply(`✅ Verificación completada.`)
  }

  // ── .rssdel <n> ───────────────────────────────────────────────────────────
  if (/^rssdel$/i.test(command)) {
    if (!canManage)
      return m.reply(`⛔ Solo el dueño del bot o administradores pueden eliminar feeds.`)
    if (!feeds.length)
      return m.reply(`❌ No hay feeds. Usa *${usedPrefix}rsslist* para ver la lista.`)

    const n = parseInt(text?.trim())
    if (isNaN(n) || n < 1 || n > feeds.length)
      return m.reply(`⚠️ Número inválido (1–${feeds.length}). Usa *${usedPrefix}rsslist*.`)

    const [removed] = feeds.splice(n - 1, 1)
    global.db.data.rss[chatId] = feeds
    await global.db.write()
    return m.reply(`🗑️ Feed eliminado: *${removed.label || removed.url}*\n\nQuedan ${feeds.length}/${MAX_FEEDS_PER_CHAT} feeds.`)
  }

  // ── .rssadd <url|preset> ──────────────────────────────────────────────────
  if (/^rssadd$/i.test(command)) {
    if (!canManage)
      return m.reply(`⛔ Solo el dueño del bot o administradores pueden agregar feeds.`)

    if (feeds.length >= MAX_FEEDS_PER_CHAT)
      return m.reply(`⚠️ Límite alcanzado (${MAX_FEEDS_PER_CHAT} feeds máximo).\nElimina uno con *${usedPrefix}rssdel <número>*.`)

    if (!text?.trim()) {
      let msg = `ℹ️ *Uso:* ${usedPrefix}rssadd <url o preset>\n\n`
      msg += `*Presets disponibles:*\n`
      for (const [key, url] of Object.entries(PRESET_FEEDS)) {
        msg += `  • *${key}* → ${url}\n`
      }
      msg += `\n*Ejemplo:* \`${usedPrefix}rssadd kudasai\`\n`
      msg += `*URL directa:* \`${usedPrefix}rssadd https://ejemplo.com/feed/\``
      return m.reply(msg)
    }

    const input = text.trim().toLowerCase()
    const url   = PRESET_FEEDS[input] || text.trim()

    if (!/^https?:\/\/.+/.test(url))
      return m.reply(`❌ URL inválida.\nUsa un preset (${Object.keys(PRESET_FEEDS).join(', ')}) o una URL completa con https://`)

    const label = PRESET_FEEDS[input]
      ? input
      : (() => { try { return new URL(url).hostname } catch { return url } })()

    if (feeds.some(f => f.url === url))
      return m.reply(`⚠️ Este feed ya está agregado.`)

    await m.reply(`⏳ Verificando feed...`)

    let items
    try {
      items = await fetchFeed(url)
    } catch (e) {
      return m.reply(`❌ No se pudo leer el feed:\n${e.message}`)
    }

    if (!items.length)
      return m.reply(`⚠️ El feed no tiene artículos o no es RSS/Atom válido.`)

    feeds.push({
      url,
      label,
      seenGuids: items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
    })
    global.db.data.rss[chatId] = feeds
    await global.db.write()

    return m.reply(
      `✅ *Feed agregado* (${feeds.length}/${MAX_FEEDS_PER_CHAT})\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📌 *Nombre:* ${label}\n` +
      `🔗 *URL:* ${url}\n` +
      `📄 *Artículos encontrados:* ${items.length}\n\n` +
      `🔔 Recibirás notificaciones automáticas cada 10 min.`
    )
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command = /^rss(add|del|list|recientes|check)$/i
handler.tags    = ['tools']
handler.help    = [
  'rssadd <url|preset>',
  'rssdel <número>',
  'rsslist',
  'rssrecientes [número]',
  'rsscheck'
]

export default handler
          
