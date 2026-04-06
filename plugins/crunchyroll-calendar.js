/**
 * crunchyroll-calendar.js — Rikka-Bot
 *
 * Calendario de estrenos de Crunchyroll con notificaciones automáticas.
 * Con sesión activa usa la API oficial; sin sesión usa scraping HTML.
 *
 * Comandos:
 *   .crlogin <email> <contraseña>  → Iniciar sesión en Crunchyroll
 *   .crlogout                      → Cerrar sesión
 *   .crperfil                      → Ver cuenta conectada
 *   .crsemanal [día]               → Estrenos de la semana o día específico
 *   .crmes                         → Estrenos del mes actual
 *   .crhoy                         → Estrenos de hoy
 *   .crproximos                    → Primer día con estrenos disponibles
 *   .cradd <título>                → Agregar anime a favoritos
 *   .crdel <número>                → Eliminar de favoritos
 *   .crfavs                        → Ver animes en seguimiento
 *   .crsync                        → Fuerza sincronización ahora
 *   .crfiltro [idioma]             → Filtrar por idioma
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS       = 6 * 60 * 60 * 1000
const REQUEST_TIMEOUT        = 20_000
const MAX_FAVORITES_PER_CHAT = 20
const CACHE_TTL_MS           = 3 * 60 * 60 * 1000

// API oficial de Crunchyroll (reverse-engineered, uso personal)
const CR_API_BASE  = 'https://beta-api.crunchyroll.com'
const CR_AUTH_URL  = `${CR_API_BASE}/auth/v1/token`

// Credenciales del cliente Android (públicamente documentadas)
const CR_CLIENT_ID     = 'noaihdevm_6iyg0a8l0q'
const CR_CLIENT_SECRET = 'VtnT56al7QGpKFnh9ENRqyGkoBn5qAnh'
const CR_BASIC_TOKEN   = Buffer.from(`${CR_CLIENT_ID}:${CR_CLIENT_SECRET}`).toString('base64')

const CRUNCHYROLL_CALENDAR_URL = 'https://www.crunchyroll.com/es/simulcastcalendar'

const DUB_LANG_REGEX       = /\(([^()\d]+?)(?:\s+Dub)?\)(?!.*\([^()]*\))/
const EPISODE_NUMBER_REGEX = /(\d+)(?!.*\d)/

const LANG_LABEL = {
  latino:        '🇲🇽 Español Latino',
  latinoamerica: '🇲🇽 Español Latino',
  españa:        '🇪🇸 Español Castellano',
  castellano:    '🇪🇸 Español Castellano',
  castilian:     '🇪🇸 Español Castellano',
  english:       '🇺🇸 English',
  portuguese:    '🇧🇷 Português',
  português:     '🇧🇷 Português',
  brasil:        '🇧🇷 Português Brasil',
  deutsch:       '🇩🇪 Deutsch',
  german:        '🇩🇪 Deutsch',
  français:      '🇫🇷 Français',
  french:        '🇫🇷 Français',
  italian:       '🇮🇹 Italiano',
  italiano:      '🇮🇹 Italiano',
  russian:       '🇷🇺 Русский',
  русский:       '🇷🇺 Русский',
  indonesian:    '🇮🇩 Indonesian',
  subtitulado:   '📝 Subtitulado',
  japanese:      '🇯🇵 日本語',
}

// ─── Helpers de semana ─────────────────────────────────────────────────────────

const shiftSunday = (d) => (d + 6) % 7

function sortedCalendarKeys (calendar) {
  const today = shiftSunday(new Date().getDay())
  return Object.keys(calendar).sort((a, b) => {
    const da = calendar[a].date ? shiftSunday(calendar[a].date.getDay()) : 0
    const db = calendar[b].date ? shiftSunday(calendar[b].date.getDay()) : 0
    return ((da - today + 7) % 7) - ((db - today + 7) % 7)
  })
}

// ─── DB ────────────────────────────────────────────────────────────────────────

function initDB () {
  if (!global.db?.data) return
  if (!global.db.data.crunchyroll) global.db.data.crunchyroll = {}
  if (!global.db.data.crunchyroll._session) global.db.data.crunchyroll._session = null
}

function chatData (chatId) {
  initDB()
  if (!global.db.data.crunchyroll[chatId]) {
    global.db.data.crunchyroll[chatId] = {
      favorites: [],
      lastSync:  null,
      cache:     {},
      dubFilter: null,
    }
  }
  return global.db.data.crunchyroll[chatId]
}

function getSession () {
  initDB()
  return global.db?.data?.crunchyroll?._session ?? null
}

function setSession (session) {
  initDB()
  global.db.data.crunchyroll._session = session
}

// ─── Auth — Login / Refresh / Logout ──────────────────────────────────────────

async function crLogin (email, password) {
  const params = new URLSearchParams({
    grant_type: 'password',
    username:   email,
    password:   password,
    scope:      'offline_access',
  })

  const { data } = await axios.post(CR_AUTH_URL, params.toString(), {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Authorization': `Basic ${CR_BASIC_TOKEN}`,
      'Content-Type':  'application/x-www-form-urlencoded',
      'User-Agent':    'Crunchyroll/3.46.2 Android/13 okhttp/4.12.0',
    },
  })

  const profile = await crGetProfile(data.access_token)

  const session = {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    Date.now() + (data.expires_in - 60) * 1000,
    tokenType:    data.token_type,
    accountId:    profile.account_id ?? null,
    email:        email,
    username:     profile.username ?? profile.display_name ?? email,
    avatar:       profile.avatar?.thumbnail?.source ?? null,
  }

  setSession(session)
  await global.db.write()
  return session
}

async function crRefreshToken () {
  const session = getSession()
  if (!session?.refreshToken) throw new Error('No hay sesión activa')

  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: session.refreshToken,
    scope:         'offline_access',
  })

  const { data } = await axios.post(CR_AUTH_URL, params.toString(), {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Authorization': `Basic ${CR_BASIC_TOKEN}`,
      'Content-Type':  'application/x-www-form-urlencoded',
      'User-Agent':    'Crunchyroll/3.46.2 Android/13 okhttp/4.12.0',
    },
  })

  session.accessToken  = data.access_token
  session.refreshToken = data.refresh_token ?? session.refreshToken
  session.expiresAt    = Date.now() + (data.expires_in - 60) * 1000
  setSession(session)
  await global.db.write()
  return session
}

// Devuelve un token válido, refrescando si está por vencer
async function getValidToken () {
  let session = getSession()
  if (!session) return null
  if (Date.now() >= session.expiresAt) {
    try {
      session = await crRefreshToken()
    } catch {
      return null
    }
  }
  return session.accessToken
}

async function crGetProfile (accessToken) {
  try {
    const { data } = await axios.get(`${CR_API_BASE}/accounts/v1/me/profile`, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent':    'Crunchyroll/3.46.2 Android/13 okhttp/4.12.0',
      },
    })
    return data
  } catch {
    return {}
  }
}

// ─── API oficial — Calendar ────────────────────────────────────────────────────

async function fetchCalendarAPI (token) {
  const { data } = await axios.get(`${CR_API_BASE}/content/v2/discover/calendar`, {
    timeout: REQUEST_TIMEOUT,
    params: {
      n:      28,
      locale: 'es-419',
      preferred_audio_language: 'es-419',
    },
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent':    'Crunchyroll/3.46.2 Android/13 okhttp/4.12.0',
    },
  })

  const calendar = {}

  for (const item of (data.data ?? [])) {
    const airDate  = item.episode_air_date_utc ? new Date(item.episode_air_date_utc) : new Date()
    const dayKey   = airDate.toISOString().split('T')[0]
    const dayLabel = airDate.toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    const language = audioLocaleToLabel(item.audio_locale ?? '')
    const isDubVal = !item.audio_locale?.includes('ja-JP')
    const thumbnail = item.images?.thumbnail?.[0]?.[0]?.source
                   ?? item.images?.thumbnail?.[0]?.source
                   ?? null
    const epNum = parseInt(item.episode_number ?? '-1', 10)

    const ep = {
      seriesTitle:   (item.series_title ?? '').replace(/Season\s+\d+/i, '').trim(),
      episodeNumber: epNum,
      episodeStr:    epNum >= 0 ? `Episodio ${epNum}` : '',
      episodeTitle:  item.title ?? '',
      language,
      isDub:         isDubVal,
      time:          airDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      url:           item.slug_title
        ? `https://www.crunchyroll.com/es/watch/${item.id}/${item.slug_title}`
        : null,
      img:           thumbnail,
      isQueued:      false,
      isPremiere:    item.episode_number === '1',
    }

    if (!ep.seriesTitle) continue

    if (!calendar[dayKey]) {
      calendar[dayKey] = { label: dayLabel, date: airDate, episodes: [] }
    }
    calendar[dayKey].episodes.push(ep)
  }

  for (const day of Object.values(calendar)) {
    day.episodes = deduplicateEpisodes(day.episodes)
  }

  return calendar
}

function audioLocaleToLabel (locale) {
  const map = {
    'es-419': '🇲🇽 Español Latino',
    'es-ES':  '🇪🇸 Español Castellano',
    'en-US':  '🇺🇸 English',
    'ja-JP':  '📝 Subtitulado (JP)',
    'pt-BR':  '🇧🇷 Português Brasil',
    'de-DE':  '🇩🇪 Deutsch',
    'fr-FR':  '🇫🇷 Français',
    'it-IT':  '🇮🇹 Italiano',
    'ru-RU':  '🇷🇺 Русский',
    'id-ID':  '🇮🇩 Indonesian',
    'zh-CN':  '🇨🇳 普通话',
    'ar-ME':  '🇸🇦 العربية',
  }
  return map[locale] ?? '📝 Subtitulado'
}

// ─── Scraper HTML (fallback sin sesión) ────────────────────────────────────────

async function fetchCalendarScraper () {
  try {
    const { data } = await axios.get(CRUNCHYROLL_CALENDAR_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'es-419,es;q=0.9',
      },
    })

    const $        = cheerio.load(data)
    const calendar = {}

    $('section.calendar-day').each((_, section) => {
      const $section  = $(section)
      const datetime  = $section.find('time').first().attr('datetime') ?? ''
      const dayDate   = datetime ? new Date(datetime) : null
      const dayKey    = dayDate
        ? dayDate.toISOString().split('T')[0]
        : $section.find('h2, h3').first().text().trim() || 'desconocido'
      const dayLabel  = dayDate
        ? dayDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : dayKey

      const episodesInDay = []
      $section.find('li article.release.js-release').each((_, article) => {
        const $a         = $(article)
        const $titleLink = $a.find('h1.season-name a.js-season-name-link')
        let seriesTitle  = $titleLink.find('cite[itemprop="name"]').text().trim() || $titleLink.text().trim()
        seriesTitle      = seriesTitle.replace(/Season\s+\d+/i, '').replace(/\s+/g, ' ').trim()

        const fullText   = $a.text().trim()
        const language   = detectLanguage(fullText)
        const $epLink    = $a.find('a.available-episode-link')
        const epMatch    = $epLink.text().trim().match(EPISODE_NUMBER_REGEX)
        const epNum      = epMatch ? parseInt(epMatch[1], 10) : -1

        const $time      = $a.find('time.available-time')
        const timeAttr   = $time.attr('datetime') ?? ''
        const timeStr    = timeAttr
          ? new Date(timeAttr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : $time.text().trim() || 'TBD'

        const href       = $titleLink.attr('href') ?? $epLink.attr('href') ?? ''
        const url        = href.startsWith('http') ? href : `https://www.crunchyroll.com${href}`
        const img        = $a.find('img').first().attr('src') ?? $a.find('img').first().attr('data-src') ?? null

        if (seriesTitle && (epNum >= 0 || href)) {
          episodesInDay.push({
            seriesTitle, episodeNumber: epNum,
            episodeStr:   epNum >= 0 ? `Episodio ${epNum}` : '',
            episodeTitle: '',
            language, isDub: isDub(fullText), time: timeStr, url, img,
            isQueued:  !!$a.find('div.queue-flag.queued').length,
            isPremiere: !!$a.find('div.premiere-flag').length,
          })
        }
      })

      const deduped = deduplicateEpisodes(episodesInDay)
      if (deduped.length > 0) {
        calendar[dayKey] = { label: dayLabel, date: dayDate, episodes: deduped }
      }
    })

    if (Object.keys(calendar).length === 0) return fetchCalendarFallback($)
    return calendar
  } catch (e) {
    console.error('[CR-Calendar] Error scraper:', e.message)
    return {}
  }
}

async function fetchCalendarFallback ($) {
  const calendar = {}
  $('a[href*="/watch/"]').each((_, link) => {
    const $link  = $(link)
    const text   = $link.text().trim()
    const lines  = text.split('\n').map(l => l.trim()).filter(Boolean)
    const title  = lines[0]?.replace(/Season\s+\d+/i, '').trim() ?? ''
    const epMatch = text.match(EPISODE_NUMBER_REGEX)
    const epNum  = epMatch ? parseInt(epMatch[1], 10) : -1
    const href   = $link.attr('href') ?? ''
    const url    = href.startsWith('http') ? href : `https://www.crunchyroll.com${href}`
    const key    = new Date().toISOString().split('T')[0]

    if (!title || epNum < 0) return
    if (!calendar[key]) {
      calendar[key] = {
        label: new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' }),
        date:  new Date(), episodes: [],
      }
    }
    calendar[key].episodes.push({
      seriesTitle: title, episodeNumber: epNum, episodeStr: `Episodio ${epNum}`,
      episodeTitle: '', language: detectLanguage(text), isDub: isDub(text),
      time: 'TBD', url, img: $link.find('img').first().attr('src') ?? null,
      isQueued: false, isPremiere: false,
    })
  })
  for (const day of Object.values(calendar)) day.episodes = deduplicateEpisodes(day.episodes)
  return calendar
}

// ─── Fetch unificado ───────────────────────────────────────────────────────────

async function fetchCalendar () {
  const token = await getValidToken()
  if (token) {
    try {
      const result = await fetchCalendarAPI(token)
      if (Object.keys(result).length > 0) return result
    } catch (e) {
      console.warn('[CR-Calendar] API falló, usando scraper:', e.message)
    }
  }
  return fetchCalendarScraper()
}

// ─── Helpers de idioma ─────────────────────────────────────────────────────────

function detectLanguage (title) {
  const match = DUB_LANG_REGEX.exec(title)
  const raw   = match?.[1]?.trim()?.toLowerCase() ?? ''
  for (const [key, label] of Object.entries(LANG_LABEL)) {
    if (raw.includes(key)) return label
  }
  if (/\([^)]+\)/.test(title)) return '🌐 Doblaje'
  return '📝 Subtitulado'
}

function isDub (title) {
  return title.includes('Dub') || /[^(]*\(\D*\)[^(]*/g.test(title) || title.includes('Audio')
}

