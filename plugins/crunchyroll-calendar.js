/**
 * crunchyroll-calendar.js — Rikka-Bot
 *
 * Calendario de estrenos de Crunchyroll con notificaciones automáticas.
 * Parser basado en los selectores reales del DOM de Crunchyroll.
 *
 * Comandos:
 *   .crsemanal [día]   → Estrenos de la semana o día específico
 *   .crmes             → Estrenos del mes actual
 *   .crhoy             → Próximos estrenos hoy
 *   .crproximos        → Primer día con estrenos disponibles
 *   .cradd <título>    → Agregar anime a favoritos (recibe notificaciones)
 *   .crdel <número>    → Eliminar de favoritos
 *   .crfavs            → Ver animes en seguimiento
 *   .crsync            → Fuerza sincronización ahora
 *   .crfiltro [idioma] → Filtrar por idioma (latino, castellano, sub, etc.)
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS       = 6 * 60 * 60 * 1000   // 6 horas
const REQUEST_TIMEOUT        = 20_000
const MAX_FAVORITES_PER_CHAT = 20
const CACHE_TTL_MS           = 3 * 60 * 60 * 1000   // 3 horas (re-fetch si el cache es viejo)

const CRUNCHYROLL_CALENDAR_URL = 'https://www.crunchyroll.com/es/simulcastcalendar'

// Misma lista de idiomas que la extensión, más alias en español
const KNOWN_LANGS = [
  'English', 'Deutsch', 'Français', 'Japanese', 'French', 'German',
  'América Latina', 'Portuguese', 'Português', 'Spanish', 'Indonesian',
  'Italian', 'Castilian', 'Russian', 'España', 'Italiano', 'Brasil',
  '普通话', 'Русский',
]

// Regex de la extensión para extraer idioma del título: "(Español Latino Dub)" → "Español Latino"
const DUB_LANG_REGEX = /\(([^()\d]+?)(?:\s+Dub)?\)(?!.*\([^()]*\))/

// Regex de la extensión para extraer el último número de un string (número de episodio)
const EPISODE_NUMBER_REGEX = /(\d+)(?!.*\d)/

// Mapeo de idioma detectado → etiqueta con bandera
const LANG_LABEL = {
  latino:      '🇲🇽 Español Latino',
  latinoamerica: '🇲🇽 Español Latino',
  españa:      '🇪🇸 Español Castellano',
  castellano:  '🇪🇸 Español Castellano',
  castilian:   '🇪🇸 Español Castellano',
  english:     '🇺🇸 English',
  portuguese:  '🇧🇷 Português',
  português:   '🇧🇷 Português',
  brasil:      '🇧🇷 Português Brasil',
  deutsch:     '🇩🇪 Deutsch',
  german:      '🇩🇪 Deutsch',
  français:    '🇫🇷 Français',
  french:      '🇫🇷 Français',
  italian:     '🇮🇹 Italiano',
  italiano:    '🇮🇹 Italiano',
  russian:     '🇷🇺 Русский',
  русский:     '🇷🇺 Русский',
  indonesian:  '🇮🇩 Indonesian',
  subtitulado: '📝 Subtitulado',
  japanese:    '🇯🇵 日本語',
}

// ─── Helpers de semana (portado de la extensión) ───────────────────────────────

// Desplaza domingo al final: Lun=0 … Dom=6  (la extensión usa esto para ordenar)
const shiftSunday = (d) => (d + 6) % 7

function sortedWeekdays (days) {
  const today = shiftSunday(new Date().getDay())
  return [...days].sort((a, b) => {
    const da = shiftSunday(new Date(a).getDay())
    const db = shiftSunday(new Date(b).getDay())
    const diff = ((da - today + 7) % 7) - ((db - today + 7) % 7)
    return diff
  })
}

// ─── Helpers de DB ─────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.crunchyroll) global.db.data.crunchyroll = {}
}

function chatData (chatId) {
  initDB()
  if (!global.db.data.crunchyroll[chatId]) {
    global.db.data.crunchyroll[chatId] = {
      favorites:    [],
      lastSync:     null,
      cache:        {},
      dubFilter:    null,   // null = todos los idiomas
    }
  }
  return global.db.data.crunchyroll[chatId]
}

// ─── Detección de idioma (portada de la extensión) ─────────────────────────────

function detectLanguage (title) {
  // Intenta extraer "(Algo Dub)" o "(Idioma)" del título
  const match = DUB_LANG_REGEX.exec(title)
  const raw = match?.[1]?.trim()?.toLowerCase() ?? ''

  for (const [key, label] of Object.entries(LANG_LABEL)) {
    if (raw.includes(key)) return label
  }

  // Si el título contiene "(", probablemente sea un dub desconocido
  if (/\([^)]+\)/.test(title)) return '🌐 Doblaje'
  return '📝 Subtitulado'
}

function isDub (title) {
  return (
    title.includes('Dub') ||
    /[^(]*\(\D*\)[^(]*/g.test(title) ||
    title.includes('Audio')
  )
}

