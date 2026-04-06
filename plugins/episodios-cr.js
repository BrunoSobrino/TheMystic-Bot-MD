/**
 * episodios-nuevos.js — Rikka-Bot v2
 * 
 * Sistema robusto de búsqueda de episodios en Crunchyroll
 * Usa JSON-LD (schema.org) + API de descubrimiento
 * 
 * Comandos:
 *   .nuevos                → Últimos episodios (en vivo)
 *   .nuevos <título>       → Buscar episodios de un anime específico
 *   .nuevoscheck           → Fuerza búsqueda ahora
 *   .nuevoscache           → Ver estado del caché
 */

import axios from 'axios'

// ─── Configuración ────────────────────────────────────────────────────────────

const CONFIG = {
  REQUEST_TIMEOUT: 30_000,
  CACHE_DURATION: 5 * 60 * 1000,  // 5 minutos
  MAX_RESULTS: 50,
  RETRY_ATTEMPTS: 2,
  RATE_LIMIT_WINDOW: 10_000,      // 10s entre requests
}

const BASE_URL = 'https://www.crunchyroll.com'
const API_ENDPOINTS = {
  browse: 'https://www.crunchyroll.com/api/v2/discover/browse',
  search: 'https://www.crunchyroll.com/api/v2/discover/search',
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Referer': BASE_URL,
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

class RateLimiter {
  constructor(windowMs = CONFIG.RATE_LIMIT_WINDOW) {
    this.requests = {}
    this.windowMs = windowMs
  }

  isAllowed(key) {
    const now = Date.now()
    if (!this.requests[key]) {
      this.requests[key] = []
    }

    // Limpiar requests antiguos
    this.requests[key] = this.requests[key].filter(
      t => now - t < this.windowMs
    )

    if (this.requests[key].length === 0) {
      this.requests[key].push(now)
      return true
    }

    return false
  }
}

const rateLimiter = new RateLimiter()

// ─── DB Helpers ────────────────────────────────────────────────────────────────

function initDB() {
  if (!global.db?.data) return
  if (!global.db.data.episodios) {
    global.db.data.episodios = {}
  }
}

function getDataOf(chatId) {
  initDB()
  if (!global.db.data.episodios[chatId]) {
    global.db.data.episodios[chatId] = {
      cache: [],
      lastSync: null,
      lastEpisodeIds: [],
      searchCache: {}, // Caché de búsquedas recientes
    }
  }
  return global.db.data.episodios[chatId]
}

async function saveData() {
  try {
    await global.db?.write?.()
  } catch (e) {
    console.error('[Episodios] Error guardando DB:', e.message)
  }
}

// ─── API Fetch con Reintentos ────────────────────────────────────────────────

async function fetchWithRetry(url, options = {}, attempts = CONFIG.RETRY_ATTEMPTS) {
  let lastError
  
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await axios.get(url, {
        timeout: CONFIG.REQUEST_TIMEOUT,
        headers: HEADERS,
        ...options,
      })
      return response.data
    } catch (e) {
      lastError = e
      console.error(`[Episodios] Intento ${i + 1}/${attempts} fallido:`, e.message)
      
      // Esperar antes de reintentar (backoff exponencial)
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
      }
    }
  }
  
  throw lastError
}

// ─── Parseo de Episodios ──────────────────────────────────────────────────────

function parseEpisode(item) {
  if (!item?.id || !item?.title) return null

  try {
    const title = String(item.title).trim()
    
    // Extraer número de episodio (múltiples formatos)
    const episodePatterns = [
      /Episode\s+(\d+)/i,
      /Episodio\s+(\d+)/i,
      /Ep\.\s*(\d+)/i,
      /^(\d+)\s*[-–]/,  // Ej: "1 - Nombre del ep"
    ]
    
    let episodeNum = null
    for (const pattern of episodePatterns) {
      const match = title.match(pattern)
      if (match) {
        episodeNum = match[1]
        break
      }
    }

    if (!episodeNum) return null

    // Extraer información
    const seriesTitle = item.series_title?.trim() || 
                       title.split(/[\-–]/)[0].trim() || 
                       'Unknown'
    
    const episodeTitle = extractEpisodeTitle(title, episodeNum)
    
    // Detectar idiomas disponibles
    const language = detectLanguage(item)
    
    // Extraer imagen (múltiples formatos posibles)
    const img = getImageUrl(item)

    return {
      id: item.id,
      seriesTitle,
      episodeNumber: `Ep. ${episodeNum}`,
      episodeTitle,
      img,
      url: `${BASE_URL}/watch/${item.id}`,
      pubDate: item.episode_air_date || item.upload_date || new Date().toISOString(),
      language,
      timestamp: Date.now(),
      // Metadata adicional
      seriesId: item.series_id,
      isDubbed: hasAudioTrack(item, 'es-mx'),
      isSubbed: hasSubtitleTrack(item, 'es-es'),
    }
  } catch (e) {
    console.error('[Episodios] Error parseando item:', e.message)
    return null
  }
}

