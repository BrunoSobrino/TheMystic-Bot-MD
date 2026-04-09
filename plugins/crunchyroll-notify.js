/**
 * crunchyroll-notify.js
 * Plugin para KanaArima-MD / Rikka-Bot (Baileys)
 * MODO: 100% Automático Permanente con Status y Lista
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
const CR_BASIC    = 'Basic d2p3eW1yeWd4M2V4Znd6N2p2anI6' 
const USER_AGENT  = 'Crunchyroll/3.62.2 Android/14 okhttp/4.12.0'

let _token = null; let _tokenExp = 0
let cronTimer = null

// ─── Persistencia ────────────────────────────────────────────────────────────
function loadCfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} } }
function saveCfg(data) { writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf-8') }
function loadSeen() { try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] } }
function saveSeen(ids) { writeFileSync(DB_PATH, JSON.stringify(ids.slice(-300)), 'utf-8') }

// ─── API Core ────────────────────────────────────────────────────────────────
async function getToken() {
  if (_token && Date.now() < _tokenExp - 30000) return _token
  const res = await fetch(CR_AUTH_URL, {
    method: 'POST',
    headers: { 'Authorization': CR_BASIC, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
    body: 'grant_type=client_credentials'
  })
  if (!res.ok) throw new Error(`Auth Falló: ${res.status}`)
  const data = await res.json()
  _token = data.access_token
  _tokenExp = Date.now() + (data.expires_in || 300) * 1000
  return _token
}

async function crFetch(path, params = {}) {
  const token = await getToken()
  const url = new URL(`${CR_API}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': USER_AGENT, 'Accept': 'application/json' }
  })
  return res.json()
}

// ─── Formateador Visual ──────────────────────────────────────────────────────
function formatCaption(p) {
  const id = p.id || '?'
  const slug = p.slug_title || p.slug || ''
  const link = `https://www.crunchyroll.com/es/watch/${id}/${slug}`
  
  return `Anime: ${p.series_title || 'N/A'} | Z: GT00258001 | S: GS00258022JAJP

Título: '${p.title || 'N/A'}'
Episodio: ${p.episode_number ?? '?'} | ID: ${id} | Ext. ID: EPI.${id}

Categoría: Anime | Enlace: Crunchyroll
(${link})

Idioma: 🇯🇵
Subtítulos: 🇸🇦 🇩🇪 🇺🇸 🇲🇽 🇪🇸 🇫🇷 🇮🇹 🇧🇷 🇷🇺

Sinopsis: ${p.description || 'Sin sinopsis.'}`
}

// ─── Monitor Automático (Cada 15 min) ────────────────────────────────────────
async function checkUpdates(conn) {
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
      const caption = formatCaption(item)
      if (item.image) {
        await conn.sendMessage(cfg.targetJid, { image: { url: item.image }, caption })
      } else {
        await conn.sendMessage(cfg.targetJid, { text: caption })
      }
      await new Promise(r => setTimeout(r, 3000))
    }
    if (newItems.length > 0) saveSeen([...seen, ...newItems.map(i => i.customId)])
  } catch (e) { console.error('[CR-AUTO] Error:', e.message) }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
let handler = async (m, { conn, command }) => {
  const cfg = loadCfg()
  
  // Iniciar ciclo automático
  if (!cronTimer) {
    cronTimer = setInterval(() => checkUpdates(conn), 15 * 60000)
    if (!cfg.targetJid) {
        cfg.targetJid = m.chat
        saveCfg(cfg)
    }
  }

  // COMANDO: .crstatus
  if (command === 'crstatus') {
    const seen = loadSeen()
    return m.reply(`📊 *CR-SYSTEM STATUS*
    
🔄 Monitor: *Activo (15m)*
🎯 Destino: \`${cfg.targetJid || 'No definido'}\`
💾 Base de datos: *${seen.length} IDs*
📱 Cliente: *Android (v3.62.2)*`)
  }

  // COMANDO: .crlist
  if (command === 'crlist') {
    await m.reply('🕒 Obteniendo los últimos 10...')
    try {
      const data = await crFetch('/content/v1/browse', { locale: 'es-419', sort_by: 'newly_added', n: '10', type: 'episode' })
      const items = (data?.items || data?.data || [])
      let txt = '✨ *ESTRENOS RECIENTES* ✨\n\n'
      items.forEach((it, i) => txt += `${i + 1}. *${it.series_title}* (Ep ${it.episode_number})\n`)
      return m.reply(txt.trim())
    } catch (e) { return m.reply(`❌ Error: ${e.message}`) }
  }
}

handler.help    = ['crlist', 'crstatus']
handler.tags    = ['anime']
handler.command = /^(crlist|crstatus)$/i

export default handler
      
