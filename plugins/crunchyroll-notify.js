/**
 * crunchyroll-notify.js
 * Plugin para KanaArima-MD / Rikka-Bot (Baileys)
 * MODO: Sesión Protegida | CLIENTE: Android TV | IA Activa
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = join(__dirname, '../tmp')
const DB_PATH   = join(TMP_DIR, 'crunchyroll-seen.json')
const CFG_PATH  = join(TMP_DIR, 'crunchyroll-cfg.json')

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

const CR_API      = 'https://beta-api.crunchyroll.com'
const CR_AUTH_URL = `${CR_API}/auth/v1/token`
const AI_API      = 'https://api.causa-db.com/api/v1/ai?apikey=causa-db9690e010e31139'

/** * CREDENCIALES ANDROID TV
 * Suele ser un cliente con menos restricciones de seguridad que el móvil.
 */
const CR_BASIC    = 'Basic b2VkZHRyZ21ueG1jZnd6dzltY2s6Ym96Ym96Ym96Ym96Ym96Ym96Ym96Ym96Ym96Ym96Ym96Ym96' 
const USER_AGENT  = 'Crunchyroll/3.1.1 (Android TV; Android 11; Build/RP1A.200720.011)'

let _token = null; let _tokenExp = 0
let cronTimer = null
let isLoggedIn = false 

// ─── Persistencia ────────────────────────────────────────────────────────────
function loadCfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} } }
function saveCfg(data) { writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf-8') }
function loadSeen() { try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] } }
function saveSeen(ids) { writeFileSync(DB_PATH, JSON.stringify(ids.slice(-300)), 'utf-8') }

// ─── IA Sinopsis ─────────────────────────────────────────────────────────────
async function getAISynopsis(text) {
  try {
    const res = await fetch(AI_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Resume y mejora esta sinopsis de anime: ${text}` })
    })
    const data = await res.json()
    return data.result || text
  } catch { return text }
}

// ─── API Core con Retry ──────────────────────────────────────────────────────
async function getToken(retries = 3) {
  if (!isLoggedIn) throw new Error('SESION_REQUERIDA')
  if (_token && Date.now() < _tokenExp - 30000) return _token
  
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(CR_AUTH_URL, {
        method: 'POST',
        headers: { 
          'Authorization': CR_BASIC, 
          'Content-Type': 'application/x-www-form-urlencoded', 
          'User-Agent': USER_AGENT,
          'Accept-Language': 'es-419,es;q=0.9'
        },
        body: 'grant_type=client_credentials'
      })

      if (res.ok) {
        const data = await res.json()
        _token = data.access_token
        _tokenExp = Date.now() + (data.expires_in || 300) * 1000
        return _token
      }
      
      if (res.status === 401) {
        console.error(`[AUTH 401 - Android TV] Intento ${i + 1}/${retries} fallido.`)
        await new Promise(r => setTimeout(r, 5000))
      }
    } catch (e) {
      console.error(`[AUTH ERROR] ${e.message}`)
    }
  }
  throw new Error('No se pudo autenticar con las credenciales de Android TV.')
}

async function crFetch(path, params = {}) {
  const token = await getToken()
  const url = new URL(`${CR_API}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'User-Agent': USER_AGENT, 
      'Accept': 'application/json',
      'Accept-Language': 'es-419,es;q=0.9',
      'Connection': 'keep-alive'
    }
  })
  return res.json()
}

// ─── Formateador Visual (Estilo Imagen) ──────────────────────────────────────
async function formatCaption(p) {
  const id = p.id || '?'
  const link = `https://www.crunchyroll.com/es/watch/${id}/${p.slug_title || ''}`
  let desc = p.description || 'Sin sinopsis disponible.'
  if (desc.length < 15) desc = await getAISynopsis(`${p.series_title} - ${p.title}`)

  return `Anime: ${p.series_title || 'N/A'} | Z: GT00258001 | S: GS00258022JAJP

Título: '${p.title || 'N/A'}'
Episodio: ${p.episode_number ?? '?'} | ID: ${id} | Ext. ID: EPI.${id}

Categoría: Anime | Enlace: Crunchyroll
(${link})

Idioma: 🇯🇵
Subtítulos: 🇸🇦 🇩🇪 🇺🇸 🇲🇽 🇪🇸 🇫🇷 🇮🇹 🇧🇷 🇷🇺

Sinopsis: ${desc}`
}

