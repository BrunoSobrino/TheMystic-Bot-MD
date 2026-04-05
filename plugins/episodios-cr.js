/**
 * episodios-cr.js — Rikka-Bot
 * 
 * Busca episodios nuevos del calendario de Crunchyroll
 * Usa Playwright para renderizar JavaScript
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
const CACHE_DURATION = 12 * 60 * 1000  // 12 minutos
const POLL_INTERVAL_MS = 20 * 60 * 1000  // 20 minutos

const BASE_URL = 'https://www.crunchyroll.com'
const CALENDAR_URL = `${BASE_URL}/es/simulcastcalendar?filter=premium`

// URLs alternas para fallback
const FALLBACK_URLS = [
  `${BASE_URL}/es/simulcastcalendar`,
  `${BASE_URL}/en/simulcastcalendar`,
]

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
      watched: []
    }
  }
  return global.db.data.cr[chatId]
}

// ─── Fetch Episodes ────────────────────────────────────────────────────────────

async function fetchCalendarEpisodes () {
  try {
    console.log('[CR] Iniciando búsqueda...')
    
    // Intenta con la URL premium primero
    let episodes = await scrapeURL(CALENDAR_URL)
    
    // Si no encuentra, intenta fallback
    if (episodes.length < 5) {
      console.log('[CR] Intentando URLs alternas...')
      for (const url of FALLBACK_URLS) {
        episodes = await scrapeURL(url)
        if (episodes.length >= 5) break
      }
    }

    // Último recurso: intenta la API REST
    if (episodes.length < 3) {
      console.log('[CR] Intentando API REST...')
      episodes = await fetchViaAPI()
    }

    console.log(`[CR] ✅ ${episodes.length} episodios encontrados`)
    return episodes
  } catch (e) {
    console.error('[CR] Error general:', e.message)
    return []
  }
}

async function scrapeURL (url) {
  try {
    console.log(`[CR] Scrapeando: ${url}`)
    
    const { data } = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    })

    const $ = cheerio.load(data)
    const episodes = []
    const seenIds = new Set()

    // Buscar patrones de episodios en el HTML
    // Patrón 1: Buscar por links /watch/ con contexto
    $('a[href*="/watch/"]').each((_, el) => {
      const $el = $(el)
      const href = $el.attr('href')
      
      // Obtener contexto (padre cercano)
      const $context = $el.closest('[class*="card"], [class*="episode"], article, li, div[class*="item"]')
      const fullText = $context.text().trim()

      if (!href || !fullText || fullText.length < 5) return

      const id = href.match(/\/watch\/([A-Z0-9]+)/)?.[1]
      if (!id || seenIds.has(id)) return
      seenIds.add(id)

      // Extraer información
      const epMatch = fullText.match(/Episode\s+(\d+)|Episodio\s+(\d+)|Ep\.?\s*(\d+)/i)
      if (!epMatch) return

      const epNum = epMatch[1] || epMatch[2] || epMatch[3]
      const seriesMatch = fullText.match(/^([^\n]+)/)?.[1]?.trim() || ''
      const titleMatch = fullText.match(/Episode\s+\d+\s*[-–]\s*([^\n]+)/i)?.[1]?.trim() || ''

      if (!seriesMatch) return

      const img = $context.find('img').first().attr('src') || $context.find('img').first().attr('data-src')
      const url = href.startsWith('http') ? href : `${BASE_URL}${href}`

      episodes.push({
        id: id,
        seriesTitle: seriesMatch.replace(/Episode.+$|Episodio.+$/i, '').trim(),
        episodeNumber: `Episode ${epNum}`,
        episodeTitle: titleMatch,
        language: detectLanguage(fullText),
        img: img || null,
        url: url,
        timestamp: Date.now()
      })
    })

    return episodes
  } catch (e) {
    console.error(`[CR] Error scrapeando ${url}:`, e.message)
    return []
  }
}

async function fetchViaAPI () {
  try {
    console.log('[CR] Usando API REST...')
    
    const { data } = await axios.get(
      `${BASE_URL}/api/v2/discover/browse?locale=es-ES&limit=50&sort_by=newly_added`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }
    )

    const episodes = []

    if (data?.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        if (!item.title || !item.id) return

        const epMatch = item.title.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i)
        if (!epMatch) return

        episodes.push({
          id: item.id,
          seriesTitle: item.series_title || item.title.split(' - ')[0],
          episodeNumber: `Episode ${epMatch[1] || epMatch[2]}`,
          episodeTitle: item.title.includes(' - ') ? item.title.split(' - ').slice(1).join(' - ') : '',
          language: detectLanguageFromItem(item),
          img: item.images?.[0]?.[0]?.[0]?.source || null,
          url: `${BASE_URL}/watch/${item.id}`,
          timestamp: Date.now()
        })
      })
    }

    console.log(`[CR] API: ${episodes.length} episodios`)
    return episodes
  } catch (e) {
    console.error('[CR] Error API:', e.message)
    return []
  }
}

function detectLanguage (text = '') {
  const lower = text.toLowerCase()
  if (lower.includes('latino') || lower.includes('américa latina') || lower.includes('latin')) return '🇲🇽 Latino'
  if (lower.includes('españa') || lower.includes('castellano')) return '🇪🇸 Español'
  if (lower.includes('english') || lower.includes('inglés') || lower.includes('en-us')) return '🇺🇸 English'
  if (lower.includes('português') || lower.includes('brasil')) return '🇧🇷 Português'
  if (lower.includes('français')) return '🇫🇷 Français'
  if (lower.includes('deutsch') || lower.includes('german')) return '🇩🇪 Deutsch'
  if (lower.includes('русский')) return '🇷🇺 Русский'
  if (lower.includes('日本語') || lower.includes('japanese')) return '🇯🇵 日本語'
  if (lower.includes('italiano')) return '🇮🇹 Italiano'
  if (lower.includes('한국')) return '🇰🇷 한국어'
  return '🔤'
}

function detectLanguageFromItem (item) {
  const subs = (item.subtitle_locales || []).join('|').toLowerCase()
  const audio = (item.audio_locales || []).join('|').toLowerCase()
  const all = (subs + '|' + audio).toLowerCase()
  return detectLanguage(all)
}

function formatList (episodes, limit = 25) {
  if (episodes.length === 0) return '⚠️ Sin episodios disponibles.'

  let msg = `🆕 *Episodios CR*\n━━━━━━━━━━━━━━━━\n\n`

  episodes.slice(0, limit).forEach((ep, i) => {
    msg += `*${i + 1}.* ${ep.seriesTitle}\n`
    msg += `   🎬 ${ep.episodeNumber}`
    if (ep.episodeTitle) msg += ` - ${ep.episodeTitle}`
    msg += `\n   ${ep.language}\n\n`
  })

  return msg
}

// ─── Comandos ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat
  const data = dataOf(chatId)

  try {
    if (command === 'cr') {
      let episodes = data.cache || []

      if (text?.trim()) {
        const search = text.trim().toLowerCase()
        episodes = episodes.filter(ep => 
          ep.seriesTitle.toLowerCase().includes(search)
        )

        if (episodes.length === 0) {
          await m.reply(`⏳ Buscando "${text.trim()}"...`)
          let all = await fetchCalendarEpisodes()
          all = all.filter(ep => ep.seriesTitle.toLowerCase().includes(search))
          
          if (all.length === 0) {
            return m.reply(`⚠️ No encontré "${text.trim()}"`)
          }
          return m.reply(formatList(all, 15))
        }
      }

      if (episodes.length === 0 || !data.lastSync || Date.now() - new Date(data.lastSync).getTime() > CACHE_DURATION) {
        await m.reply(`⏳ Cargando episodios CR...`)
        episodes = await fetchCalendarEpisodes()
        
        if (episodes.length === 0) {
          return m.reply(`❌ No se encontraron episodios. Intenta más tarde.`)
        }
        
        data.cache = episodes
        data.lastSync = new Date().toISOString()
        data.lastEpisodeIds = episodes.map(e => e.id)
        await global.db.write()
      }

      return m.reply(formatList(episodes, 25))
    }

    if (command === 'crhoy') {
      let episodes = data.cache || []
      if (episodes.length === 0) {
        await m.reply(`⏳ Cargando...`)
        episodes = await fetchCalendarEpisodes()
        data.cache = episodes
        data.lastSync = new Date().toISOString()
        await global.db.write()
      }

      if (episodes.length === 0) return m.reply('⚠️ Sin episodios')

      const hoy = episodes.slice(0, 12)
      let msg = `📺 *Hoy en CR*\n━━━━━━━━━━━━\n\n`
      hoy.forEach((ep, i) => {
        msg += `*${i + 1}.* ${ep.seriesTitle}\n   ${ep.episodeNumber} ${ep.language}\n\n`
      })
      return m.reply(msg)
    }

    if (command === 'crsemanal') {
      let episodes = data.cache || []
      if (episodes.length === 0) {
        await m.reply(`⏳ Cargando...`)
        episodes = await fetchCalendarEpisodes()
        data.cache = episodes
        data.lastSync = new Date().toISOString()
        await global.db.write()
      }

      return m.reply(formatList(episodes, 35))
    }

    if (command === 'crsync') {
      await m.reply(`🔄 Sincronizando CR...`)
      const episodes = await fetchCalendarEpisodes()
      
      if (episodes.length === 0) {
        return m.reply(`❌ Error: No se encontraron episodios.`)
      }
      
      data.cache = episodes
      data.lastSync = new Date().toISOString()
      data.lastEpisodeIds = episodes.map(e => e.id)
      await global.db.write()
      
      return m.reply(`✅ OK\n📊 ${episodes.length} episodios\n⏰ ${new Date().toLocaleTimeString('es-MX')}`)
    }

  } catch (e) {
    console.error('[CR] Error handler:', e.message)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['cr', 'crhoy', 'crsemanal', 'crsync']
handler.tags = ['anime']
handler.help = ['cr', 'cr <título>', 'crhoy', 'crsemanal', 'crsync']

export default handler
