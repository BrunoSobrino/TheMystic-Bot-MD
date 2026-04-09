/**
 * crunchyroll-notify.js — Plugin KanaArima-MD / Rikka-Bot (Baileys)
 * Modos: Anónimo (sin cuenta) | Cuenta real (con refresh automático)
 * Formato de salida idéntico a Telegram/Capturas del usuario.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = join(__dirname, '../tmp')
const DB_PATH   = join(TMP_DIR, 'crunchyroll-seen.json')
const CFG_PATH  = join(TMP_DIR, 'crunchyroll-cfg.json')
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

// ─── Constantes (crunchyroll-rs) ─────────────────────────────────────────────
const CR_BASE    = 'https://www.crunchyroll.com'
const CR_BETA    = 'https://beta-api.crunchyroll.com'
const CR_AUTH    = `${CR_BASE}/auth/v1/token`
// Token anónimo → grant_type=client_id
const BASIC_ANON = 'Basic dC1rZGdwMmg4YzNqdWI4Zm4wZnE6eWZMRGZNZnJZdktYaDRKWFMxTEVJMmNDcXUxdjVXYW4='
// Token con cuenta → grant_type=password (BASIC_AUTH_TOKEN en crunchyroll-rs)
const BASIC_AUTH = 'Basic eTJhcnZqYjBoMHJndnRpemxvdnk6SlZMdndkSXBYdnhVLXFJQnZUMU04b1FUcjFxbFFKWDI='
const CR_UA      = 'Crunchyroll/ANDROIDTV/3.59.0_22338 (Android 13.0; en-US; TCL-S5400AF Build/TP1A.220624.014)'
const DEVICE_ID  = '00000000-dead-beef-cafe-000000000000'
const DEVICE_TYPE= 'ANDROIDTV'

// ─── Persistencia ─────────────────────────────────────────────────────────────
function loadCfg()     { try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} } }
function saveCfg(d)    { writeFileSync(CFG_PATH, JSON.stringify(d, null, 2), 'utf-8') }
function loadSeen()    { try { return JSON.parse(readFileSync(DB_PATH,  'utf-8')) } catch { return [] } }
function saveSeen(ids) { writeFileSync(DB_PATH,  JSON.stringify(ids.slice(-300)), 'utf-8') }

// ─── Cookie jar (bypass Cloudflare) ──────────────────────────────────────────
let _cookies = ''
async function preLogin() {
  try {
    const res = await fetch(CR_BASE, { headers: { 'User-Agent': CR_UA }, signal: AbortSignal.timeout(15_000) })
    const raw = res.headers.getSetCookie?.() || []
    _cookies  = raw.map(c => c.split(';')[0]).join('; ')
  } catch { /* no crítico */ }
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
let _token = null, _tokenExp = 0

