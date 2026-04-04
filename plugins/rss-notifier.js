/**
 * rss-notifier.js
 * Notificador RSS para KanaArima-MD
 *
 * Comandos (solo en grupos, requiere ser admin/owner del bot):
 *   .rssadd <url>       → Suscribe este chat al feed RSS
 *   .rssdel <número>    → Elimina una suscripción por su número en la lista
 *   .rsslist            → Lista los feeds activos en este chat
 *   .rsscheck           → Fuerza una verificación inmediata en este chat
 *
 * La primera vez no notifica los artículos ya existentes (los marca como vistos).
 * A partir de ahí, notifica solo los nuevos.
 *
 * Feed por defecto incluido: somoskudasai.com
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 10 * 60 * 1000  // revisar cada 10 minutos
const MAX_SEEN_GUIDS   = 50              // cuántos GUIDs recordar por feed
const REQUEST_TIMEOUT  = 15_000          // timeout HTTP en ms

// Feeds precargados (se añaden a cualquier chat que use .rssadd kudasai)
const PRESET_FEEDS = {
  kudasai: 'https://somoskudasai.com/feed/'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Inicializa la clave rss en la base de datos si no existe */
function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.rss) {
    global.db.data.rss = {}  // { [chatId]: [ { url, label, seenGuids: [] } ] }
  }
}

/** Devuelve los feeds de un chat (array mutable) */
function feedsOf (chatId) {
  initDB()
  if (!global.db.data.rss[chatId]) global.db.data.rss[chatId] = []
  return global.db.data.rss[chatId]
}

/** Obtiene y parsea un feed RSS/Atom. Devuelve array de items */
async function fetchFeed (url) {
  const { data } = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: { 'User-Agent': 'KanaArima-MD RSS Bot/1.0' }
  })

  const $ = cheerio.load(data, { xmlMode: true })
  const items = []

  // ── RSS 2.0 ──────────────────────────────────────────────────────────────
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

  // ── Atom ──────────────────────────────────────────────────────────────────
  if (!items.length) {
    $('entry').each((_, el) => {
      const title   = $(el).find('title').first().text().trim()
      const link    = $(el).find('link[rel="alternate"]').attr('href')
                   || $(el).find('link').first().attr('href') || ''
      const guid    = $(el).find('id').first().text().trim() || link
      const pubDate = $(el).find('published,updated').first().text().trim()
      const desc    = $(el).find('summary,content').first().text().trim()
      const img     = extractFirstImgSrc($(el).find('content').first().text())

      if (title && guid) items.push({ title, link, guid, pubDate, img })
    })
  }

  return items
}

/** Extrae el src del primer <img> en un string HTML */
function extractFirstImgSrc (html = '') {
  const m = html.match(/<img[^>]+src=["']([^"'>]+)["']/i)
  return m ? m[1] : null
}

/** Construye el texto de notificación */
function buildNotifText (item, label) {
  let text = `📰 *${label}*\n`
  text += `━━━━━━━━━━━━━━━━\n`
  text += `🎌 *${item.title}*\n`
  if (item.pubDate) {
    const d = new Date(item.pubDate)
    if (!isNaN(d)) {
      text += `🕐 ${d.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })}\n`
    }
  }
  text += `\n🔗 ${item.link}`
  return text
}

