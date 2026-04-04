/**
 * crunchyroll-live.js — Rikka-Bot
 * 
 * Notificador LIVE de episodios de Crunchyroll (con Playwright para JS rendering)
 * 
 * Comandos:
 *   .crlive                    → Últimos episodios AHORA (en vivo)
 *   .crlivewatch <título>      → Seguir anime (notificaciones instantáneas)
 *   .crliveunwatch <número>    → Dejar de seguir
 *   .crlivewatching            → Mis animes en seguimiento
 *   .crliverecientes [idioma]  → Últimos 15 episodios con opción de idioma
 *   .crlivesync                → Sincronizar ahora (fuerza recarga)
 * 
 * Notificación automática cada 15 minutos de nuevos episodios.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS       = 15 * 60 * 1000  // 15 minutos
const MAX_WATCHED_PER_CHAT  = 20
const REQUEST_TIMEOUT       = 25_000
const CACHE_DURATION        = 10 * 60 * 1000  // 10 min

// URLs base
const BASE_URL = 'https://www.crunchyroll.com'
const CALENDAR_URL = `${BASE_URL}/es/simulcastcalendar`
const EPISODES_API = `${BASE_URL}/api/v2/discover/browse?locale=es-ES&limit=50&sort_by=newly_added`

// ─── Helpers de DB ────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.crlive) global.db.data.crlive = {}
}

function dataOf (chatId) {
  initDB()
  if (!global.db.data.crlive[chatId]) {
    global.db.data.crlive[chatId] = { 
      watched: [],
      cache: [],
      lastSync: null,
      lastEpisodeIds: []
    }
  }
  return global.db.data.crlive[chatId]
}

// ─── Parser de episodios vía API + Scraping ───────────────────────────────────

async function fetchLatestEpisodes () {
  try {
    // Estrategia 1: Usar API de Crunchyroll si está disponible
    const episodes = await fetchViaAPI()
    
    if (episodes.length > 0) {
      console.log(`[CR-Live] API: ${episodes.length} episodios encontrados`)
      return episodes
    }

    // Estrategia 2: Scraping con espera de elementos dinámicos
    console.log('[CR-Live] Intentando scraping del calendario...')
    return await fetchViaCalendarScraping()
    
  } catch (e) {
    console.error('[CR-Live] Error fetching:', e.message)
    return []
  }
}

async function fetchViaAPI () {
  try {
    const { data } = await axios.get(EPISODES_API, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    })

    const episodes = []

    if (data?.items) {
      data.items.forEach((item, idx) => {
        if (!item.title || !item.id) return

        // Extraer número de episodio si existe
        const epMatch = item.title.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i) ||
                       item.episode_metadata?.episode_number

        const episodeNum = epMatch ? (Array.isArray(epMatch) ? epMatch[1] || epMatch[2] : epMatch) : 'N/A'
        
        episodes.push({
          id: `${item.id}`,
          seriesTitle: item.series_title || item.title.split(' - ')[0] || item.title,
          episodeNumber: episodeNum ? `Episode ${episodeNum}` : 'N/A',
          episodeTitle: item.title.includes(' - ') ? item.title.split(' - ').slice(1).join(' - ') : '',
          language: extractLanguageFromData(item),
          img: item.images?.[0]?.[0]?.[0]?.source || item.poster_image || null,
          url: `${BASE_URL}/watch/${item.id}`,
          timestamp: Date.now()
        })
      })
    }

    return episodes
  } catch (e) {
    console.error('[CR-Live] API error:', e.message)
    return []
  }
}

async function fetchViaCalendarScraping () {
  try {
    const { data } = await axios.get(CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)
    const episodes = []

    // Buscar en JSON embebido (Crunchyroll a veces embebe datos en JSON-LD o en atributos data)
    const scriptTags = $('script[type="application/json"]')
    
    let foundInScript = false
    scriptTags.each((_, script) => {
      try {
        const jsonData = JSON.parse($(script).html())
        if (jsonData && typeof jsonData === 'object') {
          findEpisodesInJSON(jsonData, episodes)
          if (episodes.length > 0) foundInScript = true
        }
      } catch (e) {
        // Ignorar JSON inválido
      }
    })

    if (foundInScript && episodes.length > 0) {
      console.log('[CR-Live] JSON embebido: ' + episodes.length + ' episodios')
      return episodes
    }

    // Fallback: Buscar en atributos data
    $('[data-id], [data-episode-id]').each((_, el) => {
      const $el = $(el)
      const title = $el.attr('data-title') || $el.find('[class*="title"]').text().trim()
      const id = $el.attr('data-id') || $el.attr('data-episode-id')
      const link = $el.find('a').attr('href')

      if (title && id && link) {
        const epMatch = title.match(/Episode\s+(\d+)|Episodio\s+(\d+)/i)
        episodes.push({
          id: id,
          seriesTitle: title.split('-')[0].trim(),
          episodeNumber: epMatch ? `Episode ${epMatch[1] || epMatch[2]}` : 'N/A',
          episodeTitle: title.includes('-') ? title.split('-').slice(1).join('-').trim() : '',
          language: extractLanguageFromText(title),
          img: $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
          url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          timestamp: Date.now()
        })
      }
    })

    // Último fallback: Buscar todos los links /watch/
    if (episodes.length < 3) {
      $('a[href*="/watch/"]').each((_, link) => {
        const $link = $(link)
        const href = $link.attr('href')
        const text = $link.text().trim()

        if (href && text && text.length > 5) {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l)
          
          if (lines.length >= 2) {
            const id = href.match(/\/watch\/([A-Z0-9]+)/)?.[1] || 'unknown'
            const isDuplicate = episodes.some(e => e.id === id)
            
            if (!isDuplicate) {
              episodes.push({
                id: id,
                seriesTitle: lines[0],
                episodeNumber: lines[2]?.match(/Episode\s+\d+/i)?.[0] || 'N/A',
                episodeTitle: lines[2]?.replace(/Episode\s+\d+\s*[-–]\s*/i, '') || '',
                language: extractLanguageFromText(text),
                img: $link.find('img').attr('src') || $link.find('img').attr('data-src') || null,
                url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                timestamp: Date.now()
              })
            }
          }
        }
      })
    }

    return episodes
  } catch (e) {
    console.error('[CR-Live] Scraping error:', e.message)
    return []
  }
}

