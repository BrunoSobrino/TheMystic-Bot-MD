// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)
// v2: Detecta mensajes del bot por key.id (compatible con @lid JIDs)

import fetch from 'node-fetch'

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

// ── Caché de IDs de mensajes enviados por el bot ──────────
// Persiste mientras el proceso esté activo.
// Al reiniciar se vacía (comportamiento esperado).
const botMessageIds = new Set()
const MAX_CACHE = 500

/**
 * Registra el key.id de un mensaje enviado por el bot.
 * Llamar desde cualquier parte donde el bot envíe mensajes.
 * @param {object} key  - El campo `key` del mensaje retornado por sendMessage()
 */
export function trackBotMessage(key) {
  if (!key?.id) return
  botMessageIds.add(key.id)

  // Evitar crecimiento ilimitado: eliminar el más antiguo
  if (botMessageIds.size > MAX_CACHE) {
    botMessageIds.delete(botMessageIds.values().next().value)
  }
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
    data?.reply ||
    data?.result ||
    data?.response ||
    data?.text ||
    data?.message ||
    data?.choices?.[0]?.message?.content

  if (!reply) throw new Error(`Respuesta vacía. Raw: ${JSON.stringify(data)}`)

  return reply.trim()
}

// ── Helper: detecta si el mensaje citado es del bot ───────
// Estrategia 1: fromMe (puede fallar con @lid)
// Estrategia 2: key.id en caché de mensajes enviados por el bot
// Estrategia 3: comparación manual de número (fallback)
function isQuotedFromBot(m) {
  const q = m.quoted
  if (!q) return false

  const fromMe = q.fromMe === true

  const cachedId = !!(q.id && botMessageIds.has(q.id))

  // Fallback: comparación por número (puede fallar con @lid pero lo intentamos)
  const botRaw    = String(m.conn?.user?.jid || m.conn?.user?.id || '')
  const botNum    = botRaw.split('@')[0].split(':')[0]
  // q.sender en grupos puede ser objeto, número, o undefined — forzar string
  const senderRaw = typeof q.sender === 'string' ? q.sender
                  : typeof q.sender === 'number' ? String(q.sender)
                  : q.sender?.toString?.() ?? ''
  const senderNum = senderRaw.split('@')[0].split(':')[0]
  const manualMatch = !!(botNum && senderNum && botNum === senderNum)

  console.log(`[kana/ia] DEBUG quoted:
  fromMe      = ${fromMe}
  cachedId    = ${cachedId}  (q.id: ${q.id})
  botJid      = ${botRaw}
  sender(raw) = ${JSON.stringify(q.sender)} [${typeof q.sender}]
  senderStr   = ${senderRaw}
  manualMatch = ${manualMatch}
  cacheSize   = ${botMessageIds.size}`)

  return fromMe || cachedId || manualMatch
}

// ── Handler ───────────────────────────────────────────────
const handler = (m) => m

handler.before = async (m) => {
  if (!m.quoted) return true
  if (!isQuotedFromBot(m)) return true

  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return true

  console.log(`[kana/ia] ✅ Activado: "${userText}"`)

  const quotedText = (m.quoted.text || '').trim()

  await m.conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)

    await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })

    // Enviar respuesta y registrar su key.id en el caché
    const sent = await m.conn.sendMessage(
      m.chat,
      { text: reply },
      { quoted: m }
    )
    if (sent?.key) trackBotMessage(sent.key)

    console.log(`[kana/ia] ✅ Respondido. key.id registrado: ${sent?.key?.id}`)
  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await m.conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply('...Hmph. Algo falló con la conexión. No me molestes ahora.')
  }

  return true
}

export default handler