async function getAnonToken() {
  if (_token && Date.now() < _tokenExp - 30_000) return _token
  if (!_cookies) await preLogin()
  const body = new URLSearchParams({ grant_type: 'client_id', scope: 'offline_access', device_id: DEVICE_ID, device_type: DEVICE_TYPE })
  const res  = await fetch(CR_AUTH, {
    method: 'POST',
    headers: { 'Authorization': BASIC_ANON, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': CR_UA, 'ETP-Anonymous-ID': DEVICE_ID, 'Cookie': _cookies },
    body: body.toString(), signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`Auth anónima HTTP ${res.status}: ${t.slice(0,80)}`) }
  const data = await res.json()
  _token = data.access_token; _tokenExp = Date.now() + (data.expires_in || 300) * 1000
  return _token
}

async function loginWithAccount(email, password) {
  if (!_cookies) await preLogin()
  const body = new URLSearchParams({ grant_type: 'password', username: email, password, scope: 'offline_access', device_id: DEVICE_ID, device_type: DEVICE_TYPE })
  const res  = await fetch(CR_AUTH, {
    method: 'POST',
    headers: { 'Authorization': BASIC_AUTH, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': CR_UA, 'ETP-Anonymous-ID': DEVICE_ID, 'Cookie': _cookies },
    body: body.toString(), signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error_description || e.error || `HTTP ${res.status}`) }
  const data = await res.json()
  const cfg  = loadCfg()
  Object.assign(cfg, { accessToken: data.access_token, refreshToken: data.refresh_token || null, tokenExp: Date.now() + (data.expires_in || 300) * 1000, accountId: data.account_id || null, loggedIn: true })
  saveCfg(cfg); _token = data.access_token; _tokenExp = cfg.tokenExp
  return data
}

async function refreshAccountToken() {
  const cfg = loadCfg()
  if (!cfg.refreshToken) throw new Error('Sin refresh_token — usa .crlogin de nuevo')
  if (!_cookies) await preLogin()
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: cfg.refreshToken, scope: 'offline_access', device_id: DEVICE_ID, device_type: DEVICE_TYPE })
  const res  = await fetch(CR_AUTH, {
    method: 'POST',
    headers: { 'Authorization': BASIC_AUTH, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': CR_UA, 'Cookie': _cookies },
    body: body.toString(), signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Refresh HTTP ${res.status}`)
  const data = await res.json()
  cfg.accessToken  = data.access_token
  cfg.refreshToken = data.refresh_token || cfg.refreshToken
  cfg.tokenExp     = Date.now() + (data.expires_in || 300) * 1000
  saveCfg(cfg); _token = data.access_token; _tokenExp = cfg.tokenExp
  console.log('[CR-Notify] Token renovado.')
  return _token
}

async function getToken() {
  const cfg = loadCfg()
  if (cfg.loggedIn) {
    if (_token && Date.now() < _tokenExp - 30_000) return _token
    if (cfg.accessToken && cfg.tokenExp && Date.now() < cfg.tokenExp - 30_000) { _token = cfg.accessToken; _tokenExp = cfg.tokenExp; return _token }
    return refreshAccountToken()
  }
  return getAnonToken()
}

// ─── Fetch autenticado ────────────────────────────────────────────────────────
async function crFetch(path, params = {}, base = CR_BASE) {
  const token = await getToken()
  const url   = new URL(`${base}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res   = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': CR_UA, 'Accept': 'application/json', 'Cookie': _cookies },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`CR API HTTP ${res.status} → ${path}`)
  return res.json()
}

// ─── Imagen ───────────────────────────────────────────────────────────────────
function extractImage(images = {}) {
  const src = images.thumbnail || images.poster_tall || images.poster_wide
  if (!src) return ''
  if (typeof src === 'string') return src
  if (Array.isArray(src)) {
    const flat = src.flat().filter(Boolean)
    return flat.sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.source || ''
  }
  return ''
}

// ─── Normalizar episodio ──────────────────────────────────────────────────────
function normalizeEpisode(p) {
  const airRaw  = p.episode_air_date || p.premium_available_date || p.availability_starts || ''
  const airTime = airRaw ? new Date(airRaw).getTime() : 0
  const epNum   = p.episode_number ?? null
  const epId    = p.id || ''
  
  return {
    id: epId,
    series: p.series_title || '',
    seriesId: p.series_id || '-',
    seasonId: p.season_id || '-',
    epTitle: p.title || '',
    epNum: epNum !== null ? epNum : 'Especial',
    externalId: p.external_id || `EPI.${epId}`,
    link: `https://www.crunchyroll.com/es/watch/${epId}`,
    audioLocale: p.audio_locale || '',
    subtitles: Array.isArray(p.subtitle_locales) ? p.subtitle_locales : [],
    description: p.description || '',
    image: extractImage(p.images),
    airTime,
    title: p.title || ''
  }
}

// ─── Fetch episodios (Cron y Manual) ──────────────────────────────────────────
const ALLOWED_LOCALES = new Set(['ja-JP', 'es-419', 'es-ES'])

async function fetchNewEpisodes() {
  const cfg         = loadCfg()
  const lastMinutes = parseInt(process.env.CR_LAST_MINUTES ?? cfg.lastMinutes ?? '60')
  const cutoff      = Date.now() - lastMinutes * 60_000
  // Endpoint v1 en Beta para búsqueda de novedades
  const data     = await crFetch('/content/v1/browse', { count: '36', sort_by: 'newly_added', type: 'episode', locale: 'es-419' }, CR_BETA)
  const rows     = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : []
  
  const allItems = rows.map(normalizeEpisode).filter(i => i.id && i.title && ALLOWED_LOCALES.has(i.audioLocale))
  const recent   = allItems.filter(i => !i.airTime || i.airTime >= cutoff)
  
  if (!recent.length) return []
  
  const seen     = loadSeen()
  // Solo filtra por el ID exacto del video (permite que lleguen los distintos doblajes independientemente)
  const newItems = recent.filter(i => !seen.includes(i.id))
  
  if (newItems.length) saveSeen([...seen, ...newItems.map(i => i.id)])
  return newItems
}

async function getLatestEpisodes(limit = 10) {
  const data = await crFetch('/content/v1/browse', { count: '50', sort_by: 'newly_added', type: 'episode', locale: 'es-419' }, CR_BETA)
  const rows = Array.isArray(data?.items) ? data.items : []
  return rows
    .map(normalizeEpisode)
    .filter(i => ALLOWED_LOCALES.has(i.audioLocale))
    .slice(0, limit)
}

// ─── Formato Exacto ───────────────────────────────────────────────────────────
const FLAG = { 
  'ja-JP':'🇯🇵','en-US':'🇺🇸','es-419':'🇲🇽','es-ES':'🇪🇸','pt-BR':'🇧🇷',
  'fr-FR':'🇫🇷','de-DE':'🇩🇪','it-IT':'🇮🇹','ru-RU':'🇷🇺','ar-SA':'🇸🇦',
  'ar-ME':'🇸🇦','hi-IN':'🇮🇳','ko-KR':'🇰🇷','zh-CN':'🇨🇳','th-TH':'🇹🇭'
}

const LOCALE_NAME = {
  'ja-JP' : 'Japonés',
  'es-419': 'Español Latino',
  'es-ES' : 'Español España',
  'en-US' : 'Inglés',
  'pt-BR' : 'Portugués',
}

function formatCaption(ep) {
  const localeName = LOCALE_NAME[ep.audioLocale] || ep.audioLocale || 'Desconocido'
  const audioFlag = FLAG[ep.audioLocale] || '🌐'
  
  const subFlags = ep.subtitles && ep.subtitles.length > 0
    ? ep.subtitles.map(sub => FLAG[sub] || sub).join(', ')
    : 'Ninguno'

  const synopsis = ep.description ? `\n\nSinopsis: _${ep.description.trim()}_` : ''

  return (
    `Anime: ${ep.series} | Z: ${ep.seriesId} | S: ${ep.seasonId}\n` +
    `Título: '${ep.epTitle || 'Sin título'}'\n` +
    `Episodio: ${ep.epNum} | ID: ${ep.id} | Ext. ID: ${ep.externalId}\n` +
    `Categoría: Anime | Enlace: Crunchyroll\n` +
    `Idioma: ${localeName} ${audioFlag}\n` +
    `Subtítulos: ${subFlags}` +
    synopsis
  )
}

// ─── Envío ────────────────────────────────────────────────────────────────────
async function sendItem(conn, jid, ep, quoted = null) {
  const caption = formatCaption(ep)
  const opts    = quoted ? { quoted } : {}
  if (ep.image) {
    try { await conn.sendMessage(jid, { image: { url: ep.image }, caption }, opts); return } catch { /* fallback */ }
  }
  await conn.sendMessage(jid, { text: caption }, opts)
}
const delay = ms => new Promise(r => setTimeout(r, ms))

// ─── Cron ─────────────────────────────────────────────────────────────────────
let cronTimer = null, storedConn = null

function stopCron() { if (cronTimer) { clearInterval(cronTimer); cronTimer = null } }

function startCron(conn) {
  if (conn) storedConn = conn
  stopCron()
  const cfg     = loadCfg()
  const minutes = parseInt(process.env.CR_MINUTES ?? cfg.minutes ?? '30')
  const jid     = process.env.CR_TARGET_JID || cfg.targetJid || ''
  if (!jid) { console.log('[CR-Notify] Sin JID → cron en standby. Usa .crset'); return }
  cronTimer = setInterval(async () => {
    if (!storedConn) return
    try {
      const items = await fetchNewEpisodes()
      for (const ep of items) { await sendItem(storedConn, jid, ep); await delay(3000) }
      if (items.length) console.log(`[CR-Notify] ${items.length} ep(s) → ${jid}`)
    } catch (err) { console.error('[CR-Notify] Cron:', err.message) }
  }, minutes * 60_000)
  console.log(`[CR-Notify] Cron → cada ${minutes} min | ${jid}`)
}

// ─── Handler ──────────────────────────────────────────────────────────────────
let handler = async (m, { conn, command, args, isOwner }) => {
  storedConn = conn
  if (!cronTimer) startCron(conn)

  if (command === 'crlogin') {
    if (!isOwner) return conn.sendMessage(m.chat, { text: '⛔ Solo el dueño.' }, { quoted: m })
    const [email, pass] = args
    if (!email || !pass) return conn.sendMessage(m.chat, { text: '💡 Uso: *.crlogin email contraseña*' }, { quoted: m })
    await conn.sendMessage(m.chat, { text: '🔐 Conectando con Crunchyroll...' }, { quoted: m })
    try {
      await loginWithAccount(email, pass)
      const cfg = loadCfg(); cfg.targetJid = cfg.targetJid || m.chat; saveCfg(cfg)
      startCron(conn)
      return conn.sendMessage(m.chat, {
        text: `✅ *Login exitoso*\n👤 Cuenta real activa\n🎯 Canal: \`${cfg.targetJid}\`\n🔄 Monitor cada ${process.env.CR_MINUTES || cfg.minutes || 30} min\n🔁 Refresh automático habilitado`,
      }, { quoted: m })
    } catch (e) { return conn.sendMessage(m.chat, { text: `❌ *Auth fallida*\n${e.message}` }, { quoted: m }) }
  }

  if (command === 'crlogout') {
    if (!isOwner) return conn.sendMessage(m.chat, { text: '⛔ Solo el dueño.' }, { quoted: m })
    const { targetJid } = loadCfg(); saveCfg({ targetJid })
    _token = null; _tokenExp = 0; stopCron()
    return conn.sendMessage(m.chat, { text: '🔒 Sesión cerrada. Credenciales eliminadas.\nEl cron usará modo anónimo en el próximo comando.' }, { quoted: m })
  }

  if (command === 'crset') {
    if (!isOwner) return conn.sendMessage(m.chat, { text: '⛔ Solo el dueño.' }, { quoted: m })
    const cfg = loadCfg(); cfg.targetJid = m.chat; process.env.CR_TARGET_JID = m.chat; saveCfg(cfg)
    startCron(conn)
    return conn.sendMessage(m.chat, { text: `✅ *Canal configurado*\n\`${m.chat}\`` }, { quoted: m })
  }

  if (command === 'crstatus') {
    const cfg  = loadCfg()
    const jid  = process.env.CR_TARGET_JID || cfg.targetJid || '_no configurado_'
    const mins = process.env.CR_MINUTES || cfg.minutes || '30'
    const last = process.env.CR_LAST_MINUTES || cfg.lastMinutes || '60'
    const seen = loadSeen()
    const exp  = cfg.tokenExp ? new Date(cfg.tokenExp).toLocaleTimeString('es-MX', { timeZone:'America/Mexico_City' }) : '—'
    return conn.sendMessage(m.chat, {
      text: `📊 *CR-Notify Status*\n\n` +
            `🔑 Modo: *${cfg.loggedIn ? '👤 Cuenta real ✅' : '👻 Anónimo'}*\n` +
            `⏳ Token expira: *${exp}*\n` +
            `🔁 Refresh token: *${cfg.refreshToken ? 'Sí ✅' : 'No ❌'}*\n` +
            `🎯 Destino: \`${jid}\`\n` +
            `⏱ Cron: cada *${mins} min*\n` +
            `🕐 Ventana: últimos *${last} min*\n` +
            `💾 IDs caché: *${seen.length}*\n` +
            `🔄 Cron activo: *${cronTimer ? 'Sí ✅' : 'No ❌'}*`,
    }, { quoted: m })
  }

  if (command === 'crlist') {
    await conn.sendMessage(m.chat, { text: '🔍 Obteniendo los 10 lanzamientos más recientes...' }, { quoted: m })
    try {
      const episodes = await getLatestEpisodes(10)
      if (!episodes.length) return conn.sendMessage(m.chat, { text: '📭 No se encontraron episodios recientes.' }, { quoted: m })
      for (const ep of episodes) { await sendItem(conn, m.chat, ep, m); await delay(2000) }
    } catch (err) { await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m }) }
    return
  }

  if (command === 'crnotify') {
    await conn.sendMessage(m.chat, { text: '🔍 Buscando episodios nuevos...' }, { quoted: m })
    try {
      const items = await fetchNewEpisodes()
      if (!items.length) {
        const last = process.env.CR_LAST_MINUTES || loadCfg().lastMinutes || '60'
        return conn.sendMessage(m.chat, { text: `📭 No hay episodios nuevos en los últimos *${last} min*.` }, { quoted: m })
      }
      for (const ep of items) { await sendItem(conn, m.chat, ep, m); await delay(2000) }
    } catch (err) { await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m }) }
  }
}

handler.help    = ['crlogin <email> <pass>', 'crlogout', 'crset', 'crstatus', 'crlist', 'crnotify']
handler.tags    = ['anime']
handler.command = /^(crlogin|crlogout|crset|crstatus|crlist|crnotify)$/i

// ─── Restaurar al arrancar ────────────────────────────────────────────────────
;(async () => {
  const cfg = loadCfg()
  if (cfg.loggedIn && cfg.accessToken) { _token = cfg.accessToken; _tokenExp = cfg.tokenExp || 0 }
  const jid = process.env.CR_TARGET_JID || cfg.targetJid || ''
  if (jid) console.log(`[CR-Notify] Listo. JID: ${jid} | Modo: ${cfg.loggedIn ? 'Cuenta' : 'Anónimo'}`)
})()

export default handler
                                    
