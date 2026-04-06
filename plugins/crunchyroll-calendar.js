/**
 * crunchyroll-complete.js — Rikka-Bot
 *
 * 🎬 SISTEMA COMPLETO DE CRUNCHYROLL
 * - Autenticación con cookies
 * - Calendario de estrenos
 * - Descarga de episodios
 * - Envío de archivos
 * 
 * Comandos principales:
 *   .crlogin <email> <password>      → Iniciar sesión
 *   .crperfil                        → Ver perfil
 *   .crsemanal [día]                 → Estrenos de la semana
 *   .cradd <título>                  → Agregar a favoritos
 *   .crfavs                          → Ver favoritos
 *   .dcargarepisodio <URL>           → Descargar episodio
 *   .ddescargas                      → Ver descargas
 *   .denviarepisodio <número>        → Enviar archivo
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { execSync, exec } from 'child_process'

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // 📅 Calendario
  POLL_INTERVAL_MS: 6 * 60 * 60 * 1000,
  REQUEST_TIMEOUT: 20_000,
  MAX_FAVORITES_PER_CHAT: 20,
  CACHE_TTL_MS: 3 * 60 * 60 * 1000,

  // 📥 Descargas
  DOWNLOADS_DIR: './downloads/anime',
  TEMP_DIR: './downloads/temp',
  MAX_CONCURRENT_DOWNLOADS: 2,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_FORMATS: ['mp4', 'mkv', 'webm', 'ts'],
  DISCORD_MAX_FILE_SIZE: 8 * 1024 * 1024, // 8MB
  DOWNLOAD_TIMEOUT: 300_000, // 5 minutos

  // 🔐 Tokens
  TOKEN_FILE: './data/crunchyroll_token.json',
  COOKIES_FILE: './data/crunchyroll_cookies.json',
}

const API = {
  CR_API_BASE: 'https://beta-api.crunchyroll.com',
  CR_WEB_BASE: 'https://www.crunchyroll.com',
  CR_AUTH_URL: 'https://www.crunchyroll.com/auth/v1/token',
  CR_PROFILE: 'https://beta-api.crunchyroll.com/accounts/v1/me/profile',
  CR_SUBSCRIPTION: 'https://beta-api.crunchyroll.com/accounts/v1/subscription',
  CR_CALENDAR: 'https://beta-api.crunchyroll.com/content/v2/discover/calendar',
  CR_CALENDAR_WEB: 'https://www.crunchyroll.com/es/simulcastcalendar',
}

const AUTH = {
  CLIENT_ID: 't-kdgp2h8c3jub8fn0fq',
  CLIENT_SECRET: 'yfLDfMfrYvKXh4JXS1LEI2cCqu1v5Wan',
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  DEVICE_TYPE: 'web',
}

AUTH.BASIC_TOKEN = Buffer.from(`${AUTH.CLIENT_ID}:${AUTH.CLIENT_SECRET}`).toString('base64')

const LANG_LABEL = {
  latino: '🇲🇽 Español Latino',
  latinoamerica: '🇲🇽 Español Latino',
  españa: '🇪🇸 Español Castellano',
  castellano: '🇪🇸 Español Castellano',
  english: '🇺🇸 English',
  portuguese: '🇧🇷 Português',
  brasil: '🇧🇷 Português Brasil',
  deutsch: '🇩🇪 Deutsch',
  français: '🇫🇷 Français',
  italian: '🇮🇹 Italiano',
  russian: '🇷🇺 Русский',
  indonesian: '🇮🇩 Indonesian',
  japanese: '🇯🇵 日本語',
}

// Crear directorios si no existen
[CONFIG.DOWNLOADS_DIR, CONFIG.TEMP_DIR, './data'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 TOKEN & COOKIES
// ═══════════════════════════════════════════════════════════════════════════════

class CrToken {
  constructor(data = {}) {
    this.access_token = data.access_token || null
    this.refresh_token = data.refresh_token || null
    this.expires_in = data.expires_in || null
    this.token_type = data.token_type || 'Bearer'
    this.scope = data.scope || 'offline_access'
    this.account_id = data.account_id || null
    this.device_id = data.device_id || this.generateDeviceId()
    this.expires = new Date(data.expires || Date.now() + (data.expires_in || 3600) * 1000)
  }

  generateDeviceId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  isExpired() {
    return new Date() > this.expires
  }

  save(filePath = CONFIG.TOKEN_FILE) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(this, null, 2))
  }

  static load(filePath = CONFIG.TOKEN_FILE) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        return new CrToken(data)
      }
    } catch (e) {
      console.error('[CR-Auth] Error cargando token:', e.message)
    }
    return null
  }
}

class CookieManager {
  constructor() {
    this.cookies = {}
  }

  setCookie(domain, name, value, options = {}) {
    if (!this.cookies[domain]) this.cookies[domain] = {}
    this.cookies[domain][name] = {
      value,
      domain,
      path: options.path || '/',
      expires: options.expires || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      httpOnly: options.httpOnly !== false,
      secure: options.secure !== false,
    }
  }

  getCookie(domain, name) {
    if (this.cookies[domain]?.[name]) return this.cookies[domain][name].value
    return null
  }

  getCookieString(domain) {
    if (!this.cookies[domain]) return ''
    return Object.keys(this.cookies[domain])
      .map(name => `${name}=${this.cookies[domain][name].value}`)
      .join('; ')
  }

  setETPCookie(refreshToken, locale = 'en-US') {
    const domain = '.crunchyroll.com'
    this.setCookie(domain, 'etp_rt', refreshToken, { secure: true, httpOnly: true })
    this.setCookie(domain, 'c_locale', locale, { secure: true, httpOnly: true })
  }

  save(filePath = CONFIG.COOKIES_FILE) {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(this.cookies, null, 2))
  }

  load(filePath = CONFIG.COOKIES_FILE) {
    try {
      if (fs.existsSync(filePath)) {
        this.cookies = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    } catch (e) {
      console.error('[CR-Auth] Error cargando cookies:', e.message)
    }
  }
}

class CrProfile {
  constructor(data = {}) {
    this.username = data.username || '???'
    this.email = data.email || null
    this.avatar = data.avatar || null
    this.preferredContentAudioLanguage = data.preferredContentAudioLanguage || 'ja-JP'
    this.preferredContentSubtitleLanguage = data.preferredContentSubtitleLanguage || 'es-ES'
    this.hasPremium = data.hasPremium || false
    this.accountId = data.accountId || null
    this.profileId = data.profileId || null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔑 AUTENTICADOR
// ═══════════════════════════════════════════════════════════════════════════════

class CrunchyrollAuth {
  constructor() {
    this.token = null
    this.profile = new CrProfile()
    this.subscription = null
    this.cookieManager = new CookieManager()
    this.client = axios.create({ timeout: CONFIG.REQUEST_TIMEOUT, maxRedirects: 5 })

    this.loadSavedSession()
  }

  loadSavedSession() {
    this.token = CrToken.load()
    this.cookieManager.load()
  }

  async loginWithPassword(email, password) {
    try {
      console.log('[CR-Auth] 🔐 Login con contraseña...')

      const params = new URLSearchParams({
        grant_type: 'password',
        username: email,
        password: password,
        scope: 'offline_access',
      })

      const response = await this.client.post(API.CR_AUTH_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${AUTH.BASIC_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': AUTH.USER_AGENT,
          'Referer': `${API.CR_WEB_BASE}/welcome/login`,
          'Origin': API.CR_WEB_BASE,
        },
      })

      if (!response.data.access_token) throw new Error('No access_token')

      this.token = new CrToken({
        ...response.data,
        device_id: response.data.device_id || new CrToken().device_id,
      })

      if (this.token.refresh_token) {
        this.cookieManager.setETPCookie(this.token.refresh_token)
      }

      await this.getProfile(email)
      this.saveSession()

      console.log(`[CR-Auth] ✅ Login exitoso: ${this.profile.username}`)
      return { success: true, token: this.token, profile: this.profile }
    } catch (error) {
      console.error('[CR-Auth] ❌ Error:', error.response?.data?.error || error.message)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      }
    }
  }

  async getProfile(email = null) {
    if (!this.token?.access_token) {
      console.error('[CR-Auth] ❌ No hay access token')
      return false
    }

    try {
      const response = await this.client.get(API.CR_PROFILE, {
        headers: {
          'Authorization': `Bearer ${this.token.access_token}`,
          'User-Agent': AUTH.USER_AGENT,
          'Cookie': this.cookieManager.getCookieString('.crunchyroll.com'),
        },
      })

      this.profile = new CrProfile({
        username: response.data.username || response.data.display_name || '???',
        email: email || response.data.email || null,
        avatar: response.data.avatar?.thumbnail?.source || null,
        preferredContentAudioLanguage: response.data.preferred_content_audio_language || 'ja-JP',
        preferredContentSubtitleLanguage: response.data.preferred_content_subtitle_language || 'es-ES',
        accountId: response.data.account_id,
        profileId: response.data.profile_id,
      })

      await this.getSubscription()
      return true
    } catch (error) {
      console.error('[CR-Auth] ❌ Error obteniendo perfil:', error.message)
      return false
    }
  }

  async getSubscription() {
    if (!this.token?.access_token || !this.token.account_id) return false

    try {
      const response = await this.client.get(
        `${API.CR_SUBSCRIPTION}/${this.token.account_id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token.access_token}`,
            'User-Agent': AUTH.USER_AGENT,
            'Cookie': this.cookieManager.getCookieString('.crunchyroll.com'),
          },
        }
      )

      this.subscription = response.data
      const hasPremium = response.data.subscription_products?.length > 0 ||
                         response.data.third_party_subscription_products?.length > 0
      this.profile.hasPremium = hasPremium
      return true
    } catch (error) {
      console.error('[CR-Auth] ❌ Error suscripción:', error.message)
      return false
    }
  }

  isLoggedIn() {
    return this.token?.access_token && !this.token.isExpired()
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token?.access_token}`,
      'User-Agent': AUTH.USER_AGENT,
      'Cookie': this.cookieManager.getCookieString('.crunchyroll.com'),
    }
  }

  logout() {
    this.token = null
    this.profile = new CrProfile()
    this.subscription = null
    this.cookieManager = new CookieManager()

    try {
      fs.unlinkSync(CONFIG.TOKEN_FILE)
      fs.unlinkSync(CONFIG.COOKIES_FILE)
    } catch (e) {
      // Ignorar
    }
  }

  saveSession() {
    if (this.token) this.token.save()
    this.cookieManager.save()
  }

  getSessionInfo() {
    if (!this.token) return null
    return {
      username: this.profile.username,
      email: this.profile.email,
      hasPremium: this.profile.hasPremium,
      isExpired: this.token.isExpired(),
      expiresAt: this.token.expires,
      deviceId: this.token.device_id,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📥 DESCARGADOR DE EPISODIOS
// ═══════════════════════════════════════════════════════════════════════════════

class AnimeDownloadManager {
  constructor() {
    this.downloads = []
    this.activeDownloads = 0
    this.completedDownloads = []
  }

  createDownloadTask(episodeData) {
    return {
      id: this.generateId(),
      title: episodeData.title || 'Unknown Episode',
      series: episodeData.series || 'Unknown Series',
      episodeNumber: episodeData.episodeNumber || '0',
      url: episodeData.url,
      filePath: null,
      size: 0,
      progress: 0,
      status: 'queued',
      error: null,
      createdAt: new Date(),
      completedAt: null,
    }
  }

  addDownload(episodeData) {
    const task = this.createDownloadTask(episodeData)
    this.downloads.push(task)
    console.log(`[Download] ➕ ${task.title} (ID: ${task.id})`)
    return task
  }

  async fetchEpisodeInfo(url) {
    try {
      // Usar yt-dlp para obtener información
      const command = `yt-dlp -j --no-warnings "${url}"`
      const output = execSync(command, { timeout: 10000, encoding: 'utf-8' })
      const info = JSON.parse(output)

      return {
        title: info.title,
        series: info.series || info.uploader,
        episodeNumber: info.episode_number || '?',
        duration: info.duration,
        filesize: info.filesize || info.filesize_approx || 0,
        ext: info.ext,
      }
    } catch (error) {
      console.error('[Download] ❌ Error:', error.message)
      return null
    }
  }

  async downloadEpisode(task) {
    try {
      task.status = 'downloading'
      this.activeDownloads++

      const sanitizedTitle = `${task.series}_E${task.episodeNumber}`.replace(/[<>:"/\\|?*]/g, '_')
      const outputPath = path.join(CONFIG.DOWNLOADS_DIR, `${sanitizedTitle}.mp4`)

      const command = `yt-dlp -f "best[ext=mp4]" -o "${outputPath}" "${task.url}"`

      console.log(`[Download] 📥 ${task.title}...`)

      return new Promise((resolve, reject) => {
        exec(command, { timeout: CONFIG.DOWNLOAD_TIMEOUT }, (error, stdout, stderr) => {
          if (error) {
            task.status = 'error'
            task.error = error.message
            this.activeDownloads--
            return reject(new Error(`Descarga fallida: ${error.message}`))
          }

          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath)
            task.filePath = outputPath
            task.size = stats.size
            task.progress = 100
            task.status = 'completed'
            task.completedAt = new Date()
            this.activeDownloads--
            this.completedDownloads.push(task)

            console.log(`[Download] ✅ ${task.title}`)
            resolve(task)
          } else {
            task.status = 'error'
            task.error = 'Archivo no creado'
            this.activeDownloads--
            reject(new Error('Archivo no creado'))
          }
        })
      })
    } catch (error) {
      task.status = 'error'
      task.error = error.message
      this.activeDownloads--
      throw error
    }
  }

  async processQueue() {
    while (this.downloads.some(d => d.status === 'queued') && this.activeDownloads < CONFIG.MAX_CONCURRENT_DOWNLOADS) {
      const task = this.downloads.find(d => d.status === 'queued')
      if (task) {
        try {
          await this.downloadEpisode(task)
        } catch (error) {
          console.error(`[Download] ❌ Error:`, error.message)
        }
      }
    }
  }

  getDownloadStatus() {
    return {
      total: this.downloads.length,
      queued: this.downloads.filter(d => d.status === 'queued').length,
      downloading: this.downloads.filter(d => d.status === 'downloading').length,
      completed: this.downloads.filter(d => d.status === 'completed').length,
      errors: this.downloads.filter(d => d.status === 'error').length,
      active: this.activeDownloads,
    }
  }

  getDownloadedEpisodes() {
    const files = fs.readdirSync(CONFIG.DOWNLOADS_DIR)
    return files
      .filter(f => CONFIG.SUPPORTED_FORMATS.some(fmt => f.endsWith(fmt)))
      .map((file, idx) => ({
        index: idx + 1,
        name: file,
        path: path.join(CONFIG.DOWNLOADS_DIR, file),
        size: fs.statSync(path.join(CONFIG.DOWNLOADS_DIR, file)).size,
      }))
  }

  async sendFile(conn, chatId, filePath, caption = '') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('Archivo no existe')
      }

      const stats = fs.statSync(filePath)
      const fileName = path.basename(filePath)

      if (stats.size > CONFIG.DISCORD_MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Archivo muy grande (${this.formatFileSize(stats.size)})`,
        }
      }

      await conn.sendMessage(chatId, {
        document: fs.readFileSync(filePath),
        mimetype: this.getMimeType(filePath),
        fileName: fileName,
        caption: caption || `📺 ${fileName}`,
      })

      console.log(`[Download] 📤 Enviado: ${fileName}`)
      return { success: true, fileName, size: stats.size }
    } catch (error) {
      console.error('[Download] ❌ Error enviando:', error.message)
      return { success: false, error: error.message }
    }
  }

  deleteDownload(id) {
    const task = this.downloads.find(d => d.id === id) || this.completedDownloads.find(d => d.id === id)
    if (!task) return false

    try {
      if (task.filePath && fs.existsSync(task.filePath)) {
        fs.unlinkSync(task.filePath)
      }
      this.downloads = this.downloads.filter(d => d.id !== id)
      this.completedDownloads = this.completedDownloads.filter(d => d.id !== id)
      return true
    } catch (error) {
      console.error('[Download] ❌ Error eliminando:', error.message)
      return false
    }
  }

  generateId() {
    return 'dl_' + Math.random().toString(36).substring(2, 11)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    const mimes = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.ts': 'video/mp2t',
    }
    return mimes[ext] || 'video/mp4'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📅 CALENDARIO Y SCRAPER
// ═══════════════════════════════════════════════════════════════════════════════

let authInstance = null
let downloadManager = null

function getAuth() {
  if (!authInstance) authInstance = new CrunchyrollAuth()
  return authInstance
}

function getDownloadManager() {
  if (!downloadManager) downloadManager = new AnimeDownloadManager()
  return downloadManager
}

const DUB_LANG_REGEX = /\(([^()\d]+?)(?:\s+Dub)?\)(?!.*\([^()]*\))/
const EPISODE_NUMBER_REGEX = /(\d+)(?!.*\d)/

function shiftSunday(d) {
  return (d + 6) % 7
}

function sortedCalendarKeys(calendar) {
  const today = shiftSunday(new Date().getDay())
  return Object.keys(calendar).sort((a, b) => {
    const da = calendar[a].date ? shiftSunday(calendar[a].date.getDay()) : 0
    const db = calendar[b].date ? shiftSunday(calendar[b].date.getDay()) : 0
    return ((da - today + 7) % 7) - ((db - today + 7) % 7)
  })
}

async function fetchCalendarAPI(auth) {
  try {
    if (!auth.isLoggedIn()) {
      return {}
    }

    const response = await axios.get(API.CR_CALENDAR, {
      timeout: CONFIG.REQUEST_TIMEOUT,
      params: {
        n: 28,
        locale: 'es-419',
        preferred_audio_language: 'es-419',
      },
      headers: auth.getAuthHeaders(),
    })

    const calendar = {}

    for (const item of response.data.data ?? []) {
      const airDate = item.episode_air_date_utc ? new Date(item.episode_air_date_utc) : new Date()
      const dayKey = airDate.toISOString().split('T')[0]
      const dayLabel = airDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const language = audioLocaleToLabel(item.audio_locale ?? '')
      const thumbnail = item.images?.thumbnail?.[0]?.[0]?.source ??
                        item.images?.thumbnail?.[0]?.source ?? null
      const epNum = parseInt(item.episode_number ?? '-1', 10)

      const ep = {
        seriesTitle: (item.series_title ?? '').replace(/Season\s+\d+/i, '').trim(),
        episodeNumber: epNum,
        episodeStr: epNum >= 0 ? `Episodio ${epNum}` : '',
        episodeTitle: item.title ?? '',
        language,
        isDub: !item.audio_locale?.includes('ja-JP'),
        time: airDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        url: item.slug_title
          ? `https://www.crunchyroll.com/es/watch/${item.id}/${item.slug_title}`
          : null,
        img: thumbnail,
        isQueued: false,
        isPremiere: item.episode_number === '1',
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
  } catch (error) {
    console.error('[CR-Calendar] Error API:', error.message)
    return {}
  }
}

async function fetchCalendarScraper() {
  try {
    const response = await axios.get(API.CR_CALENDAR_WEB, {
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': AUTH.USER_AGENT,
        'Accept-Language': 'es-419,es;q=0.9',
      },
    })

    const $ = cheerio.load(response.data)
    const calendar = {}

    $('section.calendar-day').each((_, section) => {
      const $section = $(section)
      const datetime = $section.find('time').first().attr('datetime') ?? ''
      const dayDate = datetime ? new Date(datetime) : null
      const dayKey = dayDate
        ? dayDate.toISOString().split('T')[0]
        : $section.find('h2, h3').first().text().trim() || 'desconocido'
      const dayLabel = dayDate
        ? dayDate.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : dayKey

      const episodesInDay = []
      $section.find('li article.release.js-release').each((_, article) => {
        const $a = $(article)
        const $titleLink = $a.find('h1.season-name a.js-season-name-link')
        let seriesTitle = $titleLink.find('cite[itemprop="name"]').text().trim() ||
                          $titleLink.text().trim()
        seriesTitle = seriesTitle.replace(/Season\s+\d+/i, '').replace(/\s+/g, ' ').trim()

        const fullText = $a.text().trim()
        const language = detectLanguage(fullText)
        const $epLink = $a.find('a.available-episode-link')
        const epMatch = $epLink.text().trim().match(EPISODE_NUMBER_REGEX)
        const epNum = epMatch ? parseInt(epMatch[1], 10) : -1

        const $time = $a.find('time.available-time')
        const timeAttr = $time.attr('datetime') ?? ''
        const timeStr = timeAttr
          ? new Date(timeAttr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : $time.text().trim() || 'TBD'

        const href = $titleLink.attr('href') ?? $epLink.attr('href') ?? ''
        const url = href.startsWith('http') ? href : `https://www.crunchyroll.com${href}`
        const img = $a.find('img').first().attr('src') ??
                    $a.find('img').first().attr('data-src') ?? null

        if (seriesTitle && (epNum >= 0 || href)) {
          episodesInDay.push({
            seriesTitle,
            episodeNumber: epNum,
            episodeStr: epNum >= 0 ? `Episodio ${epNum}` : '',
            episodeTitle: '',
            language,
            isDub: isDub(fullText),
            time: timeStr,
            url,
            img,
            isQueued: !!$a.find('div.queue-flag.queued').length,
            isPremiere: !!$a.find('div.premiere-flag').length,
          })
        }
      })

      const deduped = deduplicateEpisodes(episodesInDay)
      if (deduped.length > 0) {
        calendar[dayKey] = { label: dayLabel, date: dayDate, episodes: deduped }
      }
    })

    return Object.keys(calendar).length > 0 ? calendar : {}
  } catch (error) {
    console.error('[CR-Calendar] Error scraper:', error.message)
    return {}
  }
}

async function fetchCalendar() {
  const auth = getAuth()

  if (auth.isLoggedIn()) {
    try {
      const result = await fetchCalendarAPI(auth)
      if (Object.keys(result).length > 0) return result
    } catch (error) {
      console.warn('[CR-Calendar] API falló, usando scraper:', error.message)
    }
  }

  return fetchCalendarScraper()
}

function audioLocaleToLabel(locale) {
  const map = {
    'es-419': '🇲🇽 Español Latino',
    'es-ES': '🇪🇸 Español Castellano',
    'en-US': '🇺🇸 English',
    'ja-JP': '📝 Subtitulado (JP)',
    'pt-BR': '🇧🇷 Português Brasil',
    'de-DE': '🇩🇪 Deutsch',
    'fr-FR': '🇫🇷 Français',
    'it-IT': '🇮🇹 Italiano',
    'ru-RU': '🇷🇺 Русский',
    'id-ID': '🇮🇩 Indonesian',
  }
  return map[locale] ?? '📝 Subtitulado'
}

function detectLanguage(title) {
  const match = DUB_LANG_REGEX.exec(title)
  const raw = match?.[1]?.trim()?.toLowerCase() ?? ''
  for (const [key, label] of Object.entries(LANG_LABEL)) {
    if (raw.includes(key)) return label
  }
  if (/\([^)]+\)/.test(title)) return '🌐 Doblaje'
  return '📝 Subtitulado'
}

function isDub(title) {
  return title.includes('Dub') || /[^(]*\(\D*\)[^(]*/g.test(title) || title.includes('Audio')
}