// ─── Parser principal (selectores reales del DOM de Crunchyroll) ───────────────

async function fetchCalendar () {
  try {
    const { data } = await axios.get(CRUNCHYROLL_CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language':  'es-419,es;q=0.9',
        'Accept':           'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    const $ = cheerio.load(data)
    const calendar = {}

    // La extensión itera section.calendar-day → cada sección es un día
    $('section.calendar-day').each((_, section) => {
      const $section = $(section)

      // Fecha real del día desde el atributo datetime del <time> de la sección
      const datetime = $section.find('> time, > h2 time, time').first().attr('datetime') ?? ''
      const dayDate  = datetime ? new Date(datetime) : null
      const dayKey   = dayDate
        ? dayDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : $section.find('h2, h3').first().text().trim() || 'Desconocido'

      const episodesInDay = []
      // La extensión usa: ol.releases li:not(.removed) article.release.js-release
      $section.find('ol.releases li article.release.js-release, li article.release.js-release').each((_, article) => {
        const $article = $(article)

        // Título: cite[itemprop="name"] dentro del enlace h1
        const $titleLink = $article.find('h1.season-name a.js-season-name-link')
        let seriesTitle  = $titleLink.find('cite[itemprop="name"]').text().trim()
                        || $titleLink.text().trim()

        // Quitar "Season X" del título (igual que la extensión)
        seriesTitle = seriesTitle.replace(/Season\s+\d+/i, '').replace(/\s+/g, ' ').trim()

        // Idioma (doblaje) — detectado desde el título completo del artículo
        const fullTitle  = $article.text().trim()
        const language   = detectLanguage(fullTitle)
        const isDubEntry = isDub(fullTitle)

        // Número de episodio: a.available-episode-link → último número
        const $epLink     = $article.find('a.available-episode-link')
        const epLinkText  = $epLink.text().trim()
        const epMatch     = epLinkText.match(EPISODE_NUMBER_REGEX)
        const episodeNumber = epMatch ? parseInt(epMatch[1], 10) : -1
        const episodeStr    = episodeNumber >= 0 ? `Episodio ${episodeNumber}` : ''

        // Hora de emisión: time.available-time con atributo datetime
        const $time     = $article.find('time.available-time')
        const timeAttr  = $time.attr('datetime') ?? ''
        const timeStr   = timeAttr
          ? new Date(timeAttr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : $time.text().trim() || 'TBD'

        // URL del episodio
        const href = $titleLink.attr('href') ?? $epLink.attr('href') ?? ''
        const url  = href.startsWith('http') ? href : `https://www.crunchyroll.com${href}`

        // Imagen (thumbnail del artículo si existe)
        const img = $article.find('img').first().attr('src')
                 || $article.find('img').first().attr('data-src')
                 || null

        // Flags de la extensión
        const isQueued   = !!$article.find('div.queue-flag.queued').length
        const isPremiere = !!$article.find('div.premiere-flag').length

        if (seriesTitle && (episodeStr || href)) {
          episodesInDay.push({
            seriesTitle,
            episodeNumber,
            episodeStr,
            language,
            isDub:    isDubEntry,
            time:     timeStr,
            url:      url || null,
            img:      img,
            isQueued,
            isPremiere,
          })
        }
      })

      // Filtrar duplicados igual que la extensión:
      // si hay varios con el mismo título, quedarse con el de mayor episodio
      const deduped = deduplicateEpisodes(episodesInDay)

      if (deduped.length > 0) {
        // Guardar con la fecha ISO como clave interna para poder ordenar
        calendar[datetime || dayKey] = {
          label:    dayKey,
          date:     dayDate,
          episodes: deduped,
        }
      }
    })

    // Si Crunchyroll no renderiza server-side, fallback al parser anterior
    if (Object.keys(calendar).length === 0) {
      console.warn('[CR-Calendar] Selectores principales sin resultados, usando fallback')
      return fetchCalendarFallback($)
    }

    return calendar
  } catch (e) {
    console.error('[CR-Calendar] Error fetching:', e.message)
    return {}
  }
}

// Deduplica episodios por título: si hay varios, mantiene el de mayor número de episodio.
// Si el número es igual, mantiene el primero (como la extensión).
function deduplicateEpisodes (episodes) {
  const map = new Map()
  episodes.forEach((ep, idx) => {
    const key = ep.seriesTitle.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { ep, idx })
    } else {
      const prev = map.get(key)
      if (ep.episodeNumber > prev.ep.episodeNumber) {
        map.set(key, { ep, idx })
      }
    }
  })
  return [...map.values()].map(v => v.ep)
}

