/**
 * crunchyroll-notify.js — Plugin KanaArima-MD / Rikka-Bot (Baileys)
 * Modos: Anónimo (sin cuenta) | Cuenta real (con refresh automático)
 * Filtro estricto: Solo Japonés, Latino y Castellano.
 * Formato: Corto y ultra limpio.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = join(__dirname, '../tmp')
const DB_PATH   = join(TMP_DIR, 'crunchyroll-seen.json')
const CFG_PATH  = join(TMP_DIR, 'crunchyroll-cfg.json')
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

// ─── Constantes ──────────────────────────────────────────────────────────────
const CR_BASE    = 'https://www.crunchyroll.com'
const CR_BETA    = 'https://beta-api.crunchyroll.com'
const CR_AUTH    = `${CR_BASE}/auth/v1/token`
const BASIC_ANON = 'Basic dC1rZGdwMmg4YzNqdWI4Zm4wZnE6eWZMRGZNZnJZdktYaDRKWFMxTEVJMmNDcXUxdjVXYW4='
const BASIC_AUTH = 'Basic eTJhcnZqYjBoMHJndnRpemxvdnk6SlZMdndkSXBYdnhVLXFJQnZUMU04b1FUcjFxbFFKWDI='
const CR_UA      = 'Crunchyroll/ANDROIDTV/3.59.0_22338 (Android 13.0; en-US; TCL-S5400AF Build/TP1A.220624.014)'
const DEVICE_ID  = '00000000-dead-beef-cafe-000000000000'
const DEVICE_TYPE= 'ANDROIDTV'

// ─── Persistencia ─────────────────────────────────────────────────────────────
function loadCfg()     { try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} } }
function saveCfg(d)    { writeFileSync(CFG_PATH, JSON.stringify(d, null, 2), 'utf-8') }
function loadSeen()    { try { return JSON.parse(readFileSync(DB_PATH,  'utf-8')) } catch { return [] } }
function saveSeen(ids) { writeFileSync(DB_PATH,  JSON.stringify(ids.slice(-500)), 'utf-8') }

// ─── Cookie jar ──────────────────────────────────────────────────────────────
let _cookies = ''
async function preLogin() {
  try {
    const res = await fetch(CR_BASE, { headers: { 'User-Agent': CR_UA }, signal: AbortSignal.timeout(15_000) })
    const raw = res.headers.getSetCookie?.() || []
    _cookies  = raw.map(c => c.split(';')[0]).join('; ')
  } catch { }
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
let _token = null, _tokenExp = 0

async function getToken() {
  const cfg = loadCfg()
  if (cfg.loggedIn && _token && Date.now() < _tokenExp - 30_000) return _token
  if (_token && Date.now() < _tokenExp - 30_000) return _token
  if (!_cookies) await preLogin()
  const body = new URLSearchParams({ grant_type: 'client_id', scope: 'offline_access', device_id: DEVICE_ID, device_type: DEVICE_TYPE })
  const res  = await fetch(CR_AUTH, {
    method: 'POST',
    headers: { 'Authorization': BASIC_ANON, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': CR_UA, 'ETP-Anonymous-ID': DEVICE_ID, 'Cookie': _cookies },
    body: body.toString(),
  })
  const data = await res.json()
  _token = data.access_token; _tokenExp = Date.now() + (data.expires_in || 300) * 1000
  return _token
}

async function crFetch(path, params = {}, base = CR_BASE) {
  const token = await getToken()
  const url   = new URL(`${base}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res   = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': CR_UA, 'Accept': 'application/json', 'Cookie': _cookies },
    signal: AbortSignal.timeout(20_000),
  })
  return res.json()
}

// ─── Procesamiento ────────────────────────────────────────────────────────────
function normalizeEpisode(p) {
  const meta = p.episode_metadata || {}
  const epId = p.id || ''
  let locale = p.audio_locale || meta.audio_locale || ''
  if (!locale && epId) {
    if (epId.endsWith('JAJP')) locale = 'ja-JP'
    else if (epId.endsWith('ES419') || epId.endsWith('LA')) locale = 'es-419'
    else if (epId.endsWith('ESES')) locale = 'es-ES'
  }
  let series = p.series_title || meta.series_title || p.title || 'Anime'
  const season = p.season_title || meta.season_title || ''
  if (season && !series.includes(season)) series += ` ${season}`

  return {
    id: epId,
    series: series.trim(),
    epTitle: p.title || '',
    epNum: p.episode_number ?? meta.episode_number ?? 'Especial',
    link: `https://www.crunchyroll.com/watch/${epId}/${p.slug_title || meta.slug_title || ''}`,
    audioLocale: locale,
    image: (p.images?.thumbnail || p.images?.poster_tall || p.images?.poster_wide)?.[0]?.[0]?.source || '',
    airTime: new Date(p.episode_air_date || p.premium_available_date || Date.now()).getTime()
  }
}

const FLAG = { 'ja-JP':'🇯🇵', 'es-419':'🇲🇽', 'es-LA':'🇲🇽', 'es-ES':'🇪🇸' }
const LOCALE_NAME = { 'ja-JP':'Japonés', 'es-419':'Español Latino', 'es-LA':'Español Latino', 'es-ES':'Español Castellano' }
const ALLOWED_LOCALES = new Set(['ja-JP', 'es-419', 'es-LA', 'es-ES'])

function formatCaption(ep) {
  const epLine = ep.epNum !== 'Especial' ? `Episodio ${ep.epNum}${ep.epTitle ? ` - ${ep.epTitle}` : ''}` : `Episodio Especial: ${ep.epTitle}`
  return `📺 ${ep.series}\n🎬 ${epLine}\n${FLAG[ep.audioLocale] || '🌐'} ${LOCALE_NAME[ep.audioLocale] || 'Desconocido'}\n\n${ep.link}`
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchNewEpisodes(forceWindow = null) {
  const cfg = loadCfg()
  // Ventana de tiempo: Usamos 1440 min (24h) si es la primera vez o si se fuerza
  const lastMinutes = forceWindow || parseInt(process.env.CR_LAST_MINUTES ?? cfg.lastMinutes ?? '1440')
  const cutoff = Date.now() - lastMinutes * 60_000
  const data = await crFetch('/content/v1/browse', { count: '100', sort_by: 'newly_added', type: 'episode', locale: 'es-419' }, CR_BETA)
  const items = (data?.items || []).map(normalizeEpisode).filter(i => ALLOWED_LOCALES.has(i.audioLocale) && i.airTime >= cutoff)
  
  const seen = loadSeen()
  const newItems = items.filter(i => !seen.includes(i.id))
  if (newItems.length) saveSeen([...seen, ...newItems.map(i => i.id)])
  return newItems
}

// ─── Comandos ─────────────────────────────────────────────────────────────────
let cronTimer = null, storedConn = null

let handler = async (m, { conn, command, isOwner }) => {
  storedConn = conn
  if (command === 'crset') {
    if (!isOwner) return m.reply('⛔')
    const cfg = loadCfg(); cfg.targetJid = m.chat; saveCfg(cfg)
    startCron(conn)
    return m.reply('✅ Destino configurado.')
  }

  if (command === 'crstatus') {
    const cfg = loadCfg(); const seen = loadSeen()
    return m.reply(`📊 *Status*\n🎯 Destino: ${cfg.targetJid || 'No'}\n💾 Caché: ${seen.length}\n🔄 Cron: ${cronTimer ? 'Activo ✅' : 'Apagado ❌'}`)
  }

  if (command === 'crlist' || command === 'crnotify') {
    m.reply('🔍 Buscando...')
    const items = await fetchNewEpisodes(command === 'crlist' ? 1440 : 60)
    if (!items.length) return m.reply('📭 Nada nuevo.')
    for (const ep of items) {
      await conn.sendMessage(m.chat, { text: formatCaption(ep) }, { quoted: m })
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

handler.command = /^(crset|crstatus|crlist|crnotify)$/i

// ─── Cron ─────────────────────────────────────────────────────────────────────
function startCron(conn) {
  if (cronTimer) clearInterval(cronTimer)
  cronTimer = setInterval(async () => {
    if (!conn) return
    try {
      const items = await fetchNewEpisodes(15) // Cada 15 min revisa lo último
      const cfg = loadCfg()
      if (cfg.targetJid) {
        for (const ep of items) {
          await conn.sendMessage(cfg.targetJid, { text: formatCaption(ep) })
          await new Promise(r => setTimeout(r, 3000))
        }
      }
    } catch (e) { console.error(e) }
  }, 5 * 60_000)
}

export default handler
      