function extractEpisodeTitle(fullTitle, episodeNum) {
  // Buscar patrón: "Episode X - Title" o "X - Title"
  const match = fullTitle.match(
    new RegExp(`(?:Episode|Episodio|Ep\\.)?\\s*${episodeNum}\\s*[-–]\\s*(.+)`, 'i')
  )
  return match ? match[1].trim() : ''
}

function getImageUrl(item) {
  // Intentar múltiples rutas de imagen
  const imagePaths = [
    () => item.images?.[0]?.[0]?.[0]?.source,
    () => item.images?.poster?.[0]?.source,
    () => item.images?.thumbnail?.[0]?.source,
    () => item.thumbnail?.source,
  ]

  for (const getPath of imagePaths) {
    const url = getPath()
    if (url && typeof url === 'string') return url
  }

  return null
}

function detectLanguage(item) {
  const subtitle_locales = (item.subtitle_locales || []).map(s => s?.toLowerCase?.() ?? '')
  const audio_locales = (item.audio_locales || []).map(s => s?.toLowerCase?.() ?? '')
  const allLangs = [...subtitle_locales, ...audio_locales].join(' ')

  // Buscar por orden de preferencia
  const langMap = [
    { pattern: /es-mx|latino/i, emoji: '🇲🇽', name: 'Español Latino' },
    { pattern: /es-es|español/i, emoji: '🇪🇸', name: 'Español' },
    { pattern: /en-us|english/i, emoji: '🇺🇸', name: 'English' },
    { pattern: /ja-jp|japanese/i, emoji: '🇯🇵', name: '日本語' },
    { pattern: /pt-br|portugues/i, emoji: '🇧🇷', name: 'Português' },
    { pattern: /fr-fr|french/i, emoji: '🇫🇷', name: 'Français' },
  ]

  for (const lang of langMap) {
    if (lang.pattern.test(allLangs)) {
      return `${lang.emoji} ${lang.name}`
    }
  }

  return '🔤 Multi'
}

function hasAudioTrack(item, locale) {
  return (item.audio_locales || []).some(a => 
    a?.toLowerCase?.()?.includes(locale.toLowerCase())
  )
}

function hasSubtitleTrack(item, locale) {
  return (item.subtitle_locales || []).some(s =>
    s?.toLowerCase?.()?.includes(locale.toLowerCase())
  )
}

// ─── Fetch Episodes ───────────────────────────────────────────────────────────

async function fetchLatestEpisodes(options = {}) {
  try {
    const params = {
      locale: options.locale || 'es-ES',
      limit: options.limit || CONFIG.MAX_RESULTS,
      sort_by: options.sortBy || 'newly_added',
      ...options.params,
    }

    const queryString = new URLSearchParams(params).toString()
    const url = `${API_ENDPOINTS.browse}?${queryString}`

    const data = await fetchWithRetry(url)

    if (!Array.isArray(data?.items)) {
      console.warn('[Episodios] API response no tiene items:', data)
      return []
    }

    // Parsear y filtrar episodios válidos
    const episodes = data.items
      .map(item => parseEpisode(item))
      .filter(ep => ep !== null)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

    return episodes
  } catch (e) {
    console.error('[Episodios] Error fetching episodes:', e.message)
    return []
  }
}

async function searchEpisodes(query) {
  try {
    const params = {
      q: query,
      locale: 'es-ES',
      limit: 30,
      type: 'series,episode',
    }

    const queryString = new URLSearchParams(params).toString()
    const url = `${API_ENDPOINTS.search}?${queryString}`

    const data = await fetchWithRetry(url)

    if (!Array.isArray(data?.items)) {
      return []
    }

    return data.items
      .map(item => parseEpisode(item))
      .filter(ep => ep !== null)
  } catch (e) {
    console.error('[Episodios] Error searching:', e.message)
    return []
  }
}

// ─── Formateo de Mensajes ─────────────────────────────────────────────────────

function formatEpisodesList(episodes, limit = 20, title = '🆕 *Últimos episodios en vivo*') {
  if (episodes.length === 0) {
    return '⚠️ No hay episodios disponibles.'
  }

  let msg = `${title}\n`
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`

  episodes.slice(0, limit).forEach((ep, i) => {
    const badges = []
    if (ep.isDubbed) badges.push('🔊')
    if (ep.isSubbed) badges.push('📝')
    const badgeStr = badges.length > 0 ? ` ${badges.join('')}` : ''

    msg += `*${i + 1}.* 📺 *${ep.seriesTitle}*\n`
    msg += `   🎬 ${ep.episodeNumber}`
    if (ep.episodeTitle) msg += ` - _${ep.episodeTitle}_`
    msg += `\n`
    msg += `   ${ep.language}${badgeStr}\n`
    
    if (i < limit - 1) msg += `\n`
  })

  msg += `\n━━━━━━━━━━━━━━━━━━━`
  msg += `\n📊 Mostrando ${Math.min(limit, episodes.length)} de ${episodes.length}`

  return msg
}

function formatCacheStatus(data) {
  const cacheAge = data.lastSync 
    ? Math.round((Date.now() - new Date(data.lastSync).getTime()) / 1000)
    : null

  let msg = `*📊 Estado del caché*\n`
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`
  msg += `📚 Episodios en caché: *${data.cache.length}*\n`
  msg += `⏰ Última sincronización: `
  
  if (cacheAge !== null) {
    if (cacheAge < 60) {
      msg += `hace ${cacheAge}s`
    } else if (cacheAge < 3600) {
      msg += `hace ${Math.round(cacheAge / 60)}m`
    } else {
      msg += `hace ${Math.round(cacheAge / 3600)}h`
    }
  } else {
    msg += `nunca`
  }
  
  msg += `\n🔍 Búsquedas en caché: *${Object.keys(data.searchCache).length}*`

  return msg
}