// Fallback: si el HTML no tiene la estructura esperada (SPA no renderizada)
async function fetchCalendarFallback ($) {
  const calendar = {}

  $('a[href*="/watch/"]').each((_, link) => {
    const $link = $(link)
    const text  = $link.text().trim()
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

    const seriesTitle   = lines[0]?.replace(/Season\s+\d+/i, '').trim() ?? ''
    const epMatch       = text.match(EPISODE_NUMBER_REGEX)
    const episodeNumber = epMatch ? parseInt(epMatch[1], 10) : -1
    const episodeStr    = episodeNumber >= 0 ? `Episodio ${episodeNumber}` : ''
    const language      = detectLanguage(text)
    const href          = $link.attr('href') ?? ''
    const url           = href.startsWith('http') ? href : `https://www.crunchyroll.com${href}`
    const dateKey       = new Date().toISOString().split('T')[0]

    if (!seriesTitle || !episodeStr) return

    if (!calendar[dateKey]) {
      calendar[dateKey] = {
        label:    new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' }),
        date:     new Date(),
        episodes: [],
      }
    }
    calendar[dateKey].episodes.push({
      seriesTitle,
      episodeNumber,
      episodeStr,
      language,
      isDub:    isDub(text),
      time:     'TBD',
      url,
      img:      $link.find('img').first().attr('src') || null,
      isQueued:   false,
      isPremiere: false,
    })
  })

  for (const day of Object.values(calendar)) {
    day.episodes = deduplicateEpisodes(day.episodes)
  }

  return calendar
}

// ─── Helpers de caché ─────────────────────────────────────────────────────────

function isCacheStale (data) {
  if (!data.lastSync) return true
  return Date.now() - new Date(data.lastSync).getTime() > CACHE_TTL_MS
}

async function getCalendar (data, forceRefresh = false) {
  if (forceRefresh || isCacheStale(data) || Object.keys(data.cache || {}).length === 0) {
    const fresh = await fetchCalendar()
    if (Object.keys(fresh).length > 0) {
      data.cache    = fresh
      data.lastSync = new Date().toISOString()
    }
  }
  return data.cache || {}
}

// ─── Filtro de idioma ─────────────────────────────────────────────────────────