// ─── Poller principal ─────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkAllFeeds (conn) {
  if (!global.db?.data?.rss) return

  for (const [chatId, feeds] of Object.entries(global.db.data.rss)) {
    if (!feeds?.length) continue

    for (const feed of feeds) {
      try {
        const items = await fetchFeed(feed.url)
        if (!items.length) continue

        // Primera vez: marcar todo como visto sin notificar
        if (!feed.seenGuids) {
          feed.seenGuids = items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
          continue
        }

        // Filtrar solo los nuevos (los que no están en seenGuids)
        const newItems = items.filter(i => !feed.seenGuids.includes(i.guid))

        // Notificar de más antiguo a más reciente
        for (const item of newItems.reverse()) {
          const text = buildNotifText(item, feed.label || 'RSS')
          try {
            if (item.img) {
              await conn.sendMessage(chatId, {
                image: { url: item.img },
                caption: text
              })
            } else {
              await conn.sendMessage(chatId, { text })
            }
          } catch (sendErr) {
            console.error(`[RSS] Error enviando a ${chatId}:`, sendErr.message)
          }
          // Pequeña pausa entre mensajes para no spamear
          await new Promise(r => setTimeout(r, 1500))
        }

        // Actualizar GUIDs vistos
        const allGuids = [...newItems.map(i => i.guid), ...feed.seenGuids]
        feed.seenGuids = allGuids.slice(0, MAX_SEEN_GUIDS)

      } catch (err) {
        console.error(`[RSS] Error en feed "${feed.url}":`, err.message)
      }
    }
  }

  // Guardar cambios en DB
  if (global.db?.data) global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[RSS] Poller iniciado — intervalo:', POLL_INTERVAL_MS / 60000, 'min')

  // Primera ejecución después de 30 s para que el bot termine de conectar
  setTimeout(() => checkAllFeeds(conn), 30_000)
  setInterval(() => checkAllFeeds(conn), POLL_INTERVAL_MS)
}

// ─── Handler de comandos ──────────────────────────────────────────────────────

