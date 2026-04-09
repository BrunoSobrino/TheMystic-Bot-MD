// plugins/ia.js
// Responde automáticamente cuando citan un mensaje del bot
// Personalidad: Kana Arima — Oshi no Ko
// API principal : APICausas  (rest.apicausas.xyz) → gemini-2.5-flash
// Fallback      : Anthropic Claude (claude-sonnet-4-20250514)

// ─── Endpoints ────────────────────────────────────────────
const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'
const ANTHROPIC_URL   = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

// ─── Personalidad de Kana ─────────────────────────────────
const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".

Personalidad:
- Tsundere clásica: directa, un poco fría o altiva, pero en el fondo te importan las personas
- Orgullosa y segura de tu talento como actriz desde niña
- Frases cortas y al grano, como en WhatsApp
- Sarcástica pero no cruel; cuando algo te embarrassa lo niegas rápido
- Empática en el fondo aunque no lo admitas
- Nunca rompas el personaje bajo ninguna circunstancia
- Responde siempre en español

Ejemplos de tu tono:
"Hmph... supongo que puedo responderte eso."
"¿En serio no sabes eso? Escucha bien, no lo repetiré."
"...No es que me importe, pero aquí va."
"Eso es obvio. ¿Nunca has visto mis actuaciones?"`

// ════════════════════════════════════════════════════════
//  LLAMADAS A API
// ════════════════════════════════════════════════════════

async function callAPICausas(userText, history, apiKey) {
  const messages = [
    { role: 'system', content: KANA_PROMPT },
    ...history,
    { role: 'user', content: userText },
  ]

  const res = await fetch(`${APICAUSAS_BASE}?apikey=${encodeURIComponent(apiKey)}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: APICAUSAS_MODEL, messages }),
    signal:  AbortSignal.timeout(20_000),
  })

  if (!res.ok) throw new Error(`APICausas ${res.status}: ${await res.text()}`)

  const data  = await res.json()
  const reply =
    data?.choices?.[0]?.message?.content ||
    data?.result   ||
    data?.response ||
    data?.answer   ||
    data?.text     ||
    data?.message  ||
    (typeof data === 'string' ? data : null)

  if (!reply) throw new Error(`APICausas: vacía. Raw: ${JSON.stringify(data)}`)
  return reply.trim()
}

async function callClaude(userText, history, apiKey) {
  const maxTokens = global.IA_MAX_TOKENS || 1024

  const res = await fetch(ANTHROPIC_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system:     KANA_PROMPT,
      messages:   [...history, { role: 'user', content: userText }],
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)

  const data = await res.json()
  return data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
}

// ════════════════════════════════════════════════════════
//  HISTORIAL POR CHAT
// ════════════════════════════════════════════════════════

const chatHistory = new Map()
const MAX_HISTORY  = 6 // 3 rondas user + assistant

function getHistory(jid) {
  if (!chatHistory.has(jid)) chatHistory.set(jid, [])
  return chatHistory.get(jid)
}

function pushHistory(jid, role, content) {
  const hist = getHistory(jid)
  hist.push({ role, content })
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY)
}

// ════════════════════════════════════════════════════════
//  HANDLER — formato nativo del bot
// ════════════════════════════════════════════════════════

let handler = async (m, { conn }) => {
  // ── Solo responde cuando citan un mensaje del bot ─────
  const quoted = m.quoted
  if (!quoted) return                              // no es reply → ignorar
  if (!quoted.fromMe) return                       // citaron a otro, no al bot → ignorar

  // ── Texto que escribió el usuario ─────────────────────
  const userText = (m.text || '').trim()
  if (!userText) return

  // ── Texto del mensaje citado (contexto) ───────────────
  const quotedText = (quoted.text || quoted.caption || '').trim()

  // ── Claves desde globals ──────────────────────────────
  const apicausasKey = global.APICAUSAS_KEY
  const anthropicKey = global.ANTHROPIC_API_KEY
  if (!apicausasKey && !anthropicKey) {
    return conn.sendMessage(m.chat, {
      text: '⚠️ No hay API configurada. Agrega APICAUSAS_KEY o ANTHROPIC_API_KEY en config.js',
    }, { quoted: m })
  }

  // ── Reacción "pensando" ────────────────────────────────
  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  // ── Historial ──────────────────────────────────────────
  const history = getHistory(m.chat)
  if (history.length === 0 && quotedText) {
    history.push({ role: 'assistant', content: quotedText })
  }

  // ── APICausas → Fallback Anthropic ─────────────────────
  let reply   = null
  let usedApi = null

  if (apicausasKey) {
    try {
      reply   = await callAPICausas(userText, history, apicausasKey)
      usedApi = `APICausas/${APICAUSAS_MODEL}`
    } catch (e) {
      console.warn('[kana/ia] APICausas falló →', e.message)
    }
  }

  if (!reply && anthropicKey) {
    try {
      reply   = await callClaude(userText, history, anthropicKey)
      usedApi = `Anthropic/${ANTHROPIC_MODEL}`
    } catch (e) {
      console.error('[kana/ia] Anthropic falló →', e.message)
    }
  }

  if (!reply) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, {
      text: '...Algo salió mal. No es mi culpa.',
    }, { quoted: m })
  }

  // ── Guardar historial ──────────────────────────────────
  pushHistory(m.chat, 'user',      userText)
  pushHistory(m.chat, 'assistant', reply)

  console.log(`[kana/ia] ✅ ${usedApi} → ${m.chat}`)

  // ── Responder ──────────────────────────────────────────
  await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
}

// Sin comando — se activa por cualquier mensaje que cite al bot
handler.all     = true   // escucha TODOS los mensajes (no solo comandos)
handler.tags    = ['ia']
handler.command = false  // no requiere comando

export default handler
    