function applyDubFilter (episodes, dubFilter) {
  if (!dubFilter || dubFilter === 'todos') return episodes

  return episodes.filter(ep => {
    if (dubFilter === 'nodubs') return !ep.isDub
    if (dubFilter === 'dubs')   return ep.isDub
    return ep.language.toLowerCase().includes(dubFilter.toLowerCase())
  })
}

// ─── Formateo de mensajes ─────────────────────────────────────────────────────

function formatEpisode (ep, idx) {
  let line = `*${idx + 1}.* 📺 ${ep.seriesTitle}\n`
  if (ep.episodeStr) line += `   🎬 ${ep.episodeStr}\n`
  line += `   ${ep.language}\n`
  if (ep.time && ep.time !== 'TBD') line += `   🕐 ${ep.time}\n`
  if (ep.isPremiere) line += `   ✨ _ESTRENO_\n`
  return line
}

function formatDaySection (label, episodes, dubFilter, limit = 20) {
  const filtered = applyDubFilter(episodes, dubFilter)
  if (filtered.length === 0) return ''

  let msg = `\n*📅 ${capitalizeFirst(label)}*\n`
  filtered.slice(0, limit).forEach((ep, i) => { msg += formatEpisode(ep, i) })
  if (filtered.length > limit) msg += `   _...y ${filtered.length - limit} más_\n`
  return msg
}

function buildNotificationMessage (ep, dayLabel) {
  let text = `🔔 *Nuevo episodio en Crunchyroll*\n`
  text += `━━━━━━━━━━━━━━━━━━━━━\n`
  text += `📺 *${ep.seriesTitle}*\n`
  if (ep.episodeStr) text += `🎬 ${ep.episodeStr}\n`
  text += `${ep.language}\n`
  text += `📅 ${dayLabel}\n`
  if (ep.time && ep.time !== 'TBD') text += `🕐 ${ep.time}\n`
  if (ep.url) text += `\n🔗 ${ep.url}`
  return text
}

function capitalizeFirst (str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

// Ordena las claves del calendario: días más próximos primero (usando shiftSunday)
function sortedCalendarKeys (calendar) {
  const today = shiftSunday(new Date().getDay())
  return Object.keys(calendar).sort((a, b) => {
    const da = calendar[a].date ? shiftSunday(calendar[a].date.getDay()) : 0
    const db = calendar[b].date ? shiftSunday(calendar[b].date.getDay()) : 0
    return ((da - today + 7) % 7) - ((db - today + 7) % 7)
  })
}

// ─── Poller automático ─────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkFavorites (conn) {
  if (!global.db?.data?.crunchyroll) return

  const calendar = await fetchCalendar()
  if (Object.keys(calendar).length === 0) return

  for (const [chatId, data] of Object.entries(global.db.data.crunchyroll)) {
    if (!data.favorites?.length) continue

    for (const fav of data.favorites) {
      for (const [dateKey, dayData] of Object.entries(calendar)) {
        const found = dayData.episodes.find(ep =>
          ep.seriesTitle.toLowerCase().includes(fav.title.toLowerCase()) ||
          fav.title.toLowerCase().includes(ep.seriesTitle.toLowerCase())
        )

        if (found && fav.lastNotified !== dateKey) {
          try {
            const text = buildNotificationMessage(found, dayData.label)
            if (found.img) {
              await conn.sendMessage(chatId, { image: { url: found.img }, caption: text })
            } else {
              await conn.sendMessage(chatId, { text })
            }
            fav.lastNotified = dateKey
            await new Promise(r => setTimeout(r, 1200))
          } catch (e) {
            console.error(`[CR-Calendar] Error notificando ${chatId}:`, e.message)
          }
        }
      }
    }
  }

  global.db?.data && global.db.write().catch(() => {})
}

function startPoller (conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  const hrs = POLL_INTERVAL_MS / (60 * 60 * 1000)
  console.log(`[CR-Calendar] Poller iniciado — cada ${hrs} horas`)
  setTimeout(() => checkFavorites(conn), 60_000)
  setInterval(() => checkFavorites(conn), POLL_INTERVAL_MS)
}

