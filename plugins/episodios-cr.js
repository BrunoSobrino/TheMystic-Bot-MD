/**
 * episodios-cr.js — Rikka-Bot
 * 
 * Busca episodios nuevos del calendario Premium de Crunchyroll
 * URL: https://www.crunchyroll.com/es/simulcastcalendar?filter=premium
 * 
 * Comandos:
 *   .cr                     → Últimos episodios
 *   .cr <título>            → Buscar anime específico
 *   .crhoy                  → Episodios de hoy
 *   .crsemanal              → Episodios de esta semana
 *   .crsync                 → Fuerza actualización
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT = 30_000
const CACHE_DURATION = 8 * 60 * 1000  // 8 minutos
const POLL_INTERVAL_MS = 12 * 60 * 1000  // 12 minutos

const BASE_URL = 'https://www.crunchyroll.com'
const CALENDAR_URL = `${BASE_URL}/es/simulcastcalendar?filter=premium`

// ─── DB Helpers ────────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.cr) global.db.data.cr = {}
}

function dataOf (chatId) {
  initDB()
  if (!global.db.data.cr[chatId]) {
    global.db.data.cr[chatId] = {
      cache: [],
      lastSync: null,
      lastEpisodeIds: [],
      watched: []  // Para notificaciones
    }
  }
  return global.db.data.cr[chatId]
}

// ─── Scraper del Calendario Premium ────────────────────────────────────────────

async function fetchPremiumCalendar () {
  try {
    const { data } = await axios.get(CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Cache-Control': 'no-cache'
      }
    })

    const $ = cheerio.load(data)
    const episodes = []
    const seenIds = new Set()

    // Estrategia 1: Buscar en links /watch/
    $('a[href*="/watch/"]').each((_, link) => {
      const $link = $(link)
      const href = $link.attr('href')
      const fullText = $link.text().trim()
      
      if (!href || !fullText || fullText.length < 5) return

      const id = href.match(/\/watch\/([A-Z0-9]+)/)?.[1]
      if (!id || seenIds.has(id)) return
      seenIds.add(id)

      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l)
      
      if (lines.length < 2) return

      const seriesTitle = lines[0]
      const seasonOrEpisode = lines[1]
      const episodeLine = lines[2] || ''

      // Detectar si tiene información de episodio
      const epMatch = seasonOrEpisode.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i) ||
                     episodeLine.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i)

      if (!epMatch) return

      const episodeNum = epMatch[1] || epMatch[2]
      const language = detectLanguage(fullText)
      const img = $link.find('img').first().attr('src') || $link.find('img').first().attr('data-src')

      const url = href.startsWith('http') ? href : `${BASE_URL}${href}`

      episodes.push({
        id: id,
        seriesTitle: seriesTitle.trim(),
        episodeNumber: `Episode ${episodeNum}`,
        episodeTitle: episodeLine.replace(/Episode\s+\d+\s*[-–]\s*/i, '').trim(),
        language: language,
        img: img || null,
        url: url,
        timestamp: Date.now(),
        dateFound: formatDate(new Date())
      })
    })

    // Estrategia 2: Si no encuentra muchos, buscar en atributos data
    if (episodes.length < 5) {
      $('[class*="episode"], [data-episode], [class*="card"]').each((_, el) => {
        const $el = $(el)
        const link = $el.find('a[href*="/watch/"]').attr('href')
        const text = $el.text().trim()
        const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src')

        if (link && text && text.length > 5) {
          const id = link.match(/\/watch\/([A-Z0-9]+)/)?.[1]
          if (!id || seenIds.has(id)) return
          seenIds.add(id)

          const seriesMatch = text.match(/^([^\n]+)/)?.[1]?.trim()
          const epMatch = text.match(/Episode\s+(\d+)|Episodio\s+(\d+)/)
          
          if (seriesMatch && epMatch) {
            episodes.push({
              id: id,
              seriesTitle: seriesMatch,
              episodeNumber: `Episode ${epMatch[1] || epMatch[2]}`,
              episodeTitle: text.split('\n')[2]?.trim() || '',
              language: detectLanguage(text),
              img: img || null,
              url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
              timestamp: Date.now(),
              dateFound: formatDate(new Date())
            })
          }
        }
      })
    }

    console.log(`[CR] ${episodes.length} episodios encontrados`)
    return episodes
  } catch (e) {
    console.error('[CR] Error fetching:', e.message)
    return []
  }
}

function detectLanguage (text = '') {
  if (/latino|américa/i.test(text)) return '🇲🇽 Español Latino'
  if (/castellano|españa/i.test(text)) return '🇪🇸 Español Castellano'
  if (/english|inglés/i.test(text)) return '🇺🇸 English'
  if (/subtitulado|sub/i.test(text)) return '📝 Subtitulado'
  if (/日本語/i.test(text)) return '🇯🇵 日本語'
  return '🔤 Multi'
}

