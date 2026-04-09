// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)
// v3: Parcha conn.sendMessage para capturar TODOS los key.id del bot automáticamente

import fetch from 'node-fetch'

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

// ── Caché de key.id de mensajes enviados por el bot ───────
const botMessageIds = new Set()
const MAX_CACHE = 500

function trackBotMessage(key) {
  if (!key?.id) return
  botMessageIds.add(key.id)
  if (botMessageIds.size > MAX_CACHE) {
    botMessageIds.delete(botMessageIds.values().next().value)
  }
}

// ── Parche único sobre conn.sendMessage ───────────────────
// Se instala una sola vez por conexión. Intercepta TODOS los
// mensajes salientes y registra su key.id en el caché.
const patchedConns = new WeakSet()

function patchConn(conn) {
  if (!conn || patchedConns.has(conn)) return
  patchedConns.add(conn)

  const original = conn.sendMessage.bind(conn)
  conn.sendMessage = async (...args) => {
    const result = await original(...args)
    if (result?.key) {
      trackBotMessage(result.key)
      console.log(`[kana/ia] 📌 key.id registrado: ${result.key.id}`)
    }
    return result
  }
  console.log('[kana/ia] ✅ conn.sendMessage parcheado')
}

// ── API ───────────────────────────────────────────────────
async function callAPICausas(userText, quotedText) {
  let queryText = `${KANA_PROMPT}\n\n`
  if (quotedText) {
    queryText += `Contexto (lo que tú, Kana, dijiste antes): "${quotedText}"\n`
  }
  queryText += `Usuario dice: ${userText}`

  const params = new URLSearchParams({
    apikey: API_KEY,
    model: APICAUSAS_MODEL,
    q: queryText
  })

  const res = await fetch(`${APICAUSAS_BASE}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

  const data = await res.json()
  const reply =
    data?.reply    ||
    data?.result   ||
    data?.response ||
    data?.text     ||
    data?.message  ||
    data?.choices?.[0]?.message?.content

  if (!reply) throw new Error(`Respuesta vacía. Raw: ${JSON.stringify(data)}`)
  return reply.trim()
}

// ── Helper: resuelve q.sender aunque sea Promise u objeto ─
async function resolveSender(q) {
  try {
    const raw = await Promise.resolve(q.sender)
    if (typeof raw === 'string') return raw
    if (typeof raw === 'number') return String(raw)
    return raw?.toString?.() ?? ''
  } catch {
    return ''
  }
}

// ── Helper: detecta si el mensaje citado es del bot ───────
async function isQuotedFromBot(m) {
  const q = m.quoted
  if (!q) return false

  // Estrategia 1: fromMe
  if (q.fromMe === true) {
    console.log('[kana/ia] ✅ match por fromMe')
    return true
  }

  // Estrategia 2: key.id en caché (principal para @lid)
  if (q.id && botMessageIds.has(q.id)) {
    console.log(`[kana/ia] ✅ match por cachedId (${q.id})`)
    return true
  }

  // Estrategia 3: comparación de número (fallback, falla con @lid)
  const botRaw    = String(m.conn?.user?.jid || m.conn?.user?.id || '')
  const botNum    = botRaw.split('@')[0].split(':')[0]
  const senderRaw = await resolveSender(q)
  const senderNum = senderRaw.split('@')[0].split(':')[0]
  const manualMatch = !!(botNum && senderNum && botNum === senderNum)

  console.log(`[kana/ia] DEBUG quoted:
  fromMe      = ${q.fromMe}
  cachedId    = false  (q.id: ${q.id}, cacheSize: ${botMessageIds.size})
  botJid      = ${botRaw}
  senderRaw   = ${senderRaw}
  manualMatch = ${manualMatch}`)

  return manualMatch
}

// ── Handler ───────────────────────────────────────────────
const handler = (m) => m

handler.before = async (m) => {
  // Instalar parche tan pronto como tengamos acceso al conn
  if (m.conn) patchConn(m.conn)

  if (!m.quoted) return true
  if (!await isQuotedFromBot(m)) return true

  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return true

  console.log(`[kana/ia] ✅ Activado: "${userText}"`)

  const quotedText = (m.quoted.text || '').trim()

  await m.conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)
    await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    // sendMessage ya está parcheado — registra key.id automáticamente
    await m.conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log('[kana/ia] ✅ Respondido.')
  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await m.conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply('...Hmph. Algo falló con la conexión. No me molestes ahora.')
  }

  return true
}

export default handler
              