// ─── Comandos ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId    = m.chat
  const data      = chatData(chatId)
  const canManage = isOwner || isAdmin || isROwner
  const dubFilter = data.dubFilter

  // ── .crsync ────────────────────────────────────────────────────────────────
  if (/^crsync$/i.test(command)) {
    await m.reply(`⏳ Sincronizando calendario de Crunchyroll...`)
    const calendar = await getCalendar(data, true)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario. Intenta más tarde.`)
    }
    await global.db.write()
    const totalEps = Object.values(calendar).reduce((n, d) => n + d.episodes.length, 0)
    return m.reply(
      `✅ *Calendario sincronizado*\n` +
      `📊 ${Object.keys(calendar).length} días | ${totalEps} episodios\n` +
      `⏰ ${new Date().toLocaleTimeString('es-MX')}`
    )
  }

  // ── .crfiltro [idioma] ─────────────────────────────────────────────────────
  if (/^crfiltro$/i.test(command)) {
    const filter = text?.trim().toLowerCase() || ''
    const validos = ['todos', 'nodubs', 'dubs', 'latino', 'castellano', 'english', 'sub', 'subtitulado']
    if (!filter || !validos.includes(filter)) {
      return m.reply(
        `🔍 *Filtro de idioma actual:* ${data.dubFilter || 'todos'}\n\n` +
        `*Opciones válidas:*\n` +
        validos.map(v => `• \`${usedPrefix}crfiltro ${v}\``).join('\n')
      )
    }
    data.dubFilter = filter === 'todos' ? null : filter
    await global.db.write()
    return m.reply(`✅ Filtro establecido: *${data.dubFilter || 'todos'}*`)
  }

  // ── .crsemanal [día] ───────────────────────────────────────────────────────
  if (/^crsemanal$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario.`)
    }

    await m.reply(`⏳ Cargando...`)

    const dayFilter = text?.trim().toLowerCase()
    const keys      = sortedCalendarKeys(calendar)
    const selected  = dayFilter
      ? keys.filter(k => calendar[k].label.toLowerCase().includes(dayFilter))
      : keys.slice(0, 7)

    if (selected.length === 0) {
      return m.reply(`⚠️ No encontré estrenos para _"${text?.trim()}"_\n\nIntenta: lunes, martes, miércoles...`)
    }

    let msg = `📅 *Estrenos Crunchyroll — ${dayFilter ? capitalizeFirst(text.trim()) : 'próximos 7 días'}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro activo: *${dubFilter}*\n`

    for (const k of selected) {
      const { label, episodes } = calendar[k]
      msg += formatDaySection(label, episodes, dubFilter)
    }

    return m.reply(msg.trim() || `⚠️ Sin resultados con el filtro activo.`)
  }

  // ── .crmes ────────────────────────────────────────────────────────────────
  if (/^crmes$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario.`)
    }

    await m.reply(`⏳ Cargando...`)

    const keys = sortedCalendarKeys(calendar)
    let msg = `📅 *Estrenos Crunchyroll — mes completo*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro activo: *${dubFilter}*\n`

    for (const k of keys) {
      const { label, episodes } = calendar[k]
      msg += formatDaySection(label, episodes, dubFilter, 10)
    }

    return m.reply(msg.trim() || `⚠️ Sin resultados con el filtro activo.`)
  }

  // ── .crhoy ────────────────────────────────────────────────────────────────
  if (/^crhoy$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario.`)
    }

    const today     = new Date()
    const todayDay  = today.getDay()
    const todayKey  = Object.keys(calendar).find(k =>
      calendar[k].date && calendar[k].date.getDay() === todayDay &&
      calendar[k].date.toLocaleDateString() === today.toLocaleDateString()
    )

    if (!todayKey) {
      return m.reply(`📅 No hay estrenos registrados para hoy.\nUsa *${usedPrefix}crproximos* para ver el siguiente día.`)
    }

    const { label, episodes } = calendar[todayKey]
    const filtered = applyDubFilter(episodes, dubFilter)

    let msg = `📅 *Estrenos de hoy — ${capitalizeFirst(label)}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`

    if (filtered.length === 0) {
      return m.reply(`⚠️ No hay estrenos hoy con el filtro "${dubFilter}".`)
    }

    filtered.forEach((ep, i) => { msg += formatEpisode(ep, i) })
    return m.reply(msg.trim())
  }

  // ── .crproximos ───────────────────────────────────────────────────────────
  if (/^crpr[oó]ximos?$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario.`)
    }

    const keys     = sortedCalendarKeys(calendar)
    const firstKey = keys[0]
    if (!firstKey) return m.reply(`⚠️ No hay estrenos próximos.`)

    const { label, episodes } = calendar[firstKey]
    const filtered = applyDubFilter(episodes, dubFilter)

    let msg = `🎬 *Próximos estrenos — ${capitalizeFirst(label)}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`

    if (filtered.length === 0) {
      return m.reply(`⚠️ Sin resultados con filtro "${dubFilter}" para el próximo día.`)
    }

    filtered.slice(0, 10).forEach((ep, i) => { msg += formatEpisode(ep, i) })
    if (filtered.length > 10) msg += `\n_...y ${filtered.length - 10} más_`

    return m.reply(msg.trim())
  }

  // ── .crfavs ───────────────────────────────────────────────────────────────
  if (/^crfavs$/i.test(command)) {
    if (!data.favorites.length) {
      return m.reply(
        `❌ No hay animes en seguimiento.\n` +
        `Usa *${usedPrefix}cradd <título>* para agregar.`
      )
    }

    let msg = `⭐ *Seguimiento — ${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    data.favorites.forEach((fav, i) => {
      msg += `*${i + 1}.* ${fav.title}\n`
      if (fav.lastNotified) {
        const d = calendar?.[fav.lastNotified]?.label ?? fav.lastNotified
        msg += `   ✓ _Notificado: ${d}_\n`
      }
    })
    msg += `\n*Eliminar:* ${usedPrefix}crdel <número>`
    if (data.dubFilter) msg += `\n🔍 Filtro activo: *${data.dubFilter}*`
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
      return m.reply(`⚠️ Ya estás siguiendo *${title}*.`)
    }

    await m.reply(`⏳ Buscando _"${title}"_ en Crunchyroll...`)
    const calendar = await getCalendar(data)

    let matchedEp = null
    let matchedDay = null
    for (const [k, dayData] of Object.entries(calendar)) {
      const ep = dayData.episodes.find(ep =>
        ep.seriesTitle.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(ep.seriesTitle.toLowerCase())
      )
      if (ep) { matchedEp = ep; matchedDay = dayData; break }
    }

    if (!matchedEp) {
      return m.reply(
        `⚠️ No encontré _"${title}"_ en el calendario actual.\n` +
        `Verifica el nombre o usa *${usedPrefix}crsync* para actualizar.`
      )
    }

    data.favorites.push({
      title:        matchedEp.seriesTitle,   // guardamos el título exacto del calendario
      addedAt:      new Date().toISOString(),
      lastNotified: null,
    })

    await global.db.write()
    return m.reply(
      `⭐ *Agregado al seguimiento*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 ${matchedEp.seriesTitle}\n` +
      `${matchedEp.language}\n` +
      `📅 Próximo: ${capitalizeFirst(matchedDay.label)}\n\n` +
      `Siguiendo *${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}* animes.`
    )
  }
}

handler.all = async function (_m, { conn }) {
  if (!_pollerStarted && (conn || global.conn)) startPoller(conn || global.conn)
}

handler.command = /^cr(semanal|mes|hoy|pr[oó]ximos?|sync|favs|add|del|filtro)$/i
handler.tags    = ['anime']
handler.help    = [
  'crsemanal [día]',
  'crmes',
  'crhoy',
  'crproximos',
  'cradd <título>',
  'crdel <número>',
  'crfavs',
  'crsync',
  'crfiltro [idioma]',
]

export default handler