function findEpisodesInJSON (obj, episodes, depth = 0) {
  if (depth > 5) return // Limitar profundidad
  
  if (Array.isArray(obj)) {
    obj.forEach(item => findEpisodesInJSON(item, episodes, depth + 1))
  } else if (obj && typeof obj === 'object') {
    // Buscar patrones de episodios
    if ((obj.title && obj.id && obj.url) || obj.episodeNumber || obj.episode_number) {
      const title = obj.title || obj.name || ''
      const id = obj.id || ''
      
      if (title.includes('Episode') || title.includes('Episodio')) {
        const url = obj.url || obj.link || obj.href || ''
        const img = obj.posterImage || obj.thumbnail || obj.image || obj.images?.[0] || null
        
        episodes.push({
          id: id,
          seriesTitle: title.split('-')[0].trim(),
          episodeNumber: title.match(/Episode\s+(\d+)|Episodio\s+(\d+)/)?.[0] || 'N/A',
          episodeTitle: title.includes('-') ? title.split('-').slice(1).join('-').trim() : '',
          language: extractLanguageFromText(title),
          img: typeof img === 'string' ? img : null,
          url: url.startsWith('http') ? url : url.startsWith('/') ? `${BASE_URL}${url}` : url,
          timestamp: Date.now()
        })
      }
    }
    
    Object.values(obj).forEach(val => findEpisodesInJSON(val, episodes, depth + 1))
  }
}