function deduplicateEpisodes(episodes) {
  const map = new Map()
  episodes.forEach(ep => {
    const key = ep.seriesTitle.toLowerCase()
    if (!map.has(key) || ep.episodeNumber > map.get(key).episodeNumber) {
      map.set(key, ep)
    }
  })
  return [...map.values()]
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💾 DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

function initDB() {
  if (!global.db?.data) return
  if (!global.db.data.crunchyroll) global.db.data.crunchyroll = {}
  if (!global.db.data.downloads) global.db.data.downloads = {}
}

function chatData(chatId) {
  initDB()
  if (!global.db.data.crunchyroll[chatId]) {
    global.db.data.crunchyroll[chatId] = {
      favorites: [],
      lastSync: null,
      cache: {},
      dubFilter: null,
    }
  }
  return global.db.data.crunchyroll[chatId]
}

function isCacheStale(data) {
  if (!data.lastSync) return true
  return Date.now() - new Date(data.lastSync).getTime() > CONFIG.CACHE_TTL_MS
}

async function getCalendar(data, forceRefresh = false) {
  if (forceRefresh || isCacheStale(data) || Object.keys(data.cache || {}).length === 0) {
    const fresh = await fetchCalendar()
    if (Object.keys(fresh).length > 0) {
      data.cache = fresh
      data.lastSync = new Date().toISOString()
    }
  }
  return data.cache || {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 FORMATEO
// ═══════════════════════════════════════════════════════════════════════════════

function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

function applyDubFilter(episodes, dubFilter) {
  if (!dubFilter || dubFilter === 'todos') return episodes
  if (dubFilter === 'nodubs') return episodes.filter(ep => !ep.isDub)
  if (dubFilter === 'dubs') return episodes.filter(ep => ep.isDub)
  return episodes.filter(ep => ep.language.toLowerCase().includes(dubFilter.toLowerCase()))
}

function formatEpisode(ep, idx) {
  let line = `*${idx + 1}.* 📺 ${ep.seriesTitle}\n`
  if (ep.episodeStr) line += `   🎬 ${ep.episodeStr}`
  if (ep.episodeTitle) line += ` — ${ep.episodeTitle}`
  if (ep.episodeStr || ep.episodeTitle) line += '\n'
  line += `   ${ep.language}\n`
  if (ep.time && ep.time !== 'TBD') line += `   🕐 ${ep.time}\n`
  if (ep.isPremiere) line += `   ✨ _ESTRENO_\n`
  return line
}

function formatDaySection(label, episodes, dubFilter, limit = 20) {
  const filtered = applyDubFilter(episodes, dubFilter)
  if (filtered.length === 0) return ''
  let msg = `\n*📅 ${capitalizeFirst(label)}*\n`
  filtered.slice(0, limit).forEach((ep, i) => {
    msg += formatEpisode(ep, i)
  })
  if (filtered.length > limit) msg += `   _...y ${filtered.length - limit} más_\n`
  return msg
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 COMANDOS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin, isROwner }) => {
  const chatId = m.chat
  const data = chatData(chatId)
  const canManage = isOwner || isAdmin || isROwner
  const dubFilter = data.dubFilter
  const auth = getAuth()
  const manager = getDownloadManager()

  // ─── AUTENTICACIÓN ────────────────────────────────────────────────────────

  if (/^crlogin$/i.test(command)) {
    if (!isOwner && !isROwner) return m.reply(`⛔ Solo el dueño puede iniciar sesión.`)

    const parts = text?.trim().split(/\s+/)
    if (!parts || parts.length < 2) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}crlogin <email> <contraseña>\n` +
        `⚠️ _Usa chat privado por seguridad._`
      )
    }

    const [email, ...passParts] = parts
    const password = passParts.join(' ')

    await m.reply(`⏳ Iniciando sesión...`)

    const result = await auth.loginWithPassword(email, password)
    if (result.success) {
      return m.reply(
        `✅ *Sesión iniciada*\n━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${result.profile.username}\n📧 ${result.profile.email}\n` +
        `💎 Premium: ${result.profile.hasPremium ? 'Sí' : 'No'}\n\n` +
        `🔑 Usando API oficial de Crunchyroll.`
      )
    } else {
      return m.reply(`❌ Error: ${result.error}`)
    }
  }

  if (/^crlogout$/i.test(command)) {
    if (!isOwner && !isROwner) return m.reply(`⛔ Solo el dueño.`)
    if (!auth.isLoggedIn()) return m.reply(`ℹ️ No hay sesión activa.`)
    auth.logout()
    await global.db.write()
    return m.reply(`✅ Sesión cerrada.`)
  }

  if (/^crperfil$/i.test(command)) {
    if (!auth.isLoggedIn()) {
      return m.reply(`❌ *Sin sesión activa*\nUsa \`${usedPrefix}crlogin\`.`)
    }
    const info = auth.getSessionInfo()
    return m.reply(
      `👤 *Perfil Crunchyroll*\n━━━━━━━━━━━━━━━━━━━━━\n` +
      `🧑 ${info.username}\n📧 ${info.email}\n` +
      `💎 Premium: ${info.hasPremium ? 'Sí' : 'No'}\n` +
      `🔑 Token: ${info.isExpired ? '🔴 Expirado' : '🟢 Activo'}`
    )
  }

  // ─── CALENDARIO ───────────────────────────────────────────────────────────

  if (/^crsync$/i.test(command)) {
    await m.reply(`⏳ Sincronizando...`)
    const calendar = await getCalendar(data, true)
    if (Object.keys(calendar).length === 0) {
      return m.reply(`❌ No se pudo obtener el calendario.`)
    }
    await global.db.write()
    const totalEps = Object.values(calendar).reduce((n, d) => n + d.episodes.length, 0)
    return m.reply(
      `✅ *Sincronizado*\n` +
      `📊 ${Object.keys(calendar).length} días | ${totalEps} episodios\n` +
      `🔌 ${auth.isLoggedIn() ? '✅ API oficial' : '🌐 Scraper'}`
    )
  }

  if (/^crsemanal$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    await m.reply(`⏳ Cargando...`)
    const dayFilter = text?.trim().toLowerCase()
    const keys = sortedCalendarKeys(calendar)
    const selected = dayFilter
      ? keys.filter(k => calendar[k].label.toLowerCase().includes(dayFilter))
      : keys.slice(0, 7)

    if (selected.length === 0) {
      return m.reply(`⚠️ No encontré estrenos para _"${text?.trim()}"_`)
    }

    let msg = `📅 *Estrenos — ${dayFilter ? capitalizeFirst(text.trim()) : '7 días'}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n`
    for (const k of selected) {
      msg += formatDaySection(calendar[k].label, calendar[k].episodes, dubFilter)
    }
    return m.reply(msg.trim() || `⚠️ Sin resultados.`)
  }

  if (/^crcrmes$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    const keys = sortedCalendarKeys(calendar)
    let msg = `📅 *Estrenos del Mes*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n`
    for (const k of keys) msg += formatDaySection(calendar[k].label, calendar[k].episodes, dubFilter, 10)
    return m.reply(msg.trim() || `⚠️ Sin resultados.`)
  }

  if (/^crhoy$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    const today = new Date()
    const todayKey = Object.keys(calendar).find(k =>
      calendar[k].date && calendar[k].date.toLocaleDateString() === today.toLocaleDateString()
    )

    if (!todayKey) {
      return m.reply(`📅 No hay estrenos hoy.`)
    }

    const { label, episodes } = calendar[todayKey]
    const filtered = applyDubFilter(episodes, dubFilter)
    if (filtered.length === 0) return m.reply(`⚠️ No hay estrenos hoy.`)

    let msg = `📅 *Estrenos de Hoy*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`
    filtered.forEach((ep, i) => {
      msg += formatEpisode(ep, i)
    })
    return m.reply(msg.trim())
  }

  if (/^crproximos$/i.test(command)) {
    const calendar = await getCalendar(data)
    if (Object.keys(calendar).length === 0) return m.reply(`❌ No se pudo obtener el calendario.`)

    const keys = sortedCalendarKeys(calendar)
    const firstKey = keys[0]
    if (!firstKey) return m.reply(`⚠️ No hay estrenos próximos.`)

    const { label, episodes } = calendar[firstKey]
    const filtered = applyDubFilter(episodes, dubFilter)
    if (filtered.length === 0) return m.reply(`⚠️ Sin resultados.`)

    let msg = `🎬 *Próximos Estrenos — ${capitalizeFirst(label)}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    if (dubFilter) msg += `🔍 Filtro: *${dubFilter}*\n\n`
    filtered.slice(0, 10).forEach((ep, i) => {
      msg += formatEpisode(ep, i)
    })
    if (filtered.length > 10) msg += `\n_...y ${filtered.length - 10} más_`
    return m.reply(msg.trim())
  }

  // ─── FAVORITOS ────────────────────────────────────────────────────────────

  if (/^cradd$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores.`)
    if (data.favorites.length >= CONFIG.MAX_FAVORITES_PER_CHAT) {
      return m.reply(`⚠️ Límite alcanzado (${CONFIG.MAX_FAVORITES_PER_CHAT}).`)
    }
    if (!text?.trim()) {
      return m.reply(`ℹ️ *Uso:* ${usedPrefix}cradd <título>\n*Ejemplo:* \`${usedPrefix}cradd Frieren\``)
    }

    const title = text.trim()
    if (data.favorites.some(f => f.title.toLowerCase() === title.toLowerCase())) {
      return m.reply(`⚠️ Ya estás siguiendo *${title}*.`)
    }

    await m.reply(`⏳ Buscando...`)
    const calendar = await getCalendar(data)

    let matchedEp = null,
        matchedDay = null
    for (const [, dayData] of Object.entries(calendar)) {
      const ep = dayData.episodes.find(ep =>
        ep.seriesTitle.toLowerCase().includes(title.toLowerCase())
      )
      if (ep) {
        matchedEp = ep
        matchedDay = dayData
        break
      }
    }

    if (!matchedEp) {
      return m.reply(`⚠️ No encontré _"${title}"_.`)
    }

    data.favorites.push({
      title: matchedEp.seriesTitle,
      addedAt: new Date().toISOString(),
      lastNotified: null,
    })
    await global.db.write()
    return m.reply(
      `⭐ *Agregado*\n━━━━━━━━━━━━━━━━━━━━━\n` +
      `📺 ${matchedEp.seriesTitle}\n` +
      `📅 Próximo: ${capitalizeFirst(matchedDay.label)}\n\n` +
      `Siguiendo *${data.favorites.length}/${CONFIG.MAX_FAVORITES_PER_CHAT}* animes.`
    )
  }

  if (/^crfavs$/i.test(command)) {
    if (!data.favorites.length) {
      return m.reply(`❌ No hay animes.\nUsa \`${usedPrefix}cradd <título}\`.`)
    }
    let msg = `⭐ *Seguimiento — ${data.favorites.length}/${CONFIG.MAX_FAVORITES_PER_CHAT}*\n━━━━━━━━━━━━━━━━━━━━━\n`
    data.favorites.forEach((fav, i) => {
      msg += `*${i + 1}.* ${fav.title}\n`
    })
    msg += `\n*Eliminar:* ${usedPrefix}crdel <número>`
    return m.reply(msg)
  }

  if (/^crdel$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores.`)
    if (!data.favorites.length) return m.reply(`❌ No hay animes.`)
    const idx = parseInt(text?.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= data.favorites.length) {
      return m.reply(`⚠️ Número inválido (1–${data.favorites.length})`)
    }
    const [removed] = data.favorites.splice(idx, 1)
    await global.db.write()
    return m.reply(`🗑️ Eliminado: *${removed.title}*`)
  }

  if (/^crfiltro$/i.test(command)) {
    const filter = text?.trim().toLowerCase() || ''
    const validos = ['todos', 'nodubs', 'dubs', 'latino', 'castellano', 'english', 'subtitulado']
    if (!filter || !validos.includes(filter)) {
      return m.reply(
        `🔍 *Filtro actual:* ${data.dubFilter || 'todos'}\n\n*Opciones:*\n` +
        validos.map(v => `• \`${usedPrefix}crfiltro ${v}\``).join('\n')
      )
    }
    data.dubFilter = filter === 'todos' ? null : filter
    await global.db.write()
    return m.reply(`✅ Filtro: *${data.dubFilter || 'todos'}*`)
  }

  // ─── DESCARGAS ────────────────────────────────────────────────────────────

  if (/^dcargarepisodio$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores.`)

    if (!text?.trim()) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}dcargarepisodio <URL de Crunchyroll>\n` +
        `📝 *Ejemplo:* \`${usedPrefix}dcargarepisodio https://www.crunchyroll.com/es/watch/...\``
      )
    }

    const url = text.trim()
    if (!url.includes('crunchyroll.com')) {
      return m.reply(`❌ URL inválida de Crunchyroll.`)
    }

    await m.reply(`⏳ Obteniendo información...`)

    try {
      const info = await manager.fetchEpisodeInfo(url)
      if (!info) {
        return m.reply(`❌ No se pudo obtener información.`)
      }

      const task = manager.addDownload({
        title: info.title,
        series: info.series,
        episodeNumber: info.episodeNumber,
        url: url,
      })

      setTimeout(() => manager.processQueue(), 1000)

      return m.reply(
        `✅ *Descarga iniciada*\n━━━━━━━━━━━━━━━━━━━━━\n` +
        `📺 ${info.series}\n🎬 Episodio ${info.episodeNumber}\n` +
        `📝 ${info.title}\n` +
        `💾 ${manager.formatFileSize(info.filesize)}\n\n` +
        `🆔 ID: \`${task.id}\`\n` +
        `🔍 Usa \`${usedPrefix}ddescargas\``
      )
    } catch (error) {
      return m.reply(`❌ Error: ${error.message}`)
    }
  }

  if (/^ddescargas$/i.test(command)) {
    const status = manager.getDownloadStatus()
    const downloads = manager.downloads.slice(-10)

    if (downloads.length === 0) {
      return m.reply(`📋 No hay descargas.`)
    }

    let msg = `📥 *Estado de Descargas*\n━━━━━━━━━━━━━━━━━━━━━\n` +
              `📊 Total: ${status.total} | ⏳ En cola: ${status.queued}\n` +
              `⬇️ Descargando: ${status.downloading} | ✅ Completadas: ${status.completed}\n` +
              `❌ Errores: ${status.errors}\n\n`

    downloads.forEach((dl, idx) => {
      const icon = { queued: '⏳', downloading: '⬇️', completed: '✅', error: '❌' }[dl.status]
      msg += `${icon} *${idx + 1}.* ${dl.series} - Ep ${dl.episodeNumber}\n`
      if (dl.status === 'downloading') msg += `   Progreso: ${dl.progress.toFixed(0)}%\n`
      if (dl.status === 'completed') msg += `   📦 ${manager.formatFileSize(dl.size)}\n`
    })

    return m.reply(msg)
  }

  if (/^dlistarobjetos$/i.test(command)) {
    const episodes = manager.getDownloadedEpisodes()

    if (episodes.length === 0) {
      return m.reply(`📋 No hay episodios descargados.`)
    }

    let msg = `📺 *Episodios Descargados*\n━━━━━━━━━━━━━━━━━━━━━\n`
    episodes.forEach(ep => {
      msg += `*${ep.index}.* ${ep.name}\n💾 ${manager.formatFileSize(ep.size)}\n`
    })

    msg += `\n📤 Usa: \`${usedPrefix}denviarepisodio <número>\``
    return m.reply(msg)
  }

  if (/^denviarepisodio$/i.test(command)) {
    const episodes = manager.getDownloadedEpisodes()

    if (episodes.length === 0) {
      return m.reply(`📋 No hay episodios disponibles.`)
    }

    if (!text?.trim()) {
      return m.reply(
        `ℹ️ *Uso:* ${usedPrefix}denviarepisodio <número>\n` +
        `Usa \`${usedPrefix}dlistarobjetos\` para ver disponibles.`
      )
    }

    const idx = parseInt(text.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= episodes.length) {
      return m.reply(`⚠️ Número inválido (1–${episodes.length})`)
    }

    const episode = episodes[idx]
    await m.reply(`⏳ Enviando ${episode.name}...`)

    const result = await manager.sendFile(
      conn,
      chatId,
      episode.path,
      `📺 ${episode.name}\n💾 ${manager.formatFileSize(episode.size)}`
    )

    if (result.success) {
      return m.reply(`✅ *Archivo enviado*\n📄 ${result.fileName}`)
    } else {
      return m.reply(`❌ Error: ${result.error}`)
    }
  }

  if (/^deliminar$/i.test(command)) {
    if (!canManage) return m.reply(`⛔ Solo administradores.`)

    const episodes = manager.getDownloadedEpisodes()
    if (episodes.length === 0) return m.reply(`📋 No hay episodios.`)

    if (!text?.trim()) {
      return m.reply(`ℹ️ *Uso:* ${usedPrefix}deliminar <número>`)
    }

    const idx = parseInt(text.trim()) - 1
    if (isNaN(idx) || idx < 0 || idx >= episodes.length) {
      return m.reply(`⚠️ Número inválido (1–${episodes.length})`)
    }

    const episode = episodes[idx]
    try {
      fs.unlinkSync(episode.path)
      return m.reply(`🗑️ Eliminado: ${episode.name}`)
    } catch (error) {
      return m.reply(`❌ Error: ${error.message}`)
    }
  }
}

handler.all = async function (m, { conn }) {
  const manager = getDownloadManager()
  if (global.downloadPollerStarted) return
  global.downloadPollerStarted = true
  setInterval(() => manager.processQueue(), 60000)
}

handler.command = /^(cr(login|logout|perfil|sync|semanal|mes|hoy|proximos?|add|favs|del|filtro)|d(cargarepisodio|descargas|listarobjetos|enviarepisodio|eliminar))$/i
handler.tags = ['anime']
handler.help = [
  'crlogin <email> <password>',
  'crlogout',
  'crperfil',
  'crsync',
  'crsemanal [día]',
  'crmes',
  'crhoy',
  'crproximos',
  'cradd <título>',
  'crfavs',
  'crdel <número>',
  'crfiltro [idioma]',
  'dcargarepisodio <URL>',
  'ddescargas',
  'dlistarobjetos',
  'denviarepisodio <número>',
  'deliminar <número>',
]

export default handler