function formatDate (date) {
  return date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatEpisodesList (episodes, limit = 25) {
  if (episodes.length === 0) return '⚠️ No hay episodios disponibles.'

  let msg = `⭐ *Episodios CR - Disponibles Ahora*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`

  episodes.slice(0, limit).forEach((ep, i) => {
    msg += `*${i + 1}.* 📺 *${ep.seriesTitle}*\n`
    msg += `   🎬 ${ep.episodeNumber}`
    if (ep.episodeTitle) msg += ` - ${ep.episodeTitle}`
    msg += `\n`
    msg += `   ${ep.language}\n`
    if (i < limit - 1) msg += `\n`
  })

  return msg
}

// ─── Poller para notificaciones ────────────────────────────────────────────────

let _pollerStarted = false

async function checkNewCREpisodes (conn) {
  if (!global.db?.data?.cr) return

  const episodes = await fetchPremiumCalendar()
  if (episodes.length === 0) return

  for (const [chatId, data] of Object.entries(global.db.data.cr)) {
    if (!data.watched?.length) continue

    const newIds = episodes.map(e => e.id)
    const oldIds = data.lastEpisodeIds || []
    const newEps = newIds.filter(id => !oldIds.includes(id))

    for (const watch of data.watched) {
      for (const ep of episodes) {
        const match = ep.seriesTitle.toLowerCase().includes(watch.title.toLowerCase())

        if (match && newEps.includes(ep.id)) {
          try {
            let text = `⭐ *${ep.seriesTitle}*\n`
            text += `━━━━━━━━━━━━━━━━\n`
            text += `🎬 ${ep.episodeNumber}`
            if (ep.episodeTitle) text += ` - ${ep.episodeTitle}`
            text += `\n${ep.language}\n`
            text += `✨ PREMIUM - Disponible ahora`
            if (ep.url) text += `\n🔗 ${ep.url}`

            if (ep.img) {
              await conn.sendMessage(chatId, { image: { url: ep.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
            
            watch.lastNotified = ep.episodeNumber
            await new Promise(r => setTimeout(r, 1000))
          } catch (e) {
            console.error(`[CR] Error enviando:`, e.message)
          }
        }
      }
    }

    data.lastEpisodeIds = newIds.slice(0, 100)
  }

  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[CR] Poller iniciado')
  setTimeout(() => checkNewCREpisodes(conn), 60_000)
  setInterval(() => checkNewCRElements(conn), POLL_INTERVAL_MS)
}

// ─── Comandos ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const data = dataOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  try {
    // ── .cr ────────────────────────────────────────────────────────────────────
    if (command === 'cr') {
      let episodes = data.cache || []

      // Búsqueda específica
      if (text?.trim()) {
        const searchTerm = text.trim().toLowerCase()
        episodes = episodes.filter(ep => 
          ep.seriesTitle.toLowerCase().includes(searchTerm)
        )

        if (episodes.length === 0) {
          await m.reply(`⏳ Buscando "${text.trim()}"...`)
          let allEps = await fetchPremiumCalendar()
          allEps = allEps.filter(ep =>
            ep.seriesTitle.toLowerCase().includes(searchTerm)
          )
          
          if (allEps.length === 0) {
            return m.reply(`⚠️ No encontré "${text.trim()}" en CR.`)
          }
          
          const msg = formatEpisodesList(allEps, 20)
          return m.reply(msg)
        }
      }

      // Actualizar caché si está viejo
      if (episodes.length === 0 || !data.lastSync || Date.now() - new Date(data.lastSync).getTime() > CACHE_DURATION) {
        await m.reply(`⏳ Cargando episodios CR...`)
        episodes = await fetchPremiumCalendar()
        
        if (episodes.length === 0) {
          return m.reply(`❌ No se encontraron episodios CR.`)
        }
        
        data.cache = episodes
        data.lastSync = new Date().toISOString()
        data.lastEpisodeIds = episodes.map(e => e.id)
        await global.db.write()
      }

      const msg = formatEpisodesList(episodes, 25)
      return m.reply(msg)
    }

    // ── .crhoy ─────────────────────────────────────────────────────────────────
    if (command === 'crhoy') {
      let episodes = data.cache || []
      if (episodes.length === 0) {
        await m.reply(`⏳ Cargando...`)
        episodes = await fetchPremiumCalendar()
        data.cache = episodes
      }

      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
      
      // Filtrar por hoy (aproximado)
      let todayEps = episodes.filter(ep => ep.dateFound.toLowerCase().includes(today.split(' ')[0]))
      if (todayEps.length === 0) todayEps = episodes.slice(0, 10)

      let msg = `📺 *Hoy en CR*\n━━━━━━━━━━━━\n\n`
      todayEps.forEach((ep, i) => {
        msg += `*${i + 1}.* ${ep.seriesTitle}\n   ${ep.episodeNumber}\n   ${ep.language}\n\n`
      })
      return m.reply(msg)
    }

    // ── .crsemanal ──────────────────────────────────────────────────────────────
    if (command === 'crsemanal') {
      let episodes = data.cache || []
      if (episodes.length === 0) {
        await m.reply(`⏳ Cargando...`)
        episodes = await fetchPremiumCalendar()
        data.cache = episodes
      }

      const msg = formatEpisodesList(episodes, 35)
      return m.reply(msg)
    }

    // ── .crsync ────────────────────────────────────────────────────────────────
    if (command === 'crsync') {
      await m.reply(`🔄 Sincronizando CR...`)
      const episodes = await fetchPremiumCalendar()
      
      if (episodes.length === 0) {
        return m.reply(`❌ No se encontraron episodios.`)
      }
      
      data.cache = episodes
      data.lastSync = new Date().toISOString()
      data.lastEpisodeIds = episodes.map(e => e.id)
      await global.db.write()
      
      return m.reply(
        `✅ Sincronizado\n` +
        `⭐ ${episodes.length} episodios CR encontrados`
      )
    }

  } catch (e) {
    console.error('[CR] Handler error:', e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) {
    startPoller(global.conn)
  }
}

handler.command = ['cr', 'crhoy', 'crsemanal', 'crsync']
handler.tags = ['anime']
handler.help = [
  'cr',
  'cr <título>',
  'crhoy',
  'crsemanal',
  'crsync'
]

export default handler
