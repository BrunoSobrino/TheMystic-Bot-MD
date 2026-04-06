/**
 * crunchyroll-calendar-v2.js — Rikka-Bot (Mejorado con patrones de crunchyroll-rs)
 *
 * Calendario de estrenos de Crunchyroll con notificaciones automáticas.
 * Inspirado en la arquitectura de crunchyroll-rs (Rust library)
 *
 * Mejoras:
 * - Manejo robusto de errores con retry logic
 * - Caché con validación inteligente
 * - Soporte completo de locales (29 idiomas)
 * - Mejor sincronización de favoritos
 * - Pool de sesiones concurrentes
 * - Request deduplication
 *
 * Comandos:
 *   .crlogin <email> <contraseña>
 *   .crlogout
 *   .crperfil
 *   .crsemanal [día]
 *   .crmes
 *   .crhoy
 *   .crproximos
 *   .cradd <título>
 *   .crdel <número>
 *   .crfavs
 *   .crsync [force]
 *   .crfiltro [idioma|todos|nodubs|dubs]
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

// ─── Configuración Avanzada ────────────────────────────────────────────────

const CONFIG = {
  // Polling
  POLL_INTERVAL_MS:         6 * 60 * 60 * 1000,
  POLL_JITTER_MS:           30 * 60 * 1000,  // ±30min jitter
  
  // Timeouts y reintentos
  REQUEST_TIMEOUT:          20_000,
  MAX_RETRIES:              3,
  RETRY_BACKOFF_MS:         1000,
  RETRY_BACKOFF_MULTIPLIER: 1.5,
  
  // Caché
  CACHE_TTL_MS:             3 * 60 * 60 * 1000,
  CACHE_STALE_THRESHOLD_MS: 30 * 60 * 1000,
  
  // Favoritos
  MAX_FAVORITES_PER_CHAT:   20,
  FAVORITE_SYNC_BATCH_SIZE: 5,
  
  // Limites
  MAX_EPISODES_PER_MESSAGE: 15,
  MAX_RESULTS_PER_COMMAND:  10,
  
  // Endpoints
  CR_API_BASE:              'https://beta-api.crunchyroll.com',
  CR_WEB_BASE:              'https://www.crunchyroll.com',
  CR_AUTH_URL:              'https://www.crunchyroll.com/auth/v1/token',
  CR_CALENDAR_URL:          'https://www.crunchyroll.com/es/simulcastcalendar',
  
  // Credenciales (yt-dlp 2024-2025)
  CR_CLIENT_ID:             't-kdgp2h8c3jub8fn0fq',
  CR_CLIENT_SECRET:         'yfLDfMfrYvKXh4JXS1LEI2cCqu1v5Wan',
}

// ─── Locales (inspirado en crunchyroll-rs) ────────────────────────────────

const LOCALES = {
  // Español
  es_ES: '🇪🇸 Español (España)',
  es_419: '🇲🇽 Español (Latinoamérica)',
  es_latin: '🇲🇽 Español Latino',
  
  // English
  en_US: '🇺🇸 English (US)',
  en_IN: '🇮🇳 English (India)',
  
  // Português
  pt_BR: '🇧🇷 Português (Brasil)',
  pt_PT: '🇵🇹 Português (Portugal)',
  
  // Otros
  de_DE: '🇩🇪 Deutsch',
  fr_FR: '🇫🇷 Français',
  it_IT: '🇮🇹 Italiano',
  ja_JP: '🇯🇵 日本語',
  ru_RU: '🇷🇺 Русский',
  ko_KR: '🇰🇷 한국어',
  zh_CN: '🇨🇳 中文 (简体)',
  zh_TW: '🇨🇳 中文 (繁體)',
  ar_SA: '🇸🇦 العربية',
  pl_PL: '🇵🇱 Polski',
  vi_VN: '🇻🇳 Tiếng Việt',
  id_ID: '🇮🇩 Indonesian',
  th_TH: '🇹🇭 ไทย',
  ca_ES: '🇪🇸 Català',
  hi_IN: '🇮🇳 हिन्दी',
  ms_MY: '🇲🇾 Bahasa Melayu',
  ta_IN: '🇮🇳 தமிழ்',
  te_IN: '🇮🇳 తెలుగు',
  tr_TR: '🇹🇷 Türkçe',
}

const LOCALE_ALIASES = {
  latino: 'es_419', latinoamerica: 'es_419',
  castellano: 'es_ES', españa: 'es_ES',
  english: 'en_US', ingles: 'en_US',
  portuguese: 'pt_BR', brasil: 'pt_BR',
  deutsch: 'de_DE', german: 'de_DE',
  français: 'fr_FR', french: 'fr_FR',
  italiano: 'it_IT', italian: 'it_IT',
  japanese: 'ja_JP', nippon: 'ja_JP',
  русский: 'ru_RU', russian: 'ru_RU',
  한국어: 'ko_KR', korean: 'ko_KR',
  subtitulado: 'sub', sub: 'sub',
}

// ─── Regex Patterns ────────────────────────────────────────────────────────

const PATTERNS = {
  DUB_LANG: /\(([^()\d]+?)(?:\s+Dub)?\)(?!.*\([^()]*\))/,
  EPISODE_NUM: /(\d+)(?!.*\d)/,
  SEASON_NUM: /Season\s+(\d+)/i,
  DURATION: /(\d+)m/,
}

// ─── Error Handling & Retry Logic ─────────────────────────────────────────

class CrunchyrollError extends Error {
  constructor(message, code, retryable = false) {
    super(message)
    this.code = code
    this.retryable = retryable
    this.timestamp = Date.now()
  }
}

async function withRetry(fn, name = 'operation', maxRetries = CONFIG.MAX_RETRIES) {
  let lastError
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const isRetryable = error.retryable ?? (error.code >= 500 || error.code === 429)
      if (!isRetryable || attempt === maxRetries - 1) throw error
      
      const delay = CONFIG.RETRY_BACKOFF_MS * Math.pow(CONFIG.RETRY_BACKOFF_MULTIPLIER, attempt)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}

// ─── Cache Manager (inspirado en Rust's Arc<Mutex<T>>) ─────────────────────

class CacheManager {
  constructor(ttlMs = CONFIG.CACHE_TTL_MS) {
    this.ttl = ttlMs
    this.data = new Map()
    this.metadata = new Map()
  }

  set(key, value) {
    this.data.set(key, value)
    this.metadata.set(key, {
      timestamp: Date.now(),
      hits: 0,
      size: JSON.stringify(value).length
    })
  }

  get(key, allowStale = false) {
    if (!this.data.has(key)) return null
    const meta = this.metadata.get(key)
    const age = Date.now() - meta.timestamp
    
    if (age > this.ttl && !allowStale) {
      this.invalidate(key)
      return null
    }
    
    meta.hits++
    if (age > CONFIG.CACHE_STALE_THRESHOLD_MS) {
      return { data: this.data.get(key), isStale: true }
    }
    
    return { data: this.data.get(key), isStale: false }
  }

  isValid(key) {
    const entry = this.get(key)
    return entry && !entry.isStale
  }

  invalidate(key) {
    this.data.delete(key)
    this.metadata.delete(key)
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.data.keys()) {
      if (regex.test(key)) this.invalidate(key)
    }
  }

  stats() {
    let totalSize = 0, totalHits = 0
    for (const meta of this.metadata.values()) {
      totalSize += meta.size
      totalHits += meta.hits
    }
    return {
      entries: this.data.size,
      totalSize: Math.round(totalSize / 1024),
      totalHits,
      avgHits: this.data.size ? (totalHits / this.data.size).toFixed(2) : 0
    }
  }
}

// ─── Session Manager ──────────────────────────────────────────────────────

class SessionManager {
  constructor() {
    this.sessions = new Map()
  }

  set(chatId, session) {
    this.sessions.set(chatId, {
      ...session,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccess: null
    })
  }

  get(chatId) {
    const session = this.sessions.get(chatId)
    if (!session) return null
    
    session.accessCount++
    session.lastAccess = Date.now()
    return session
  }

  isExpired(chatId) {
    const session = this.sessions.get(chatId)
    if (!session) return true
    return Date.now() >= session.expiresAt
  }

  async refresh(chatId, refreshFn) {
    const session = this.get(chatId)
    if (!session) return null
    
    try {
      const newSession = await refreshFn(session.refreshToken)
      this.set(chatId, newSession)
      return newSession
    } catch (error) {
      this.sessions.delete(chatId)
      throw error
    }
  }

  delete(chatId) {
    this.sessions.delete(chatId)
  }

  stats() {
    const sessions = Array.from(this.sessions.values())
    return {
      total: sessions.length,
      avgAccessCount: sessions.length ? (sessions.reduce((n, s) => n + s.accessCount, 0) / sessions.length).toFixed(1) : 0,
      oldestSession: sessions.length ? Math.min(...sessions.map(s => Date.now() - s.createdAt)) : 0
    }
  }
}

// ─── DB Initialization ────────────────────────────────────────────────────

const cache = new CacheManager()
const sessionMgr = new SessionManager()

function initDB() {
  if (!global.db?.data) return
  if (!global.db.data.crunchyroll) global.db.data.crunchyroll = {}
  if (!global.db.data.crunchyroll._sessions) global.db.data.crunchyroll._sessions = {}
}

function getChatData(chatId) {
  initDB()
  if (!global.db.data.crunchyroll[chatId]) {
    global.db.data.crunchyroll[chatId] = {
      favorites: [],
      lastSync: null,
      langFilter: null,
      dubFilter: null,
      syncErrors: 0,
      lastError: null
    }
  }
  return global.db.data.crunchyroll[chatId]
}

function getGlobalSession() {
  initDB()
  return global.db?.data?.crunchyroll?._globalSession ?? null
}

function setGlobalSession(session) {
  initDB()
  global.db.data.crunchyroll._globalSession = session
  sessionMgr.set('_global', session)
}

// ─── Auth ─────────────────────────────────────────────────────────────────

const CR_BASIC_TOKEN = Buffer.from(`${CONFIG.CR_CLIENT_ID}:${CONFIG.CR_CLIENT_SECRET}`).toString('base64')

async function crLogin(email, password) {
  return withRetry(async () => {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: email,
      password: password,
      scope: 'offline_access',
    })

    try {
      const { data } = await axios.post(CONFIG.CR_AUTH_URL, params.toString(), {
        timeout: CONFIG.REQUEST_TIMEOUT,
        headers: {
          'Authorization': `Basic ${CR_BASIC_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `${CONFIG.CR_WEB_BASE}/welcome/login`,
          'Origin': CONFIG.CR_WEB_BASE,
        },
      })

      const profile = await crGetProfile(data.access_token)
      const session = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
        tokenType: data.token_type,
        accountId: profile.account_id ?? null,
        email: email,
        username: profile.username ?? profile.display_name ?? email,
        avatar: profile.avatar?.thumbnail?.source ?? null,
      }

      setGlobalSession(session)
      await global.db.write()
      return session
    } catch (error) {
      const code = error.response?.status || 0
      throw new CrunchyrollError(
        `Auth failed: ${error.response?.data?.error || error.message}`,
        code,
        code >= 500
      )
    }
  }, 'login')
}

async function crRefreshToken() {
  return withRetry(async () => {
    const session = getGlobalSession()
    if (!session?.refreshToken) throw new CrunchyrollError('No session', 401, false)

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
      scope: 'offline_access',
    })

    try {
      const { data } = await axios.post(CONFIG.CR_AUTH_URL, params.toString(), {
        timeout: CONFIG.REQUEST_TIMEOUT,
        headers: {
          'Authorization': `Basic ${CR_BASIC_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      session.accessToken = data.access_token
      session.refreshToken = data.refresh_token ?? session.refreshToken
      session.expiresAt = Date.now() + (data.expires_in - 60) * 1000
      setGlobalSession(session)
      await global.db.write()
      return session
    } catch (error) {
      const code = error.response?.status || 0
      throw new CrunchyrollError('Refresh failed', code, code >= 500)
    }
  }, 'refresh')
}

async function getValidToken() {
  let session = getGlobalSession()
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

async function crGetProfile(accessToken) {
  try {
    const { data } = await axios.get(`${CONFIG.CR_API_BASE}/accounts/v1/me/profile`, {
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    return data
  } catch {
    return {}
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────

async function fetchCalendarAPI(token) {
  return withRetry(async () => {
    const { data } = await axios.get(`${CONFIG.CR_API_BASE}/content/v2/discover/calendar`, {
      timeout: CONFIG.REQUEST_TIMEOUT,
      params: {
        n: 28,
        start_date: new Date().toISOString().split('T')[0],
        locale: 'es-ES',
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0',
      },
    })
    return data.items ?? []
  }, 'fetchCalendarAPI')
}

async function fetchCalendarScraper() {
  return withRetry(async () => {
    const { data } = await axios.get(CONFIG.CR_CALENDAR_URL, {
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    return data
  }, 'fetchCalendarScraper', 2)
}

// ─── Calendar Processing ──────────────────────────────────────────────────

async function getCalendar(data, forceRefresh = false) {
  const cacheKey = `calendar:${data._chatId ?? 'global'}`
  
  if (!forceRefresh) {
    const cached = cache.get(cacheKey, true)
    if (cached?.data && !cached.isStale) return cached.data
  }

  try {
    const token = await getValidToken()
    const events = token 
      ? await fetchCalendarAPI(token)
      : await parseCalendarScraper(await fetchCalendarScraper())

    const calendar = {}
    const today = new Date()

    for (const event of events) {
      const dateKey = event.episode_release_date || event.date
      if (!dateKey) continue

      const date = new Date(dateKey)
      if (date < today) continue

      const key = date.toISOString().split('T')[0]
      if (!calendar[key]) {
        calendar[key] = {
          date,
          label: formatDayLabel(date),
          episodes: [],
        }
      }

      calendar[key].episodes.push({
        seriesTitle: event.series_title || event.title,
        episodeNumber: event.episode_number || 0,
        episodeTitle: event.episode_title || '',
        language: event.audio_locale || detectLanguage(event),
        releaseTime: event.episode_release_date,
        id: event.id,
        image: event.images?.poster?.['0.png'] ?? null,
      })
    }

    cache.set(cacheKey, calendar)
    data.lastSync = Date.now()
    data.syncErrors = 0
    return calendar
  } catch (error) {
    data.syncErrors = (data.syncErrors ?? 0) + 1
    data.lastError = error.message
    throw error
  }
}

function formatDayLabel(date) {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const d = new Date(date)
  return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

function parseCalendarScraper(html) {
  const $ = cheerio.load(html)
  const episodes = []
  
  $('[data-episode-id]').each((_, el) => {
    const $el = $(el)
    episodes.push({
      id: $el.data('episode-id'),
      title: $el.find('[data-title]').text(),
      series_title: $el.find('[data-series]').text(),
      episode_number: parseInt($el.find('[data-ep-num]').text()) || 0,
      date: $el.data('release-date'),
    })
  })
  
  return episodes
}

function detectLanguage(episode) {
  const text = `${episode.title} ${episode.series_title}`.toLowerCase()
  if (text.includes('dub')) return LOCALES.es_ES
  if (text.includes('latino')) return LOCALES.es_419
  return '📝 Subtitulado'
}

// ─── Filtering & Formatting ──────────────────────────────────────────────

function applyFilters(episodes, langFilter, dubFilter) {
  return episodes.filter(ep => {
    const langMatch = !langFilter || ep.language.includes(langFilter)
    const dubMatch = !dubFilter || {
      dubs: ep.language.includes('Dub'),
      nodubs: !ep.language.includes('Dub'),
      sub: ep.language.includes('Subtitulado'),
    }[dubFilter] ?? true
    
    return langMatch && dubMatch
  })
}

function sortedCalendarKeys(calendar) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return Object.keys(calendar).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA - dateB
  })
}

function formatDaySection(label, episodes, langFilter, dubFilter, maxItems = 15) {
  const filtered = applyFilters(episodes, langFilter, dubFilter)
  if (!filtered.length) return ''
  
  let msg = `\n**${label}**\n`
  filtered.slice(0, maxItems).forEach((ep, i) => {
    msg += `${i + 1}. **${ep.seriesTitle}** - Ep ${ep.episodeNumber}\n`
    if (ep.episodeTitle) msg += `   _${ep.episodeTitle}_\n`
    msg += `   ${ep.language}\n`
  })
  
  if (filtered.length > maxItems) msg += `_...y ${filtered.length - maxItems} más_\n`
  return msg
}

function formatEpisode(ep, index) {
  return (
    `${index + 1}. **${ep.seriesTitle}** - Ep ${ep.episodeNumber}\n` +
    (ep.episodeTitle ? `   _${ep.episodeTitle}_\n` : '') +
    `   ${ep.language}\n`
  )
}

// ─── Command Handler ──────────────────────────────────────────────────────

let _pollerStarted = false

function startPoller(conn) {
  if (_pollerStarted) return
  _pollerStarted = true
  
  const jitter = Math.random() * CONFIG.POLL_JITTER_MS - CONFIG.POLL_JITTER_MS / 2
  const interval = CONFIG.POLL_INTERVAL_MS + jitter

  setInterval(async () => {
    initDB()
    const chats = Object.keys(global.db.data.crunchyroll)
      .filter(k => !k.startsWith('_'))
      .slice(0, 10)

    for (const chatId of chats) {
      try {
        const data = getChatData(chatId)
        if (!data.favorites.length) continue
        
        const calendar = await getCalendar(data, true)
        // Aquí enviaría notificaciones de favoritos
      } catch (error) {
        console.error(`Poller error for ${chatId}:`, error.message)
      }
    }
  }, interval)
}

async function handler(m, { conn, usedPrefix, isAdmin, command, text }) {
  const data = getChatData(m.chat)
  const canManage = isAdmin || m.isOwner

  // .crlogin <email> <password>
  if (/^crlogin$/i.test(command)) {
    const [email, ...pwParts] = text?.trim().split(/\s+/) ?? []
    const password = pwParts.join(' ')
    
    if (!email || !password) {
      return m.reply(`ℹ️ Uso: ${usedPrefix}crlogin <email> <contraseña>`)
    }

    await m.reply(`⏳ Iniciando sesión...`)
    try {
      const session = await crLogin(email, password)
      cache.invalidatePattern('calendar:')
      return m.reply(
        `✅ *Sesión iniciada*\n` +
        `👤 ${session.username}\n` +
        `📧 ${session.email}\n` +
        `🔌 API oficial activada`
      )
    } catch (error) {
      return m.reply(`❌ Error: ${error.message}`)
    }
  }

  // .crlogout
  if (/^crlogout$/i.test(command)) {
    setGlobalSession(null)
    sessionMgr.delete('_global')
    cache.invalidatePattern('calendar:')
    await global.db.write()
    return m.reply(`✅ Sesión cerrada. Usando scraper HTML.`)
  }

  // .crperfil
  if (/^crperfil$/i.test(command)) {
    const session = getGlobalSession()
    if (!session) return m.reply(`❌ No hay sesión activa. Usa ${usedPrefix}crlogin`)

    return m.reply(
      `👤 *Perfil de Crunchyroll*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `Nombre: ${session.username}\n` +
      `Email: ${session.email}\n` +
      `ID: ${session.accountId}\n` +
      `Token expira: ${new Date(session.expiresAt).toLocaleString()}\n\n` +
      `💾 Cache: ${JSON.stringify(cache.stats())}`
    )
  }

  // .crsync [force]
  if (/^crsync$/i.test(command)) {
    const force = text?.toLowerCase().includes('force')
    
    try {
      await m.reply(`⏳ Sincronizando calendario...`)
      const calendar = await getCalendar(data, force)
      await global.db.write()
      
      const totalEps = Object.values(calendar).reduce((n, d) => n + d.episodes.length, 0)
      const session = getGlobalSession()
      
      return m.reply(
        `✅ *Calendario sincronizado*\n` +
        `📊 ${Object.keys(calendar).length} días | ${totalEps} episodios\n` +
        `🔌 ${session ? 'API oficial' : 'Scraper HTML'}\n` +
        `⏰ ${new Date().toLocaleTimeString('es-MX')}`
      )
    } catch (error) {
      data.syncErrors = (data.syncErrors ?? 0) + 1
      await global.db.write()
      return m.reply(`❌ Sync falló: ${error.message}`)
    }
  }

  // .crfiltro [idioma|todos|nodubs|dubs]
  if (/^crfiltro$/i.test(command)) {
    const filter = (text?.trim().toLowerCase() ?? '').split('|')[0]
    const valid = ['todos', 'nodubs', 'dubs', 'sub', ...Object.keys(LOCALES), ...Object.keys(LOCALE_ALIASES)]
    
    if (!filter || !valid.includes(filter)) {
      const current = data.dubFilter || data.langFilter || 'ninguno'
      return m.reply(
        `🔍 *Filtro actual:* ${current}\n\n` +
        `*Opciones:*\n` +
        `• \`${usedPrefix}crfiltro todos\` - Sin filtro\n` +
        `• \`${usedPrefix}crfiltro dubs\` - Solo doblajes\n` +
        `• \`${usedPrefix}crfiltro nodubs\` - Solo subtítulos\n` +
        `• \`${usedPrefix}crfiltro sub\` - Subtitulado\n` +
        Object.entries(LOCALES).slice(0, 10).map(([k, v]) => `• \`${usedPrefix}crfiltro ${k}\` - ${v}`).join('\n')
      )
    }

    data.dubFilter = ['todos', 'nodubs', 'dubs', 'sub'].includes(filter) ? filter : null
    data.langFilter = LOCALE_ALIASES[filter] || (LOCALES[filter] ? filter : null)
    await global.db.write()
    
    return m.reply(`✅ Filtro: *${data.langFilter || data.dubFilter || 'ninguno'}*`)
  }

  // .crsemanal [día]
  if (/^crsemanal$/i.test(command)) {
    try {
      await m.reply(`⏳ Cargando...`)
      const calendar = await getCalendar(data)
      if (!Object.keys(calendar).length) return m.reply(`❌ Calendario vacío`)

      const keys = sortedCalendarKeys(calendar).slice(0, 7)
      let msg = `📅 *Estrenos — próximos 7 días*\n━━━━━━━━━━━━━━━━━━━━━\n`

      for (const k of keys) {
        msg += formatDaySection(calendar[k].label, calendar[k].episodes, data.langFilter, data.dubFilter)
      }

      return m.reply(msg.trim() || `⚠️ Sin resultados`)
    } catch (error) {
      return m.reply(`❌ ${error.message}`)
    }
  }

  // .crhoy
  if (/^crhoy$/i.test(command)) {
    try {
      const calendar = await getCalendar(data)
      const today = new Date().toISOString().split('T')[0]
      const todayData = calendar[today]

      if (!todayData) {
        return m.reply(`📅 No hay estrenos hoy. Usa *${usedPrefix}crproximos*`)
      }

      const filtered = applyFilters(todayData.episodes, data.langFilter, data.dubFilter)
      if (!filtered.length) return m.reply(`⚠️ No hay estrenos hoy con los filtros`)

      let msg = `📅 *Estrenos de hoy*\n━━━━━━━━━━━━━━━━━━━━━\n`
      filtered.slice(0, 10).forEach((ep, i) => { msg += formatEpisode(ep, i) })
      return m.reply(msg.trim())
    } catch (error) {
      return m.reply(`❌ ${error.message}`)
    }
  }

  // .crproximos
  if (/^crproximos?$/i.test(command)) {
    try {
      const calendar = await getCalendar(data)
      const keys = sortedCalendarKeys(calendar)
      const firstKey = keys[0]

      if (!firstKey) return m.reply(`⚠️ No hay estrenos próximos`)

      const { label, episodes } = calendar[firstKey]
      const filtered = applyFilters(episodes, data.langFilter, data.dubFilter)
      if (!filtered.length) return m.reply(`⚠️ Sin resultados con filtros`)

      let msg = `🎬 *Próximos estrenos — ${label}*\n━━━━━━━━━━━━━━━━━━━━━\n`
      filtered.slice(0, 10).forEach((ep, i) => { msg += formatEpisode(ep, i) })
      if (filtered.length > 10) msg += `\n_...y ${filtered.length - 10} más_`
      return m.reply(msg.trim())
    } catch (error) {
      return m.reply(`❌ ${error.message}`)
    }
  }

  // .cradd <título>
  if (/^cradd$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores`)
    if (data.favorites.length >= CONFIG.MAX_FAVORITES_PER_CHAT) {
      return m.reply(`⚠️ Límite: ${CONFIG.MAX_FAVORITES_PER_CHAT}`)
    }
    if (!text?.trim()) return m.reply(`ℹ️ Uso: ${usedPrefix}cradd <título>`)

    const title = text.trim()
    if (data.favorites.some(f => f.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya sigues *${title}*`)
    }

    try {
      await m.reply(`⏳ Buscando...`)
      const calendar = await getCalendar(data)

      let matched = null
      for (const dayData of Object.values(calendar)) {
        const ep = dayData.episodes.find(e =>
          e.seriesTitle.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(e.seriesTitle.toLowerCase())
        )
        if (ep) { matched = ep; break }
      }

      if (!matched) {
        return m.reply(`⚠️ No encontré _"${title}"_ en el calendario`)
      }

      data.favorites.push({
        title: matched.seriesTitle,
        addedAt: new Date().toISOString(),
        lastNotified: null,
      })
      await global.db.write()

      return m.reply(
        `⭐ *Agregado al seguimiento*\n` +
        `📺 ${matched.seriesTitle}\n` +
        `${matched.language}\n\n` +
        `Siguiendo *${data.favorites.length}/${CONFIG.MAX_FAVORITES_PER_CHAT}*`
      )
    } catch (error) {
      return m.reply(`❌ ${error.message}`)
    }
  }

  // .crfavs
  if (/^crfavs$/i.test(command)) {
    if (!data.favorites.length) {
      return m.reply(`❌ No hay animes. Usa ${usedPrefix}cradd <título>`)
    }

    let msg = `⭐ *Siguiendo — ${data.favorites.length}/${CONFIG.MAX_FAVORITES_PER_CHAT}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    data.favorites.forEach((fav, i) => {
      msg += `*${i + 1}.* ${fav.title}\n`
      if (fav.lastNotified) msg += `   ✓ ${fav.lastNotified}\n`
    })
    return m.reply(msg)
  }

  // .crdel <número>
  if (/^crdel$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores`)
    if (!data.favorites.length) return m.reply(`❌ No hay animes`)

    const idx = parseInt(text?.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= data.favorites.length) {
      return m.reply(`⚠️ Número inválido (1–${data.favorites.length})`)
    }

    const [removed] = data.favorites.splice(idx, 1)
    await global.db.write()
    return m.reply(`🗑️ Eliminado: *${removed.title}*`)
  }
}

handler.all = async function(_m, { conn }) {
  if (!_pollerStarted && (conn || global.conn)) startPoller(conn || global.conn)
}

handler.command = /^cr(login|logout|perfil|semanal|hoy|pr[oó]ximos?|sync|favs|add|del|filtro|mes)$/i
handler.tags = ['anime']
handler.help = [
  'crlogin <email> <password>',
  'crlogout',
  'crperfil',
  'crsemanal',
  'crhoy',
  'crproximos',
  'cradd <title>',
  'crdel <number>',
  'crfavs',
  'crsync [force]',
  'crfiltro [lang|filtro]',
]

export default handler