// ─── Monitor Automático ──────────────────────────────────────────────────────
async function checkUpdates(conn) {
  if (!isLoggedIn) return
  const cfg = loadCfg()
  if (!cfg.targetJid) return

  try {
    const data = await crFetch('/content/v1/browse', { locale: 'es-419', sort_by: 'newly_added', n: '15', type: 'episode' })
    const items = (data?.items || data?.data || []).map(p => ({
      ...p,
      customId: p.id || p.slug_title,
      airTime: p.episode_air_date ? new Date(p.episode_air_date).getTime() : 0,
      image: p.images?.thumbnail?.[0]?.slice(-1)[0]?.source || p.images?.poster_tall?.[0]?.[0]?.source || ''
    }))

    const seen = loadSeen()
    const cutoff = Date.now() - 60 * 60000 
    const newItems = items.filter(i => i.airTime >= cutoff && !seen.includes(i.customId))

    for (const item of newItems) {
      const caption = await formatCaption(item)
      if (item.image) {
        await conn.sendMessage(cfg.targetJid, { image: { url: item.image }, caption })
      } else {
        await conn.sendMessage(cfg.targetJid, { text: caption })
      }
      await new Promise(r => setTimeout(r, 4000))
    }
    if (newItems.length > 0) saveSeen([...seen, ...newItems.map(i => i.customId)])
  } catch (e) {
    if (e.message !== 'SESION_REQUERIDA') console.error('[CR-TV-AUTO] Error:', e.message)
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
let handler = async (m, { conn, command, isOwner }) => {
  const cfg = loadCfg()

  if (command === 'crlogin') {
    if (!isOwner) return m.reply('⛔ Solo el administrador puede iniciar sesión.')
    isLoggedIn = true
    if (!cronTimer) cronTimer = setInterval(() => checkUpdates(conn), 15 * 60000)
    cfg.targetJid = m.chat
    saveCfg(cfg)
    m.reply('🔓 *Sesión iniciada (Android TV).* Monitor activo cada 15 min.')
    checkUpdates(conn)
    return
  }

  if (command === 'crlogout') {
    if (!isOwner) return m.reply('⛔ Solo el administrador puede cerrar sesión.')
    isLoggedIn = false
    _token = null
    if (cronTimer) { clearInterval(cronTimer); cronTimer = null }
    return m.reply('🔒 *Sesión cerrada.* Monitor Android TV desactivado.')
  }

  if (!isLoggedIn) return m.reply('🔑 Usa *.crlogin* para activar el sistema.')

  if (command === 'crstatus') {
    const seen = loadSeen()
    return m.reply(`📊 *CR-STATUS (TV)*\n\nSesión: *Activa*\nDestino: \`${cfg.targetJid}\`\nRegistros: *${seen.length}*\n🤖 IA: *Online*`)
  }

  if (command === 'crlist') {
    try {
      const data = await crFetch('/content/v1/browse', { locale: 'es-419', sort_by: 'newly_added', n: '10', type: 'episode' })
      const items = (data?.items || data?.data || [])
      let txt = '✨ *ESTRENOS RECIENTES (TV)* ✨\n\n'
      items.forEach((it, i) => txt += `${i + 1}. *${it.series_title}* (Ep ${it.episode_number})\n`)
      return m.reply(txt.trim())
    } catch (e) { return m.reply(`❌ Error: ${e.message}`) }
  }
}

handler.help    = ['crlogin', 'crlogout', 'crlist', 'crstatus']
handler.tags    = ['anime']
handler.command = /^(crlogin|crlogout|crlist|crstatus)$/i

export default handler
      
