/**
 * episodios-nuevos.js — Rikka-Bot
 * 
 * Busca episodios nuevos actualizados en tiempo real
 * Sin RSS (ya que Crunchyroll no tiene RSS actualizado de episodios)
 * 
 * Comandos:
 *   .nuevos                → Últimos episodios (en vivo)
 *   .nuevos <título>       → Buscar episodios de un anime específico
 *   .nuevoscheck           → Fuerza búsqueda ahora
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT = 25_000
const CACHE_DURATION = 5 * 60 * 1000  // 5 minutos

const BASE_URL = 'https://www.crunchyroll.com'
const API_URL = 'https://www.crunchyroll.com/api/v2/discover/browse'

// URLs de búsqueda
const URLS = {
  latest: `${API_URL}?locale=es-ES&limit=50&sort_by=newly_added`,
  spanish: `${API_URL}?locale=es-ES&limit=50&types=series`,
}

// ─── DB Helpers ────────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.episodios) global.db.data.episodios = {}
}

function dataOf (chatId) {
  initDB()
  if (!global.db.data.episodios[chatId]) {
    global.db.data.episodios[chatId] = {
      cache: [],
      lastSync: null,
      lastEpisodeIds: []
    }
  }
  return global.db.data.episodios[chatId]
}

// ─── Fetch Episodes via API ────────────────────────────────────────────────────

async function fetchLatestEpisodes () {
  try {
    const { data } = await axios.get(URLS.latest, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })

    const episodes = []

    if (data?.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        if (!item.title || !item.id) return

        // Extraer información
        const title = item.title.trim()
        const episodeMatch = title.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i)
        const episodeNum = episodeMatch ? (episodeMatch[1] || episodeMatch[2]) : null

        // Solo agregar si es un episodio
        if (episodeNum) {
          episodes.push({
            id: item.id,
            seriesTitle: item.series_title || title.split(' - ')[0],
            episodeNumber: `Episode ${episodeNum}`,
            episodeTitle: title.includes(' - ') ? title.split(' - ').slice(1).join(' - ') : '',
            img: item.images?.[0]?.[0]?.[0]?.source || null,
            url: `${BASE_URL}/watch/${item.id}`,
            pubDate: item.episode_air_date || new Date().toISOString(),
            language: detectLanguage(item),
            timestamp: Date.now()
          })
        }
      })
    }

    return episodes
  } catch (e) {
    console.error('[Episodios] API error:', e.message)
    return []
  }
}

function detectLanguage (item) {
  const subs = (item.subtitle_locales || []).join(' ').toLowerCase()
  const audio = (item.audio_locales || []).join(' ').toLowerCase()
  const allLangs = (subs + ' ' + audio).toLowerCase()

  if (allLangs.includes('es-mx') || allLangs.includes('latino')) return '🇲🇽 Español Latino'
  if (allLangs.includes('es-es')) return '🇪🇸 Español'
  if (allLangs.includes('en-us')) return '🇺🇸 English'
  if (allLangs.includes('ja-jp')) return '🇯🇵 日本語'
  
  return '🔤 Multi'
}

function formatEpisodesList (episodes, limit = 20) {
  if (episodes.length === 0) return '⚠️ No hay episodios disponibles.'

  let msg = `🆕 *Últimos episodios en vivo*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`

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

// ─── Comandos ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chatId = m.chat
  const data = dataOf(chatId)

  try {
    // ── .nuevos ───────────────────────────────────────────────────────────────
    if (command === 'nuevos') {
      let episodes = data.cache || []
      
      // Buscar si pasaron argumento (búsqueda específica)
      if (text?.trim()) {
        const searchTerm = text.trim().toLowerCase()
        episodes = episodes.filter(ep => 
          ep.seriesTitle.toLowerCase().includes(searchTerm) ||
          ep.episodeTitle.toLowerCase().includes(searchTerm)
        )

        if (episodes.length === 0) {
          await m.reply(`⏳ Buscando "${text.trim()}"...`)
          let allEps = await fetchLatestEpisodes()
          allEps = allEps.filter(ep =>
            ep.seriesTitle.toLowerCase().includes(searchTerm)
          )
          
          if (allEps.length === 0) {
            return m.reply(`⚠️ No encontré "${text.trim()}" en los episodios recientes.`)
          }
          
          const msg = formatEpisodesList(allEps, 15)
          return m.reply(msg)
        }
      }

      // Si no hay caché o está viejo, buscar nuevos
      if (episodes.length === 0 || !data.lastSync || Date.now() - new Date(data.lastSync).getTime() > CACHE_DURATION) {
        await m.reply(`⏳ Buscando episodios nuevos...`)
        episodes = await fetchLatestEpisodes()
        
        if (episodes.length === 0) {
          return m.reply(`❌ No se encontraron episodios.`)
        }
        
        data.cache = episodes
        data.lastSync = new Date().toISOString()
        await global.db.write()
      }

      const msg = formatEpisodesList(episodes, 20)
      return m.reply(msg)
    }

    // ── .nuevoscheck ───────────────────────────────────────────────────────────
    if (command === 'nuevoscheck') {
      await m.reply(`🔄 Sincronizando episodios...`)
      const episodes = await fetchLatestEpisodes()
      
      if (episodes.length === 0) {
        return m.reply(`❌ No se encontraron episodios.`)
      }
      
      data.cache = episodes
      data.lastSync = new Date().toISOString()
      data.lastEpisodeIds = episodes.map(e => e.id)
      await global.db.write()
      
      return m.reply(
        `✅ Sincronizado\n` +
        `📊 ${episodes.length} episodios encontrados\n` +
        `⏰ ${new Date().toLocaleTimeString('es-MX')}`
      )
    }

  } catch (e) {
    console.error('[Episodios] Handler error:', e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['nuevos', 'nuevoscheck']
handler.tags = ['anime']
handler.help = [
  'nuevos',
  'nuevos <título>',
  'nuevoscheck'
]

export default handler
          
