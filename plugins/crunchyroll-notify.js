/**
 * crunchyroll-notify.js
 * Plugin para KanaArima-MD / Rikka-Bot (Baileys)
 *
 * Variables de entorno (.env):
 *   CR_MINUTES       → cada cuántos minutos corre el cron        (default: 30)
 *   CR_LAST_MINUTES  → ventana de tiempo a revisar en el RSS     (default: 60)
 *   CR_TARGET_JID    → JID del grupo/chat destino automático
 *                      ej: 1234567890-1234567890@g.us  (grupo)
 *                          1234567890@s.whatsapp.net   (privado)
 *
 * Comandos:
 *   .crnotify        → fetch manual de episodios nuevos al chat actual
 *   .crnotify set    → guarda el chat actual como destino automático del cron
 *   .crnotify status → muestra configuración actual
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'


// ─── Rutas ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = join(__dirname, '../tmp')
const DB_PATH   = join(TMP_DIR, 'crunchyroll-seen.json')
const CFG_PATH  = join(TMP_DIR, 'crunchyroll-cfg.json')

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

// ─── Config ──────────────────────────────────────────────────────────────────

const RSS_URL = 'https://feeds.feedburner.com/crunchyroll/rss/anime?lang=esLA'

function loadCfg() {
  try { return JSON.parse(readFileSync(CFG_PATH, 'utf-8')) } catch { return {} }
}
function saveCfg(data) {
  writeFileSync(CFG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

// ─── Deduplicación ───────────────────────────────────────────────────────────

function loadSeen() {
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}
function saveSeen(ids) {
  writeFileSync(DB_PATH, JSON.stringify(ids.slice(-300)), 'utf-8')
}

// ─── RSS Parser (sin dependencias externas) ───────────────────────────────────

function parseXML(xml) {
  const items = []
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  for (const [, block] of blocks) {
    const getText = (tag) => {
      const m = block.match(
        new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`)
      )
      return m ? (m[1] ?? m[2] ?? '').trim() : ''
    }
    const getAttr = (tag, attr) => {
      const m = block.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"[^>]*\\/?>`, 'i'))
      return m ? m[1].trim() : ''
    }

    // <link> en RSS 2.0 puede ser texto plano sin CDATA
    const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)
    const link = rawLink ? rawLink[1].trim() : getAttr('atom:link', 'href')

    const pubDate   = getText('pubDate')
    const published = pubDate ? new Date(pubDate).getTime() : 0

    // Imagen: intenta media:thumbnail → enclosure
    const image =
      getAttr('media:thumbnail', 'url') ||
      getAttr('media:content', 'url')   ||
      getAttr('enclosure', 'url')       || ''

    const id = getText('guid') || link

    if (id) {
      items.push({ id, title: getText('title'), link, published, image })
    }
  }

  return items
}

async function fetchNewEpisodes() {
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CrunchyBot/1.0)' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`RSS HTTP ${res.status}`)

  const xml   = await res.text()
  const items = parseXML(xml)

  const cfg         = loadCfg()
  const lastMinutes = parseInt(process.env.CR_LAST_MINUTES ?? cfg.lastMinutes ?? '60')
  const cutoff      = Date.now() - lastMinutes * 60_000

  const recent   = items.filter(i => i.published >= cutoff)
  if (!recent.length) return []

  const seen     = loadSeen()
  const newItems = recent.filter(i => !seen.includes(i.id)).reverse()

  if (newItems.length) {
    saveSeen([...seen, ...newItems.map(i => i.id)])
  }

  return newItems
}

// ─── Formateo de mensaje ─────────────────────────────────────────────────────

function formatCaption(item) {
  const date = new Date(item.published).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  return `🎌 *Nuevo episodio en Crunchyroll*\n\n📺 *${item.title}*\n🕐 _${date}_\n🔗 ${item.link}`
}

// ─── Envío a WhatsApp ────────────────────────────────────────────────────────

async function sendItem(conn, jid, item, quotedMsg = null) {
  const caption = formatCaption(item)
  const opts    = quotedMsg ? { quoted: quotedMsg } : {}

  if (item.image) {
    try {
      await conn.sendMessage(jid, { image: { url: item.image }, caption }, opts)
      return
    } catch {
      // fallback a texto si la imagen falla
    }
  }
  await conn.sendMessage(jid, { text: caption }, opts)
}

async function sendDelay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Cron ────────────────────────────────────────────────────────────────────

let cronTimer   = null
let storedConn  = null

function stopCron() {
  if (cronTimer) { clearInterval(cronTimer); cronTimer = null }
}

function startCron(conn) {
  storedConn = conn
  stopCron()

  const cfg     = loadCfg()
  const minutes = parseInt(process.env.CR_MINUTES ?? cfg.minutes ?? '30')
  const jid     = process.env.CR_TARGET_JID || cfg.targetJid || ''

  if (!jid) {
    console.log('[CR-Notify] Sin JID configurado, cron en standby.')
    return
  }

  const ms = minutes * 60 * 1000

  cronTimer = setInterval(async () => {
    try {
      const items = await fetchNewEpisodes()
      for (const item of items) {
        await sendItem(storedConn, jid, item)
        await sendDelay(2000)
      }
      if (items.length) {
        console.log(`[CR-Notify] ${items.length} episodio(s) enviado(s) a ${jid}`)
      }
    } catch (err) {
      console.error('[CR-Notify] Error en cron:', err.message)
    }
  }, ms)

  console.log(`[CR-Notify] Intervalo iniciado → cada ${minutes} min | destino: ${jid}`)
}

// ─── Handler del plugin ──────────────────────────────────────────────────────

let handler = async (m, { conn, args, isOwner }) => {
  // Inicializa / refresca la conexión almacenada
  if (!storedConn) startCron(conn)
  else storedConn = conn

  const sub = (args[0] || '').toLowerCase()

  // ── .crnotify set ──────────────────────────────────────────────────────────
  if (sub === 'set') {
    if (!isOwner) return conn.sendMessage(m.chat, { text: '⛔ Solo el dueño puede hacer esto.' }, { quoted: m })

    const cfg     = loadCfg()
    cfg.targetJid = m.chat
    saveCfg(cfg)
    process.env.CR_TARGET_JID = m.chat

    startCron(conn) // reinicia con el nuevo JID

    return conn.sendMessage(m.chat, {
      text: `✅ *Canal configurado*\n\`${m.chat}\`\n\nEl cron enviará las notificaciones aquí.`,
    }, { quoted: m })
  }

  // ── .crnotify status ───────────────────────────────────────────────────────
  if (sub === 'status') {
    const cfg     = loadCfg()
    const jid     = process.env.CR_TARGET_JID || cfg.targetJid || '_no configurado_'
    const minutes = process.env.CR_MINUTES    || cfg.minutes   || '30'
    const last    = process.env.CR_LAST_MINUTES || cfg.lastMinutes || '60'
    const seen    = loadSeen()

    return conn.sendMessage(m.chat, {
      text: `📊 *CR-Notify Status*\n\n` +
            `🎯 Destino: \`${jid}\`\n` +
            `⏱ Cron: cada *${minutes} min*\n` +
            `🕐 Ventana RSS: últimos *${last} min*\n` +
            `💾 IDs guardados: *${seen.length}*\n` +
            `🔄 Cron activo: *${cronTimer ? 'Sí' : 'No'}*`,
    }, { quoted: m })
  }

  // ── .crnotify (fetch manual) ───────────────────────────────────────────────
  await conn.sendMessage(m.chat, { text: '🔍 Buscando episodios nuevos...' }, { quoted: m })

  try {
    const items = await fetchNewEpisodes()

    if (!items.length) {
      const last = process.env.CR_LAST_MINUTES || loadCfg().lastMinutes || '60'
      return conn.sendMessage(m.chat, {
        text: `📭 No hay episodios nuevos en los últimos *${last} min*.`,
      }, { quoted: m })
    }

    for (const item of items) {
      await sendItem(conn, m.chat, item, m)
      await sendDelay(1500)
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
  }
}

handler.help    = ['crnotify', 'crnotify set', 'crnotify status']
handler.tags    = ['anime']
handler.command = /^cr(notify|news)$/i

// Inicia el cron en cuanto el plugin se carga (si ya hay JID guardado)
;(async () => {
  const cfg = loadCfg()
  const jid = process.env.CR_TARGET_JID || cfg.targetJid || ''
  if (jid && !cronTimer) {
    // conn no está disponible aún en el arranque; el cron se inicia
    // cuando el primer comando llega y establece storedConn.
    // Solo logueamos que hay config lista.
    console.log(`[CR-Notify] Config cargada. JID destino: ${jid}`)
  }
})()

export default handler
  