/** Verifica si puede gestionar feeds (owner del bot o admin del grupo) */
async function canManage (m, conn) {
  const ownerNums = (Array.isArray(global.owner) ? global.owner : [])
    .map(n => (n + '').replace(/\D/g, '') + '@s.whatsapp.net')
  if (ownerNums.includes(m.sender)) return true
  try {
    const meta = await conn.groupMetadata(m.chat)
    const p = meta.participants.find(p => p.id === m.sender)
    return p?.admin === 'admin' || p?.admin === 'superadmin'
  } catch { return false }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat
  const feeds  = feedsOf(chatId)

  // ── .rssultimo [número] ───────────────────────────────────────────────────
  if (/^rssultimo$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds en este chat. Usa *${usedPrefix}rssadd* para agregar uno.`)

    // Si hay varios feeds, el usuario puede indicar cuál: .rssultimo 2
    const idx = parseInt(text?.trim()) - 1
    const feed = (!isNaN(idx) && idx >= 0 && idx < feeds.length)
      ? feeds[idx]
      : feeds[0]  // por defecto el primero

    await m.reply(`⏳ Obteniendo último artículo de *${feed.label || feed.url}*...`)

    let items
    try {
      items = await fetchFeed(feed.url)
    } catch (e) {
      return m.reply(`❌ No se pudo leer el feed:\n\`${e.message}\``)
    }

    if (!items.length) return m.reply(`⚠️ El feed no tiene artículos.`)

    const item = items[0]  // el más reciente
    const text_ = buildNotifText(item, feed.label || 'RSS')

    if (item.img) {
      await conn.sendMessage(chatId, { image: { url: item.img }, caption: text_ }, { quoted: m })
    } else {
      await conn.sendMessage(chatId, { text: text_ }, { quoted: m })
    }

    // Si hay más de un feed, mostrar menú de selección
    if (feeds.length > 1 && !text?.trim()) {
      let hint = `\n💡 Tienes ${feeds.length} feeds. Usa *${usedPrefix}rssultimo <número>* para ver otro:\n`
      feeds.forEach((f, i) => { hint += `  *${i + 1}.* ${f.label || f.url}\n` })
      await conn.sendMessage(chatId, { text: hint.trim() })
    }
    return
  }

  // ── .rsslist ──────────────────────────────────────────────────────────────
  if (/^rsslist$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds RSS en este chat.\nUsa *${usedPrefix}rssadd <url>* para agregar uno.`)

    let msg = `📋 *Feeds RSS activos en este chat*\n━━━━━━━━━━━━━━━━\n`
    feeds.forEach((f, i) => {
      msg += `*${i + 1}.* ${f.label || 'Sin nombre'}\n`
      msg += `   🔗 ${f.url}\n`
    })
    msg += `\nUsa *${usedPrefix}rssdel <número>* para eliminar uno.`
    return m.reply(msg)
  }

  // ── .rsscheck ─────────────────────────────────────────────────────────────
  if (/^rsscheck$/i.test(command)) {
    if (!feeds.length) return m.reply(`❌ No hay feeds en este chat.`)
    await m.reply(`🔄 Verificando feeds...`)
    await checkAllFeeds(conn)
    return m.reply(`✅ Verificación completada.`)
  }

  // ── .rssdel <n> ───────────────────────────────────────────────────────────
  if (/^rssdel$/i.test(command)) {
    if (!await canManage(m, conn)) return m.reply(`⛔ Solo el dueño del bot o administradores del grupo pueden eliminar feeds.`)
    const n = parseInt(text?.trim())
    if (isNaN(n) || n < 1 || n > feeds.length)
      return m.reply(`⚠️ Número inválido. Usa *${usedPrefix}rsslist* para ver los feeds.`)
    const removed = feeds.splice(n - 1, 1)
    global.db.data.rss[chatId] = feeds
    await global.db.write()
    return m.reply(`🗑️ Feed eliminado: *${removed[0].label || removed[0].url}*`)
  }

  // ── .rssadd <url|preset> ──────────────────────────────────────────────────
  if (/^rssadd$/i.test(command)) {
    if (!await canManage(m, conn)) return m.reply(`⛔ Solo el dueño del bot o administradores del grupo pueden agregar feeds.`)
    if (!text?.trim()) {
      let msg = `⚠️ Debes indicar una URL o un preset.\n\n`
      msg += `*Presets disponibles:*\n`
      for (const [key, url] of Object.entries(PRESET_FEEDS)) {
        msg += `  • \`${usedPrefix}rssadd ${key}\` → ${url}\n`
      }
      msg += `\nO una URL directa: \`${usedPrefix}rssadd https://ejemplo.com/feed/\``
      return m.reply(msg)
    }

    // Resolver preset o URL directa
    const input = text.trim().toLowerCase()
    const url = PRESET_FEEDS[input] || text.trim()
    const label = PRESET_FEEDS[input]
      ? Object.keys(PRESET_FEEDS).find(k => PRESET_FEEDS[k] === PRESET_FEEDS[input]) || input
      : new URL(url).hostname

    // Validar URL
    if (!/^https?:\/\/.+/.test(url)) return m.reply(`❌ URL inválida.`)

    // Verificar duplicado
    if (feeds.some(f => f.url === url)) return m.reply(`⚠️ Este feed ya está agregado.`)

    // Probar que el feed responde
    await m.reply(`⏳ Verificando feed...`)
    let items
    try {
      items = await fetchFeed(url)
    } catch (e) {
      return m.reply(`❌ No se pudo leer el feed:\n\`${e.message}\``)
    }
    if (!items.length) return m.reply(`⚠️ El feed no tiene artículos o no es RSS/Atom válido.`)

    // Guardar con GUIDs ya vistos (no notificar artículos históricos)
    feeds.push({
      url,
      label,
      seenGuids: items.map(i => i.guid).slice(0, MAX_SEEN_GUIDS)
    })
    global.db.data.rss[chatId] = feeds
    await global.db.write()

    return m.reply(
      `✅ Feed agregado: *${label}*\n` +
      `🔗 ${url}\n` +
      `📄 ${items.length} artículos encontrados (ya marcados como vistos).\n\n` +
      `🔔 Recibirás notificaciones de nuevos artículos.`
    )
  }
}

// Arrancar el poller la primera vez que llegue cualquier mensaje
handler.all = async function (m) {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command  = /^rss(add|del|list|check|ultimo)$/i
handler.tags     = ['tools']
handler.help     = ['rssadd <url|preset>', 'rssdel <número>', 'rsslist', 'rsscheck', 'rssultimo [número]']

export default handler
          