function extractLanguageFromData (item) {
  const subtitle_languages = item.subtitle_locales || item.subtitleLanguages || []
  const audio_locales = item.audio_locales || item.audioLocales || []
  
  const allLangs = [...subtitle_languages, ...audio_locales].join(' ').toLowerCase()
  
  if (allLangs.includes('es-mx') || allLangs.includes('latino')) return '🇲🇽 Español Latino'
  if (allLangs.includes('es-es') || allLangs.includes('castellano')) return '🇪🇸 Español Castellano'
  if (allLangs.includes('en-us') || allLangs.includes('english')) return '🇺🇸 English'
  if (allLangs.includes('ja-jp')) return '🇯🇵 日本語'
  
  return '🔤 Desconocido'
}

function extractLanguageFromText (text = '') {
  if (/latino|américa/i.test(text)) return '🇲🇽 Español Latino'
  if (/castellano|españa/i.test(text)) return '🇪🇸 Español Castellano'
  if (/english|inglés/i.test(text)) return '🇺🇸 English'
  if (/subtitulado|sub/i.test(text)) return '📝 Subtitulado'
  if (/日本語/i.test(text)) return '🇯🇵 日本語'
  return '🔤 Desconocido'
}

function cleanText (text) {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

// ─── Poller automático ────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkNewEpisodes (conn) {
  if (!global.db?.data?.crlive) return

  const episodes = await fetchLatestEpisodes()
  if (episodes.length === 0) {
    console.log('[CR-Live] Sin episodios encontrados')
    return
  }

  for (const [chatId, data] of Object.entries(global.db.data.crlive)) {
    if (!data.watched?.length) continue

    const newEpisodeIds = episodes.map(e => e.id)
    const previousIds = data.lastEpisodeIds || []
    const newlyAdded = newEpisodeIds.filter(id => !previousIds.includes(id))

    for (const watched of data.watched) {
      for (const episode of episodes) {
        const match = episode.seriesTitle.toLowerCase().includes(watched.title.toLowerCase()) ||
                     watched.title.toLowerCase().includes(episode.seriesTitle.toLowerCase())

        if (match && newlyAdded.includes(episode.id)) {
          try {
            const text = buildNotifMessage(episode)
            if (episode.img) {
              await conn.sendMessage(chatId, { image: { url: episode.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
            watched.lastEpisodeNotified = episode.episodeNumber
            await new Promise(r => setTimeout(r, 1000))
          } catch (e) {
            console.error(`[CR-Live] Error enviando a ${chatId}:`, e.message)
          }
        }
      }
    }

    data.lastEpisodeIds = newEpisodeIds.slice(0, 50)
    data.cache = episodes
    data.lastSync = new Date().toISOString()
  }

  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[CR-Live] Poller iniciado — cada', POLL_INTERVAL_MS / (60 * 1000), 'min')
  setTimeout(() => checkNewEpisodes(conn), 30_000)
  setInterval(() => checkNewEpisodes(conn), POLL_INTERVAL_MS)
}

// ─── Formato de mensajes ──────────────────────────────────────────────────────

function buildNotifMessage (episode) {
  let text = `🆕 *${episode.seriesTitle}*\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n`
  text += `🎬 ${episode.episodeNumber}`
  if (episode.episodeTitle) text += ` - ${episode.episodeTitle}`
  text += `\n`
  text += `${episode.language}\n`
  if (episode.url) text += `\n🔗 ${episode.url}`
  return text
}

function formatEpisodesList (episodes, limit = 15) {
  let msg = `📺 *Últimos episodios en Crunchyroll*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`

  episodes.slice(0, limit).forEach((ep, i) => {
    msg += `*${i + 1}.* 📺 ${ep.seriesTitle}\n`
    msg += `   ${ep.episodeNumber}`
    if (ep.episodeTitle) msg += ` - ${ep.episodeTitle}`
    msg += `\n`
    msg += `   ${ep.language}\n`
    if (i < limit - 1) msg += `\n`
  })

  return msg
}

// ─── Comandos ─────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const data = dataOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  // ── .crlive ───────────────────────────────────────────────────────────────
  if (/^crlive$/i.test(command)) {
    await m.reply(`⏳ Buscando últimos episodios...`)
    
    let episodes = data.cache || []
    if (episodes.length === 0 || !data.lastSync || 
        (Date.now() - new Date(data.lastSync).getTime() > CACHE_DURATION)) {
      episodes = await fetchLatestEpisodes()
      data.cache = episodes
      data.lastSync = new Date().toISOString()
      await global.db.write()
    }

    if (episodes.length === 0) {
      return m.reply(`⚠️ No se encontraron episodios. Intenta de nuevo.`)
    }

    const msg = formatEpisodesList(episodes, 15)
    return m.reply(msg)
  }

  // ── .crliverecientes [idioma] ──────────────────────────────────────────────
  if (/^crliverecientes$/i.test(command)) {
    let episodes = data.cache || []
    if (episodes.length === 0) {
      await m.reply(`⏳ Cargando...`)
      episodes = await fetchLatestEpisodes()
      data.cache = episodes
    }

    const filter = text?.trim().toLowerCase()
    let filtered = episodes

    if (filter) {
      if (/latino/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Latino'))
      } else if (/castellano|españa/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Castellano'))
      } else if (/english|inglés/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('English'))
      } else if (/subtitulado|sub/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Subtitulado'))
      }
    }

    if (filtered.length === 0) {
      return m.reply(`⚠️ No hay episodios con ese filtro.`)
    }

    const msg = formatEpisodesList(filtered, 15)
    return m.reply(msg)
  }

  // ── .crlivesync ────────────────────────────────────────────────────────────
  if (/^crlivesync$/i.test(command)) {
    await m.reply(`🔄 Sincronizando...`)
    const episodes = await fetchLatestEpisodes()
    if (episodes.length === 0) {
      return m.reply(`❌ No se pudo sincronizar.`)
    }
    data.cache = episodes
    data.lastSync = new Date().toISOString()
    data.lastEpisodeIds = episodes.map(e => e.id)
    await global.db.write()
    return m.reply(`✅ Sincronizado\n📊 ${episodes.length} episodios encontrados`)
  }

  // ── .crlivewatching ───────────────────────────────────────────────────────
  if (/^crlivewatching$/i.test(command)) {
    if (!data.watched.length) {
      return m.reply(
        `❌ No hay animes en seguimiento.\n` +
        `Usa *${usedPrefix}crlivewatch <título>* para agregar.`
      )
    }

    let msg = `⭐ *Animes en seguimiento — ${data.watched.length}/${MAX_WATCHED_PER_CHAT}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    data.watched.forEach((w, i) => {
      msg += `*${i + 1}.* ${w.title}\n`
      if (w.lastEpisodeNotified) msg += `   ✓ Último: ${w.lastEpisodeNotified}\n`
    })
    msg += `\n*Dejar de seguir:* ${usedPrefix}crliveunwatch <número>`
    return m.reply(msg)
  }

  // ── .crliveunwatch <número> ────────────────────────────────────────────────
  if (/^crliveunwatch$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden dejar de seguir.`)
    }
    if (!data.watched.length) {
      return m.reply(`❌ No hay animes.`)
    }

    const idx = parseInt(text?.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= data.watched.length) {
      return m.reply(`⚠️ Número inválido (1–${data.watched.length})`)
    }

    const [removed] = data.watched.splice(idx, 1)
    await global.db.write()
    return m.reply(
      `🗑️ Dejaste de seguir: *${removed.title}*\n` +
      `Ahora sigues *${data.watched.length}/${MAX_WATCHED_PER_CHAT}*.`
    )
  }

  // ── .crlivewatch <título> ──────────────────────────────────────────────────
  if (/^crlivewatch$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden agregar.`)
    }

    if (data.watched.length >= MAX_WATCHED_PER_CHAT) {
      return m.reply(
        `⚠️ Límite alcanzado (${MAX_WATCHED_PER_CHAT} animes).\n` +
        `Elimina uno con *${usedPrefix}crliveunwatch <número>*.`
      )
    }

    if (!text?.trim()) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}crlivewatch <título del anime>\n\n` +
        `*Ejemplo:* \`${usedPrefix}crlivewatch Frieren\``
      )
    }

    const title = text.trim()

    if (data.watched.some(w => w.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya sigues este anime.`)
    }

    let episodes = data.cache || []
    if (episodes.length === 0) {
      await m.reply(`⏳ Buscando anime...`)
      episodes = await fetchLatestEpisodes()
    }

    const found = episodes.some(e => 
      e.seriesTitle.toLowerCase().includes(title.toLowerCase())
    )

    if (!found) {
      return m.reply(
        `⚠️ No encontré "${title}" en los episodios recientes.\n` +
        `Verifica que esté en emisión.`
      )
    }

    data.watched.push({
      title: title,
      addedAt: new Date().toISOString(),
      lastEpisodeNotified: null
    })

    await global.db.write()
    return m.reply(
      `⭐ *Anime agregado al seguimiento*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 ${title}\n` +
      `Siguiendo *${data.watched.length}/${MAX_WATCHED_PER_CHAT}* animes.`
    )
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command = /^crlive(watch|unwatch|watching|recientes|sync)?$/i
handler.tags = ['anime']
handler.help = [
  'crlive',
  'crlivewatch <título>',
  'crliveunwatch <número>',
  'crlivewatching',
  'crliverecientes [idioma]',
  'crlivesync'
]

export default handler

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS       = 15 * 60 * 1000  // 15 minutos
const MAX_WATCHED_PER_CHAT  = 20
const REQUEST_TIMEOUT       = 20_000
const CACHE_DURATION        = 10 * 60 * 1000  // 10 min

// URLs base
const BASE_URL = 'https://www.crunchyroll.com'
const CALENDAR_URL = `${BASE_URL}/es/simulcastcalendar`
const VIDEOS_URL = `${BASE_URL}/es/videos`

// ─── Helpers de DB ────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.crlive) global.db.data.crlive = {}
}

function dataOf (chatId) {
  initDB()
  if (!global.db.data.crlive[chatId]) {
    global.db.data.crlive[chatId] = { 
      watched: [],          // [{title, addedAt, lastEpisodeNotified}]
      cache: [],            // Caché de episodios
      lastSync: null,
      lastEpisodeIds: []    // Para detectar nuevos episodios
    }
  }
  return global.db.data.crlive[chatId]
}

// ─── Parser de episodios en vivo ─────────────────────────────────────────────

async function fetchLatestEpisodes () {
  try {
    const { data } = await axios.get(CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)
    const episodes = []

    // Estrategia 1: Buscar todos los links de episodios (/watch/)
    $('a[href*="/watch/"]').each((_, link) => {
      const $link = $(link)
      const fullText = $link.text().trim()
      const href = $link.attr('href')
      
      if (!fullText || !href) return

      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l)
      
      if (lines.length >= 2) {
        const seriesTitle = lines[0]
        const seasonInfo = lines[1]
        
        let episodeNumber = ''
        let episodeTitle = ''
        let language = '🔤 Desconocido'

        // Búsqueda en línea 2 (puede tener Season + idioma)
        const langMatch = seasonInfo.match(/Español|Latino|English|Subtitulado|Inglés|日本語/i)
        if (langMatch) {
          const lang = langMatch[0].toLowerCase()
          if (/latino|américa/i.test(lang)) language = '🇲🇽 Español Latino'
          else if (/castellano|españa/i.test(lang)) language = '🇪🇸 Español Castellano'
          else if (/english|inglés/i.test(lang)) language = '🇺🇸 English'
          else if (/subtitulado/i.test(lang)) language = '📝 Subtitulado'
          else if (/日本語/i.test(lang)) language = '🇯🇵 日本語'
        }

        // Búsqueda en línea 3 (episodio)
        if (lines[2]) {
          const episodeLine = lines[2]
          const epMatch = episodeLine.match(/Episode\s+(\d+)\s*[-–]\s*(.+)/i) ||
                         episodeLine.match(/Episodio\s+(\d+)\s*[-–]\s*(.+)/i)
          
          if (epMatch) {
            episodeNumber = `Episode ${epMatch[1]}`
            episodeTitle = epMatch[2]
          }
        }

        const img = $link.find('img').first().attr('src') || 
                   $link.find('img').first().attr('data-src')
        
        const url = href.startsWith('http') ? href : `${BASE_URL}${href}`
        
        // Generar ID único del episodio
        const episodeId = `${seriesTitle.toLowerCase().replace(/\s+/g, '-')}_${episodeNumber}`

        if (seriesTitle && episodeNumber) {
          episodes.push({
            id: episodeId,
            seriesTitle: cleanText(seriesTitle),
            seasonInfo: cleanText(seasonInfo),
            episodeNumber: cleanText(episodeNumber),
            episodeTitle: cleanText(episodeTitle),
            language: language,
            img: img || null,
            url: url,
            timestamp: new Date().getTime()
          })
        }
      }
    })

    // Estrategia 2: Si no encuentra muchos, buscar en estructura alternativa
    if (episodes.length < 5) {
      $('[class*="episode"], [data-episode], [class*="card"]').each((_, el) => {
        const $el = $(el)
        const link = $el.find('a[href*="/watch/"]').attr('href')
        const text = $el.text().trim()
        const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src')

        if (link && text && text.length > 5) {
          const seriesMatch = text.match(/^([^\n]+)/)?.[1]?.trim()
          const epMatch = text.match(/Episode\s+(\d+)|Episodio\s+(\d+)/)
          
          if (seriesMatch && epMatch) {
            const episodeId = `${seriesMatch.toLowerCase().replace(/\s+/g, '-')}_${epMatch[0]}`
            const isDuplicate = episodes.some(e => e.id === episodeId)
            
            if (!isDuplicate) {
              episodes.push({
                id: episodeId,
                seriesTitle: cleanText(seriesMatch),
                seasonInfo: '',
                episodeNumber: cleanText(epMatch[0]),
                episodeTitle: text.split('\n')[2]?.trim() || '',
                language: extractLanguageFromText(text),
                img: img || null,
                url: link.startsWith('http') ? link : `${BASE_URL}${link}`,
                timestamp: new Date().getTime()
              })
            }
          }
        }
      })
    }

    return episodes
  } catch (e) {
    console.error('[CR-Live] Error fetching:', e.message)
    return []
  }
}

function extractLanguageFromText (text = '') {
  if (/latino|américa/i.test(text)) return '🇲🇽 Español Latino'
  if (/castellano|españa/i.test(text)) return '🇪🇸 Español Castellano'
  if (/english|inglés/i.test(text)) return '🇺🇸 English'
  if (/subtitulado|sub/i.test(text)) return '📝 Subtitulado'
  if (/日本語/i.test(text)) return '🇯🇵 日本語'
  return '🔤 Desconocido'
}

function cleanText (text) {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

// ─── Poller automático ────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkNewEpisodes (conn) {
  if (!global.db?.data?.crlive) return

  const episodes = await fetchLatestEpisodes()
  if (episodes.length === 0) return

  for (const [chatId, data] of Object.entries(global.db.data.crlive)) {
    if (!data.watched?.length) continue

    // Detectar episodios nuevos
    const newEpisodeIds = episodes.map(e => e.id)
    const previousIds = data.lastEpisodeIds || []
    const newlyAdded = newEpisodeIds.filter(id => !previousIds.includes(id))

    // Buscar en animes seguidos
    for (const watched of data.watched) {
      for (const episode of episodes) {
        const match = episode.seriesTitle.toLowerCase().includes(watched.title.toLowerCase()) ||
                     watched.title.toLowerCase().includes(episode.seriesTitle.toLowerCase())

        if (match && newlyAdded.includes(episode.id)) {
          try {
            const text = buildNotifMessage(episode)
            if (episode.img) {
              await conn.sendMessage(chatId, { image: { url: episode.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
            watched.lastEpisodeNotified = episode.episodeNumber
            await new Promise(r => setTimeout(r, 800))
          } catch (e) {
            console.error(`[CR-Live] Error enviando a ${chatId}:`, e.message)
          }
        }
      }
    }

    data.lastEpisodeIds = newEpisodeIds.slice(0, 50)
    data.cache = episodes
    data.lastSync = new Date().toISOString()
  }

  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[CR-Live] Poller iniciado — cada', POLL_INTERVAL_MS / (60 * 1000), 'min')
  setTimeout(() => checkNewEpisodes(conn), 45_000)
  setInterval(() => checkNewEpisodes(conn), POLL_INTERVAL_MS)
}

// ─── Formato de mensajes ──────────────────────────────────────────────────────

function buildNotifMessage (episode) {
  let text = `🆕 *${episode.seriesTitle}*\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n`
  text += `🎬 ${episode.episodeNumber}`
  if (episode.episodeTitle) text += ` - ${episode.episodeTitle}`
  text += `\n`
  text += `${episode.language}\n`
  if (episode.url) text += `\n🔗 ${episode.url}`
  return text
}

function formatEpisodesList (episodes, limit = 15) {
  let msg = `📺 *Últimos episodios en Crunchyroll*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`

  episodes.slice(0, limit).forEach((ep, i) => {
    msg += `*${i + 1}.* 📺 ${ep.seriesTitle}\n`
    msg += `   ${ep.episodeNumber}`
    if (ep.episodeTitle) msg += ` - ${ep.episodeTitle}`
    msg += `\n`
    msg += `   ${ep.language}\n`
    if (i < limit - 1) msg += `\n`
  })

  return msg
}

// ─── Comandos ─────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const data = dataOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  // ── .crlive ───────────────────────────────────────────────────────────────
  if (/^crlive$/i.test(command)) {
    await m.reply(`⏳ Buscando últimos episodios en vivo...`)
    
    let episodes = data.cache || []
    if (episodes.length === 0 || !data.lastSync || 
        (Date.now() - new Date(data.lastSync).getTime() > CACHE_DURATION)) {
      episodes = await fetchLatestEpisodes()
      data.cache = episodes
      data.lastSync = new Date().toISOString()
      await global.db.write()
    }

    if (episodes.length === 0) {
      return m.reply(`⚠️ No se encontraron episodios. Intenta después.`)
    }

    const msg = formatEpisodesList(episodes, 15)
    return m.reply(msg)
  }

  // ── .crliverecientes [idioma] ──────────────────────────────────────────────
  if (/^crliverecientes$/i.test(command)) {
    let episodes = data.cache || []
    if (episodes.length === 0) {
      await m.reply(`⏳ Cargando...`)
      episodes = await fetchLatestEpisodes()
      data.cache = episodes
    }

    const filter = text?.trim().toLowerCase()
    let filtered = episodes

    if (filter) {
      if (/latino/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Latino'))
      } else if (/castellano|españa/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Castellano'))
      } else if (/english|inglés/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('English'))
      } else if (/subtitulado|sub/i.test(filter)) {
        filtered = episodes.filter(e => e.language.includes('Subtitulado'))
      }
    }

    if (filtered.length === 0) {
      return m.reply(`⚠️ No hay episodios con ese filtro.`)
    }

    const msg = formatEpisodesList(filtered, 15)
    return m.reply(msg)
  }

  // ── .crlivesync ────────────────────────────────────────────────────────────
  if (/^crlivesync$/i.test(command)) {
    await m.reply(`🔄 Sincronizando...`)
    const episodes = await fetchLatestEpisodes()
    if (episodes.length === 0) {
      return m.reply(`❌ No se pudo sincronizar. Intenta después.`)
    }
    data.cache = episodes
    data.lastSync = new Date().toISOString()
    data.lastEpisodeIds = episodes.map(e => e.id)
    await global.db.write()
    return m.reply(`✅ Sincronizado\n📊 ${episodes.length} episodios encontrados`)
  }

  // ── .crlivewatching ───────────────────────────────────────────────────────
  if (/^crlivewatching$/i.test(command)) {
    if (!data.watched.length) {
      return m.reply(
        `❌ No hay animes en seguimiento.\n` +
        `Usa *${usedPrefix}crlivewatch <título>* para agregar.`
      )
    }

    let msg = `⭐ *Animes en seguimiento — ${data.watched.length}/${MAX_WATCHED_PER_CHAT}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    data.watched.forEach((w, i) => {
      msg += `*${i + 1}.* ${w.title}\n`
      if (w.lastEpisodeNotified) msg += `   ✓ Último: ${w.lastEpisodeNotified}\n`
    })
    msg += `\n*Dejar de seguir:* ${usedPrefix}crliveunwatch <número>`
    return m.reply(msg)
  }

  // ── .crliveunwatch <número> ────────────────────────────────────────────────
  if (/^crliveunwatch$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden dejar de seguir.`)
    }
    if (!data.watched.length) {
      return m.reply(`❌ No hay animes. Usa *${usedPrefix}crlivewatching*.`)
    }

    const idx = parseInt(text?.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= data.watched.length) {
      return m.reply(`⚠️ Número inválido (1–${data.watched.length})`)
    }

    const [removed] = data.watched.splice(idx, 1)
    await global.db.write()
    return m.reply(
      `🗑️ Dejaste de seguir: *${removed.title}*\n` +
      `Ahora sigues *${data.watched.length}/${MAX_WATCHED_PER_CHAT}*.`
    )
  }

  // ── .crlivewatch <título> ──────────────────────────────────────────────────
  if (/^crlivewatch$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden agregar.`)
    }

    if (data.watched.length >= MAX_WATCHED_PER_CHAT) {
      return m.reply(
        `⚠️ Límite alcanzado (${MAX_WATCHED_PER_CHAT} animes).\n` +
        `Elimina uno con *${usedPrefix}crliveunwatch <número>*.`
      )
    }

    if (!text?.trim()) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}crlivewatch <título del anime>\n\n` +
        `*Ejemplo:* \`${usedPrefix}crlivewatch Frieren\`\n` +
        `Recibirás notificaciones cuando salga un nuevo episodio.`
      )
    }

    const title = text.trim()

    if (data.watched.some(w => w.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya sigues este anime.`)
    }

    // Verificar que exista en el calendario
    let episodes = data.cache || []
    if (episodes.length === 0) {
      await m.reply(`⏳ Buscando anime...`)
      episodes = await fetchLatestEpisodes()
    }

    const found = episodes.some(e => 
      e.seriesTitle.toLowerCase().includes(title.toLowerCase())
    )

    if (!found) {
      return m.reply(
        `⚠️ No encontré "${title}" en los episodios recientes.\n` +
        `Verifica que esté en emisión y que el nombre sea correcto.`
      )
    }

    data.watched.push({
      title: title,
      addedAt: new Date().toISOString(),
      lastEpisodeNotified: null
    })

    await global.db.write()
    return m.reply(
      `⭐ *Anime agregado al seguimiento*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 ${title}\n` +
      `✨ Recibirás notificaciones de nuevos episodios.\n\n` +
      `Siguiendo *${data.watched.length}/${MAX_WATCHED_PER_CHAT}* animes.`
    )
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command = /^crlive(watch|unwatch|watching|recientes|sync)?$/i
handler.tags = ['anime']
handler.help = [
  'crlive',
  'crlivewatch <título>',
  'crliveunwatch <número>',
  'crlivewatching',
  'crliverecientes [idioma]',
  'crlivesync'
]

export default handler