// ─── Manejador Principal ───────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat
  const data = getDataOf(chatId)

  try {
    // ── .nuevos ────────────────────────────────────────────────────────────────
    if (command === 'nuevos') {
      const searchTerm = text?.trim().toLowerCase()

      // Si hay término de búsqueda
      if (searchTerm) {
        // Buscar en caché primero
        if (data.searchCache[searchTerm]) {
          const cached = data.searchCache[searchTerm]
          if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            const msg = formatEpisodesList(
              cached.episodes, 
              15, 
              `🔍 *Resultados para "${text.trim()}"*`
            )
            return m.reply(msg)
          }
        }

        // Rate limiting
        if (!rateLimiter.isAllowed(`search:${chatId}`)) {
          return m.reply('⏳ Espera un poco antes de otra búsqueda...')
        }

        await m.reply(`⏳ Buscando "${text.trim()}"...`)
        const results = await searchEpisodes(searchTerm)

        if (results.length === 0) {
          return m.reply(`⚠️ No encontré "${text.trim()}" en Crunchyroll.`)
        }

        // Guardar en caché de búsquedas
        data.searchCache[searchTerm] = {
          episodes: results,
          timestamp: Date.now(),
        }
        await saveData()

        const msg = formatEpisodesList(results, 15, `🔍 *Resultados para "${text.trim()}"*`)
        return m.reply(msg)
      }

      // Sin término de búsqueda: mostrar últimos episodios
      let episodes = data.cache

      // Necesita actualizar?
      if (
        episodes.length === 0 ||
        !data.lastSync ||
        Date.now() - new Date(data.lastSync).getTime() > CONFIG.CACHE_DURATION
      ) {
        // Rate limiting
        if (!rateLimiter.isAllowed(`fetch:${chatId}`)) {
          if (episodes.length > 0) {
            const msg = formatEpisodesList(episodes, 20)
            return m.reply(msg + '\n\n_⏳ Caché usada (recarga en proceso)_')
          }
          return m.reply('⏳ Espera un poco antes de otra búsqueda...')
        }

        await m.reply(`⏳ Buscando episodios nuevos...`)
        episodes = await fetchLatestEpisodes()

        if (episodes.length === 0) {
          if (data.cache.length > 0) {
            const msg = formatEpisodesList(data.cache, 20)
            return m.reply(msg + '\n\n⚠️ _Usando caché anterior (API sin respuesta)_')
          }
          return m.reply(`❌ No se encontraron episodios. Intenta más tarde.`)
        }

        data.cache = episodes
        data.lastSync = new Date().toISOString()
        data.lastEpisodeIds = episodes.map(e => e.id)
        await saveData()
      }

      const msg = formatEpisodesList(episodes, 20)
      return m.reply(msg)
    }

    // ── .nuevoscheck ───────────────────────────────────────────────────────────
    if (command === 'nuevoscheck') {
      // Rate limiting
      if (!rateLimiter.isAllowed(`check:${chatId}`)) {
        return m.reply('⏳ Espera un poco antes de forzar otra sincronización...')
      }

      await m.reply(`🔄 Sincronizando episodios...`)
      const episodes = await fetchLatestEpisodes()

      if (episodes.length === 0) {
        return m.reply(`❌ No se encontraron episodios. El servidor de Crunchyroll podría estar caído.`)
      }

      data.cache = episodes
      data.lastSync = new Date().toISOString()
      data.lastEpisodeIds = episodes.map(e => e.id)
      await saveData()

      return m.reply(
        `✅ *Sincronizado exitosamente*\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📊 ${episodes.length} episodios encontrados\n` +
        `⏰ ${new Date().toLocaleTimeString('es-MX')}`
      )
    }

    // ── .nuevoscache ───────────────────────────────────────────────────────────
    if (command === 'nuevoscache') {
      const msg = formatCacheStatus(data)
      return m.reply(msg)
    }

  } catch (e) {
    console.error('[Episodios] Handler error:', e)
    m.reply(
      `❌ *Error*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${e.message || 'Error desconocido'}\n\n` +
      `_Si el problema persiste, intenta más tarde._`
    )
  }
}

// ─── Exports ───────────────────────────────────────────────────────────────────

handler.command = ['nuevos', 'nuevoscheck', 'nuevoscache']
handler.tags = ['anime']
handler.help = [
  'nuevos',
  'nuevos <título>',
  'nuevoscheck',
  'nuevoscache',
]
handler.rateLimit = true

export default handler
                                                    