function deduplicateEpisodes (episodes) {
  const map = new Map()
  episodes.forEach((ep) => {
    const key = ep.seriesTitle.toLowerCase()
    if (!map.has(key) || ep.episodeNumber > map.get(key).episodeNumber) {
      map.set(key, ep)
    }
  })
  return [...map.values()]
}

// ─── Caché ─────────────────────────────────────────────────────────────────────

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

// ─── Formato ───────────────────────────────────────────────────────────────────

function capitalizeFirst (str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

function applyDubFilter (episodes, dubFilter) {
  if (!dubFilter || dubFilter === 'todos') return episodes
  if (dubFilter === 'nodubs') return episodes.filter(ep => !ep.isDub)
  if (dubFilter === 'dubs')   return episodes.filter(ep => ep.isDub)
  return episodes.filter(ep => ep.language.toLowerCase().includes(dubFilter.toLowerCase()))
}

function formatEpisode (ep, idx) {
  let line = `*${idx + 1}.* 📺 ${ep.seriesTitle}\n`
  if (ep.episodeStr) line += `   🎬 ${ep.episodeStr}`
  if (ep.episodeTitle) line += ` — ${ep.episodeTitle}`
  if (ep.episodeStr || ep.episodeTitle) line += '\n'
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
  if (ep.episodeStr) text += `🎬 ${ep.episodeStr}`
  if (ep.episodeTitle) text += ` — ${ep.episodeTitle}`
  if (ep.episodeStr) text += '\n'
  text += `${ep.language}\n📅 ${dayLabel}\n`
  if (ep.time && ep.time !== 'TBD') text += `🕐 ${ep.time}\n`
  if (ep.url) text += `\n🔗 ${ep.url}`
  return text
}

// ─── Poller ────────────────────────────────────────────────────────────────────

let _pollerStarted = false

async function checkFavorites (conn) {
  if (!global.db?.data?.crunchyroll) return
  const calendar = await fetchCalendar()
  if (Object.keys(calendar).length === 0) return

  for (const [chatId, data] of Object.entries(global.db.data.crunchyroll)) {
    if (chatId.startsWith('_') || !data.favorites?.length) continue
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
            console.error(`[CR-Calendar] Error notif ${chatId}:`, e.message)
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
  console.log(`[CR-Calendar] Poller iniciado — cada ${POLL_INTERVAL_MS / 3600000}h`)
  setTimeout(() => checkFavorites(conn), 60_000)
  setInterval(() => checkFavorites(conn), POLL_INTERVAL_MS)
}

// ─── Comandos ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId    = m.chat
  const data      = chatData(chatId)
  const canManage = isOwner || isAdmin || isROwner
  const dubFilter = data.dubFilter

  // ── .crlogin <email> <contraseña> ─────────────────────────────────────────
  if (/^crlogin$/i.test(command)) {
    if (!isOwner && !isROwner) {
      return m.reply(`⛔ Solo el dueño del bot puede iniciar sesión en Crunchyroll.`)
    }

    const parts = text?.trim().split(/\s+/)
    if (!parts || parts.length < 2) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}crlogin <email> <contraseña>\n\n` +
        `⚠️ _Envía este comando en chat privado con el bot por seguridad._`
      )
    }

    const [email, ...passParts] = parts
    const password = passParts.join(' ')

    await m.reply(`⏳ Iniciando sesión en Crunchyroll...`)

    try {
      const session = await crLogin(email, password)
      return m.reply(
        `✅ *Sesión iniciada correctamente*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${session.username}\n` +
        `📧 ${session.email}\n\n` +
        `🔑 El calendario ahora usa la API oficial.\n` +
        `Usa *${usedPrefix}crsync* para actualizar.`
      )
    } catch (e) {
      const err = e.response?.data?.error ?? e.message
      if (err?.includes('invalid_grant') || e.response?.status === 401) {
        return m.reply(`❌ *Credenciales incorrectas.*\nVerifica tu email y contraseña.`)
      }
      if (err?.includes('too_many') || e.response?.status === 429) {
        return m.reply(`❌ *Demasiados intentos.* Espera unos minutos e intenta de nuevo.`)
      }
      return m.reply(`❌ Error al iniciar sesión: ${err}`)
    }
  }

  // ── .crlogout ─────────────────────────────────────────────────────────────
  if (/^crlogout$/i.test(command)) {
    if (!isOwner && !isROwner) return m.reply(`⛔ Solo el dueño del bot puede cerrar sesión.`)
    if (!getSession()) return m.reply(`ℹ️ No hay sesión activa.`)
    setSession(null)
    await global.db.write()
    return m.reply(`✅ Sesión cerrada. El bot usará scraping HTML.`)
  }

  // ── .crperfil ─────────────────────────────────────────────────────────────
  if (/^crperfil$/i.test(command)) {
    const session = getSession()
    if (!session) {
      return m.reply(
        `❌ *Sin sesión activa*\n\n` +
        `Usa *${usedPrefix}crlogin <email> <contraseña>* para conectarte.\n` +
        `Actualmente el bot usa scraping HTML (sin autenticación).`
      )
    }
    const isExpired = Date.now() >= session.expiresAt
    return m.reply(
      `👤 *Cuenta Crunchyroll conectada*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🧑 Usuario: ${session.username}\n` +
      `📧 Email: ${session.email}\n` +
      `🔑 Token: ${isExpired ? '🔴 Expirado (se refrescará automáticamente)' : '🟢 Activo'}\n` +
      `⏰ Vence: ${new Date(session.expiresAt).toLocaleString('es-MX')}\n\n` +
      `_El calendario usa la API oficial de Crunchyroll._`
    )
  }

  // ── .crsync ───────────────────────────────────────────────────────────────
  if (/^crsync$/i.test(command)) {
    const session = getSession()
    await m.reply(`⏳ Sincronizando${session ? ' (API oficial)' : ' (scraper)'}...`)
    const calendar = await getCalendar(data, true)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario. Intenta más tarde.`)
    }
    await global.db.write()
    const totalEps = Object.values(calendar).reduce((n, d) => n + d.episodes.length, 0)
    return m.reply(
      `✅ *Calendario sincronizado*\n` +
      `📊 ${Object.keys(calendar).length} días | ${totalEps} episodios\n` +
      `🔌 Fuente: ${session ? 'API oficial' : 'Scraper HTML'}\n` +
      `⏰ ${new Date().toLocaleTimeString('es-MX')}`
    )
  }

  // ── .crfiltro [idioma] ────────────────────────────────────────────────────
  if (/^crfiltro$/i.test(command)) {
    const filter  = text?.trim().toLowerCase() || ''
    const validos = ['todos', 'nodubs', 'dubs', 'latino', 'castellano', 'english', 'sub', 'subtitulado']
    if (!filter || !validos.includes(filter)) {
      return m.reply(
        `🔍 *Filtro actual:* ${data.dubFilter || 'todos'}\n\n` +
        `*Opciones:*\n` +
        validos.map(v => `• \`${usedPrefix}crfiltro ${v}\``).join('\n')
      )
    }
    data.dubFilter = filter === 'todos' ? null : filter
    await global.db.write()
    return m.reply(`✅ Filtro: *${data.dubFilter || 'todos'}*`)
  }

  // ── .crsemanal [día] ──────────────────────────────────────────────────────
  if (/^crsemanal$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    await m.reply(`⏳ Cargando...`)
    const dayFilter = text?.trim().toLowerCase()
    const keys      = sortedCalendarKeys(calendar)
    const selected  = dayFilter
      ? keys.filter(k => calendar[k].label.toLowerCase().includes(dayFilter))
      : keys.slice(0, 7)

    if (selected.length === 0) {
      return m.reply(`⚠️ No encontré estrenos para _"${text?.trim()}"_\nIntenta: lunes, martes, miércoles...`)
    }

    let msg = `📅 *Estrenos Crunchyroll — ${dayFilter ? capitalizeFirst(text.trim()) : 'próximos 7 días'}*\n`
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n`
    for (const k of selected) {
      const { label, episodes } = calendar[k]
      msg += formatDaySection(label, episodes, dubFilter)
    }
    return m.reply(msg.trim() || `⚠️ Sin resultados con el filtro activo.`)
  }

  // ── .crmes ────────────────────────────────────────────────────────────────
  if (/^crmes$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    await m.reply(`⏳ Cargando...`)
    const keys = sortedCalendarKeys(calendar)
    let msg = `📅 *Estrenos Crunchyroll — mes completo*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n`
    for (const k of keys) msg += formatDaySection(calendar[k].label, calendar[k].episodes, dubFilter, 10)
    return m.reply(msg.trim() || `⚠️ Sin resultados con el filtro activo.`)
  }

  // ── .crhoy ────────────────────────────────────────────────────────────────
  if (/^crhoy$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    const today    = new Date()
    const todayKey = Object.keys(calendar).find(k =>
      calendar[k].date &&
      calendar[k].date.toLocaleDateString() === today.toLocaleDateString()
    )

    if (!todayKey) {
      return m.reply(`📅 No hay estrenos registrados para hoy.\nUsa *${usedPrefix}crproximos* para ver el siguiente día.`)
    }

    const { label, episodes } = calendar[todayKey]
    const filtered = applyDubFilter(episodes, dubFilter)
    if (filtered.length === 0) return m.reply(`⚠️ No hay estrenos hoy con filtro "${dubFilter}".`)

    let msg = `📅 *Estrenos de hoy — ${capitalizeFirst(label)}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`
    filtered.forEach((ep, i) => { msg += formatEpisode(ep, i) })
    return m.reply(msg.trim())
  }

  // ── .crproximos ───────────────────────────────────────────────────────────
  if (/^crpr[oó]ximos?$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    const keys     = sortedCalendarKeys(calendar)
    const firstKey = keys[0]
    if (!firstKey) return m.reply(`⚠️ No hay estrenos próximos.`)

    const { label, episodes } = calendar[firstKey]
    const filtered = applyDubFilter(episodes, dubFilter)
    if (filtered.length === 0) return m.reply(`⚠️ Sin resultados con filtro "${dubFilter}".`)

    let msg = `🎬 *Próximos estrenos — ${capitalizeFirst(label)}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`
    filtered.slice(0, 10).forEach((ep, i) => { msg += formatEpisode(ep, i) })
    if (filtered.length > 10) msg += `\n_...y ${filtered.length - 10} más_`
    return m.reply(msg.trim())
  }

  // ── .crfavs ───────────────────────────────────────────────────────────────
  if (/^crfavs$/i.test(command)) {
    if (!data.favorites.length) {
      return m.reply(`❌ No hay animes en seguimiento.\nUsa *${usedPrefix}cradd <título>* para agregar.`)
    }
    let msg = `⭐ *Seguimiento — ${data.favorites.length}/${MAX_FAVORITES_PER_CHAT}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    data.favorites.forEach((fav, i) => {
      msg += `*${i + 1}.* ${fav.title}\n`
      if (fav.lastNotified) msg += `   ✓ _Notificado: ${fav.lastNotified}_\n`
    })
    msg += `\n*Eliminar:* ${usedPrefix}crdel <número>`
    if (data.dubFilter) msg += `\n🔍 Filtro: *${data.dubFilter}*`
    return m.reply(msg)
  }

  // ── .crdel <número> ───────────────────────────────────────────────────────
  if (/^crdel$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores pueden eliminar del seguimiento.`)
    if (!data.favorites.length) return m.reply(`❌ No hay animes. Usa *${usedPrefix}crfavs*.`)
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

  // ── .cradd <título> ───────────────────────────────────────────────────────
  if (/^cradd$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores pueden agregar al seguimiento.`)
    if (data.favorites.length >= MAX_FAVORITES_PER_CHAT) {
      return m.reply(`⚠️ Límite alcanzado (${MAX_FAVORITES_PER_CHAT}).\nElimina uno con *${usedPrefix}crdel <número>*.`)
    }
    if (!text?.trim()) {
      return m.reply(`ℹ️ *Uso:* ${usedPrefix}cradd <título del anime>\n*Ejemplo:* \`${usedPrefix}cradd Frieren\``)
    }

    const title = text.trim()
    if (data.favorites.some(f => f.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya estás siguiendo *${title}*.`)
    }

    await m.reply(`⏳ Buscando _"${title}"_ en Crunchyroll...`)
    const calendar = await getCalendar(data)

    let matchedEp = null, matchedDay = null
    for (const [, dayData] of Object.entries(calendar)) {
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
      title:        matchedEp.seriesTitle,
      addedAt:      new Date().toISOString(),
      lastNotified: null,
    })
    await global.db.write()
    return m.reply(
      `⭐ *Agregado al seguimiento*\n━━━━━━━━━━━━━━━━━━━━━\n` +
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

handler.command = /^cr(login|logout|perfil|semanal|mes|hoy|pr[oó]ximos?|sync|favs|add|del|filtro)$/i
handler.tags    = ['anime']
handler.help    = [
  'crlogin <email> <contraseña>',
  'crlogout',
  'crperfil',
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
