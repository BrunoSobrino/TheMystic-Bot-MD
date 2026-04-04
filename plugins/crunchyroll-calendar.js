/**
 * crunchyroll-calendar.js — Rikka-Bot
 * 
 * Calendario de estrenos de Crunchyroll con notificaciones automáticas
 * 
 * Comandos:
 *   .crsemanal [día]       → Estrenos de la semana o día específico
 *   .crmes                 → Estrenos del mes actual
 *   .crhoypróximo          → Próximo estreno hoy
 *   .cradd <título>        → Agregar anime a favoritos (recibe notificaciones)
 *   .crdel <número>        → Eliminar de favoritos
 *   .crfavs                → Ver animes en seguimiento
 *   .crsync                → Fuerza sincronización ahora
 * 
 * Notificación automática de estrenos en favoritos cada 6 horas.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS      = 6 * 60 * 60 * 1000  // 6 horas
const REQUEST_TIMEOUT       = 20_000
const MAX_FAVORITES_PER_CHAT = 20

const CRUNCHYROLL_CALENDAR_URL = 'https://www.crunchyroll.com/es/simulcastcalendar'

const DAYS_ES = {
  'Monday': 'Lunes',
  'Tuesday': 'Martes',
  'Wednesday': 'Miércoles',
  'Thursday': 'Jueves',
  'Friday': 'Viernes',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo'
}

const DAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

// ─── Helpers de DB ────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.crunchyroll) global.db.data.crunchyroll = {}
}

function favoritesOf (chatId) {
  initDB()
  if (!global.db.data.crunchyroll[chatId]) {
    global.db.data.crunchyroll[chatId] = { favorites: [], lastSync: null, cache: [] }
  }
  return global.db.data.crunchyroll[chatId]
}

// ─── Parser del calendario ────────────────────────────────────────────────────

async function fetchCalendar () {
  try {
    const { data } = await axios.get(CRUNCHYROLL_CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(data)
    const calendar = {}

    // Buscar links de episodios (todos comienzan con /watch/)
    $('a[href*="/watch/"]').each((_, link) => {
      const $link = $(link)
      const fullText = $link.text().trim()
      const html = $link.html() || ''
      
      // Detectar fecha del contenedor padre
      let dateLabel = $link.closest('[data-date]').attr('data-date') ||
                     $link.closest('.day, section, [class*="day"], article').find('[class*="date"], h2, h3').first().text().trim()
      
      if (!dateLabel) {
        dateLabel = new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
      }

      // Parsear formato: "Series Title\nSeason X (Español (América Latina))\nEpisode # - Title"
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l)
      
      let seriesTitle = ''
      let seasonInfo = ''
      let episodeNumber = ''
      let episodeTitle = ''
      let language = '🔤 Desconocido'
      
      // Primera línea: nombre de la serie
      if (lines[0]) {
        seriesTitle = lines[0]
      }
      
      // Segunda línea: Season + idioma
      if (lines[1]) {
        seasonInfo = lines[1]
        const langMatch = seasonInfo.match(/Español\s*\(\s*(?:América Latina|España|Castellano)\s*\)|English|Subtitulado|日本語/i)
        if (langMatch) {
          const langText = langMatch[0]
          if (/latino|américa/i.test(langText)) language = '🇲🇽 Español Latino'
          else if (/españa|castellano/i.test(langText)) language = '🇪🇸 Español Castellano'
          else if (/english/i.test(langText)) language = '🇺🇸 English'
          else if (/subtitulado/i.test(langText)) language = '📝 Subtitulado'
          else if (/日本語/i.test(langText)) language = '🇯🇵 日本語'
        }
      }
      
      // Tercera línea: Episodio
      if (lines[2]) {
        const episodeLine = lines[2]
        const episodeMatch = episodeLine.match(/Episode\s+(\d+)\s*[-–]\s*(.+)/i) ||
                           episodeLine.match(/Episodio\s+(\d+)\s*[-–]\s*(.+)/i)
        
        if (episodeMatch) {
          episodeNumber = `Episode ${episodeMatch[1]}`
          episodeTitle = episodeMatch[2]
        } else if (episodeLine.match(/Episode\s+\d+|Episodio\s+\d+/i)) {
          episodeNumber = episodeLine.match(/Episode\s+\d+|Episodio\s+\d+/i)[0]
        }
      }

      // Extraer imagen
      const img = $link.find('img').first().attr('src') || 
                 $link.find('img').first().attr('data-src') ||
                 html.match(/src=["']([^"']+)["']/)?.[1]

      const url = $link.attr('href')?.startsWith('http') 
        ? $link.attr('href') 
        : 'https://www.crunchyroll.com' + $link.attr('href')

      if (seriesTitle && episodeNumber) {
        if (!calendar[dateLabel]) calendar[dateLabel] = []
        
        calendar[dateLabel].push({
          seriesTitle: cleanText(seriesTitle),
          seasonInfo: cleanText(seasonInfo),
          episodeNumber: cleanText(episodeNumber),
          episodeTitle: cleanText(episodeTitle),
          language: language,
          img: img || null,
          url: url || null,
          time: 'TBD'
        })
      }
    })

    // Si no encuentra episodios, usa estrategia alternativa
    if (Object.keys(calendar).length === 0) {
      return parseCalendarAlternate($)
    }

    return calendar
  } catch (e) {
    console.error('[CR-Calendar] Error fetching:', e.message)
    return {}
  }
}

function cleanText (text) {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').trim()
}

function parseCalendarAlternate ($) {
  const calendar = {}
  
  $('a[href*="/watch/"]').each((_, link) => {
    const $link = $(link)
    const text = $link.text().trim()
    
    let dateLabel = $link.closest('[data-date]').attr('data-date') ||
                   $link.closest('.day, section, [class*="day"]').attr('data-date') ||
                   new Date().toLocaleDateString('es-ES')
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    const seriesTitle = lines[0] || ''
    const episodeMatch = text.match(/Episode\s+(\d+)|Episodio\s+(\d+)/)
    const langMatch = text.match(/Español|Latino|English|Subtitulado/)
    
    if (seriesTitle && episodeMatch) {
      if (!calendar[dateLabel]) calendar[dateLabel] = []
      calendar[dateLabel].push({
        seriesTitle: cleanText(seriesTitle),
        seasonInfo: lines[1] || '',
        episodeNumber: episodeMatch[0],
        episodeTitle: lines[2] || '',
        language: langMatch ? langMatch[0] : '🔤 Desconocido',
        img: $link.find('img').first().attr('src') || null,
        url: $link.attr('href')?.startsWith('http') ? $link.attr('href') : 'https://www.crunchyroll.com' + $link.attr('href'),
        time: 'TBD'
      })
    }
  })
  
  return calendar
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

function getTodayDate () {
  const d = new Date()
  return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDate (dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function buildEstrenoMessage (episode, día) {
  let text = `📺 *${episode.seriesTitle}*\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n`
  text += `🎬 ${episode.episodeNumber}`
  if (episode.episodeTitle) text += ` - ${episode.episodeTitle}`
  text += `\n`
  text += `${episode.language}\n`
  text += `📅 ${día}\n`
  if (episode.url) text += `\n🔗 ${episode.url}`
  return text
}

function formatCalendarList (calendar, limit = 14) {
  let msg = `📅 *Estrenos Crunchyroll — próximos días*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`

  let count = 0
  for (const [day, episodes] of Object.entries(calendar)) {
    if (count >= limit) break
    msg += `\n*${day}*\n`
    episodes.forEach((ep, idx) => {
      msg += `*${idx + 1}.* 📺 ${ep.seriesTitle}\n`
      msg += `   ${ep.episodeNumber}`
      if (ep.episodeTitle) msg += ` - ${ep.episodeTitle}`
      msg += `\n`
      msg += `   ${ep.language}\n`
    })
    count++
  }

  return msg || `⚠️ No hay estrenos próximos disponibles.`
}

// ─── Poller automático ────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkFavorites (conn) {
  if (!global.db?.data?.crunchyroll) return

  const calendar = await fetchCalendar()
  if (Object.keys(calendar).length === 0) return

  for (const [chatId, data] of Object.entries(global.db.data.crunchyroll)) {
    if (!data.favorites?.length) continue

    for (const fav of data.favorites) {
      // Buscar en el calendario
      for (const [day, episodes] of Object.entries(calendar)) {
        const found = episodes.find(ep => 
          ep.seriesTitle.toLowerCase().includes(fav.title.toLowerCase()) ||
          fav.title.toLowerCase().includes(ep.seriesTitle.toLowerCase())
        )

        if (found && (!fav.lastNotified || fav.lastNotified !== day)) {
          try {
            const text = buildEstrenoMessage(found, day)
            if (found.img) {
              await conn.sendMessage(chatId, { image: { url: found.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
            fav.lastNotified = day
            await new Promise(r => setTimeout(r, 1000))
          } catch (e) {
            console.error(`[CR-Calendar] Error notificando a ${chatId}:`, e.message)
          }
        }
      }
    }
  }

  // Guardar cambios
  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  console.log('[CR-Calendar] Poller iniciado — cada', POLL_INTERVAL_MS / (60 * 60 * 1000), 'horas')
  setTimeout(() => checkFavorites(conn), 60_000)
  setInterval(() => checkFavorites(conn), POLL_INTERVAL_MS)
}

// ─── Comandos ─────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const data = favoritesOf(chatId)
  const canManage = isOwner || isAdmin || isROwner

  // ── .crsync ────────────────────────────────────────────────────────────────
  if (/^crsync$/i.test(command)) {
    await m.reply(`⏳ Sincronizando calendario de Crunchyroll...`)
    const calendar = await fetchCalendar()
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario. Intenta de nuevo más tarde.`)
    }
    data.cache = calendar
    data.lastSync = new Date().toISOString()
    await global.db.write()
    return m.reply(
      `✅ Calendario sincronizado\n` +
      `📊 ${Object.keys(calendar).length} días con estrenos\n` +
      `⏰ ${new Date().toLocaleTimeString('es-MX')}`
    )
  }

  // ── .crsemanal [día] ───────────────────────────────────────────────────────
  if (/^crsemanal$/i.test(command)) {
    let calendar = data.cache || {}
    if (Object.keys(calendar).length === 0) {
      await m.reply(`⏳ Cargando calendario...`)
      calendar = await fetchCalendar()
      data.cache = calendar
    }

    const dayFilter = text?.trim().toLowerCase()
    let filtered = {}

    if (dayFilter) {
      for (const [day, animes] of Object.entries(calendar)) {
        if (day.toLowerCase().includes(dayFilter)) {
          filtered[day] = animes
        }
      }
      if (Object.keys(filtered).length === 0) {
        return m.reply(`⚠️ No encontré estrenos para "${text.trim()}"\n\nIntenta: lunes, martes, miércoles...`)
      }
    } else {
      // Próximos 7 días
      let count = 0
      for (const [day, animes] of Object.entries(calendar)) {
        if (count >= 7) break
        filtered[day] = animes
        count++
      }
    }

    const msg = formatCalendarList(filtered, 7)
    return m.reply(msg)
  }

  // ── .crmes ────────────────────────────────────────────────────────────────
  if (/^crmes$/i.test(command)) {
    let calendar = data.cache || {}
    if (Object.keys(calendar).length === 0) {
      await m.reply(`⏳ Cargando calendario...`)
      calendar = await fetchCalendar()
      data.cache = calendar
    }

    const msg = formatCalendarList(calendar, 30)
    return m.reply(msg)
  }

  // ── .crhoypróximo ─────────────────────────────────────────────────────────
  if (/^cr(hoy|próximo)$/i.test(command)) {
    let calendar = data.cache || {}
    if (Object.keys(calendar).length === 0) {
      await m.reply(`⏳ Cargando calendario...`)
      calendar = await fetchCalendar()
      data.cache = calendar
    }

    const today = getTodayDate()
    const firstDay = Object.entries(calendar)[0]

    if (!firstDay) {
      return m.reply(`⚠️ No hay estrenos próximos en el calendario.`)
    }

    const [day, animes] = firstDay
    let msg = `🎬 *Próximo estreno — ${day}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`

    animes.slice(0, 5).forEach((a, i) => {
      msg += `*${i + 1}.* ${a.title}\n`
      if (a.time && a.time !== 'TBD') msg += `   🕐 ${a.time}\n`
      msg += `\n`
    })

    if (animes.length > 5) {
      msg += `...y ${animes.length - 5} más`
    }

    return m.reply(msg)
  }

  // ── .crfavs ───────────────────────────────────────────────────────────────
  if (/^crfavs$/i.test(command)) {
    if (!data.favorites.length) {
      return m.reply(
        `❌ No hay animes en seguimiento.\n` +
        `Usa *${usedPrefix}cradd <título>* para agregar.`
      )
    }

    let msg = `⭐ *Mis animes en Crunchyroll — ${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    data.favorites.forEach((fav, i) => {
      msg += `*${i + 1}.* ${fav.title}\n`
      if (fav.lastNotified) msg += `   ✓ Notificado: ${fav.lastNotified}\n`
    })
    msg += `\n*Eliminar:* ${usedPrefix}crdel <número>`
    return m.reply(msg)
  }

  // ── .crdel <número> ────────────────────────────────────────────────────────
  if (/^crdel$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden eliminar del seguimiento.`)
    }
    if (!data.favorites.length) {
      return m.reply(`❌ No hay animes. Usa *${usedPrefix}crfavs*.`)
    }

    const idx = parseInt(text?.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= data.favorites.length) {
      return m.reply(`⚠️ Número inválido (1–${data.favorites.length})`)
    }

    const [removed] = data.favorites.splice(idx, 1)
    await global.db.write()
    return m.reply(
      `🗑️ Eliminado: *${removed.title}*\n` +
      `Quedan *${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}* en seguimiento.`
    )
  }

  // ── .cradd <título> ────────────────────────────────────────────────────────
  if (/^cradd$/i.test(command)) {
    if (!canManage) {
      return m.reply(`⛔ Solo administradores pueden agregar al seguimiento.`)
    }

    if (data.favorites.length >= MAX_FAVORITES_PER_CHAT) {
      return m.reply(
        `⚠️ Límite alcanzado (${MAX_FAVORITES_PER_CHAT} animes).\n` +
        `Elimina uno con *${usedPrefix}crdel <número>*.`
      )
    }

    if (!text?.trim()) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}cradd <título del anime>\n\n` +
        `*Ejemplo:* \`${usedPrefix}cradd Frieren\`\n` +
        `Recibirás notificaciones cuando estrene en Crunchyroll.`
      )
    }

    const title = text.trim()

    if (data.favorites.some(f => f.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya estás siguiendo este anime.`)
    }

    // Buscar en calendario para verificar que existe
    let calendar = data.cache || {}
    if (Object.keys(calendar).length === 0) {
      await m.reply(`⏳ Buscando anime en Crunchyroll...`)
      calendar = await fetchCalendar()
      data.cache = calendar
    }

    let found = false
    for (const episodes of Object.values(calendar)) {
      if (episodes.some(ep => ep.seriesTitle.toLowerCase().includes(title.toLowerCase()))) {
        found = true
        break
      }
    }

    if (!found) {
      return m.reply(
        `⚠️ No encontré "${title}" en el calendario.\n` +
        `Verifica que esté programado para estrenar y que el nombre sea correcto.`
      )
    }

    data.favorites.push({
      title,
      addedAt: new Date().toISOString(),
      lastNotified: null
    })

    await global.db.write()
    return m.reply(
      `⭐ *Anime agregado al seguimiento*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 ${title}\n` +
      `✨ Recibirás notificaciones cuando estrene.\n\n` +
      `Siguiendo *${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}* animes.`
    )
  }
}

handler.all = async function () {
  if (!_pollerStarted && global.conn) startPoller(global.conn)
}

handler.command = /^cr(semanal|mes|hoy|próximo|sync|favs|add|del)$/i
handler.tags = ['anime']
handler.help = [
  'crsemanal [día]',
  'crmes',
  'crhoypróximo',
  'cradd <título>',
  'crdel <número>',
  'crfavs',
  'crsync'
]

export default handler
