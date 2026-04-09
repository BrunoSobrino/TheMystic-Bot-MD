/**
 * crunchyroll-notify.js
 * Plugin para KanaArima-MD / Rikka-Bot (Baileys)
 * Comandos: .cr yes (Activar) / .cr not (Desactivar)
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

// ─── Utilidades ──────────────────────────────────────────────────────────────
function loadCfg() { try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} } }
function saveCfg(data) { writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf-8') }
function loadSeen() { try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] } }
function saveSeen(ids) { writeFileSync(DB_PATH, JSON.stringify(ids.slice(-300)), 'utf-8') }

// ─── Auth ────────────────────────────────────────────────────────────────────
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
  const link = `https://www.crunchyroll.com/es/watch/${id}/${p.slug_title || ''}`
  
  return `Anime: ${p.series_title || 'N/A'} | Z: GT00258001 | S: GS00258022JAJP

Título: '${p.title || 'N/A'}'
Episodio: ${p.episode_number ?? '?'} | ID: ${id} | Ext. ID: EPI.${id}

Categoría: Anime | Enlace: Crunchyroll
(${link})

Idioma: 🇯🇵
Subtítulos: 🇸🇦 🇩🇪 🇺🇸 🇲🇽 🇪🇸 🇫🇷 🇮🇹 🇧🇷 🇷🇺

Sinopsis: ${p.description || 'Sin sinopsis.'}`
}

// ─── Monitor Automático ──────────────────────────────────────────────────────
async function checkUpdates(conn) {
  const cfg = loadCfg()
  if (!cfg.active || !cfg.targetJid) return

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
let handler = async (m, { conn, args, isOwner }) => {
  const cfg = loadCfg()
  
  // Inicialización del temporizador si no existe
  if (!cronTimer) {
    cronTimer = setInterval(() => checkUpdates(conn), 15 * 60000) 
    console.log('[CR-AUTO] Ciclo de 15 min iniciado.')
  }

  const action = (args[0] || '').toLowerCase()

  // COMANDO: .cr yes (Activar)
  if (action === 'yes') {
    if (!isOwner) return
    cfg.targetJid = m.chat
    cfg.active = true
    saveCfg(cfg)
    m.reply('✅ *Notificaciones Crunchyroll ACTIVADAS* en este chat.')
    checkUpdates(conn)
    return
  }

  // COMANDO: .cr not (Desactivar)
  if (action === 'not') {
    if (!isOwner) return
    cfg.active = false
    saveCfg(cfg)
    return m.reply('❌ *Notificaciones Crunchyroll DESACTIVADAS*.')
  }

  // Si solo pone .cr muestra el estado
  m.reply(`📊 *Sistema Crunchyroll*\n\nEstado: ${cfg.active ? '✅ Activo' : '❌ Inactivo'}\nChat: ${cfg.targetJid || 'Ninguno'}`)
}

handler.help    = ['cr yes', 'cr not']
handler.tags    = ['anime']
handler.command = /^cr$/i

export default handler
                         
