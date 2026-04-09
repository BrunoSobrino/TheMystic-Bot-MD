// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)
// APICausas principal → Anthropic fallback

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'
const ANTHROPIC_URL   = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.
Ejemplos: "Hmph... supongo que puedo responderte eso." / "¿En serio no sabes eso? Escucha bien." / "...No es que me importe, pero aquí va."`

// ── APIs ──────────────────────────────────────────────────
async function callAPICausas(userText, history, apiKey) {
  const messages = [
    { role: 'system', content: KANA_PROMPT },
    ...history,
    { role: 'user', content: userText },
  ]
  const res = await fetch(`${APICAUSAS_BASE}?apikey=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: APICAUSAS_MODEL, messages }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`APICausas ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content || data?.result || data?.response || data?.answer || data?.text || data?.message || (typeof data === 'string' ? data : null)
  if (!reply) throw new Error(`APICausas vacía. Raw: ${JSON.stringify(data)}`)
  return reply.trim()
}

async function callClaude(userText, history, apiKey) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: global.IA_MAX_TOKENS || 1024,
      system: KANA_PROMPT,
      messages: [...history, { role: 'user', content: userText }],
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
}

// ── Historial ─────────────────────────────────────────────
const chatHistory = new Map()
const MAX_HISTORY = 6
function getHistory(jid) {
  if (!chatHistory.has(jid)) chatHistory.set(jid, [])
  return chatHistory.get(jid)
}
function pushHistory(jid, role, content) {
  const hist = getHistory(jid)
  hist.push({ role, content })
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY)
}

// ── Helper: ¿el quoted es del bot? ───────────────────────
// Cubre TODAS las variantes conocidas de forks Baileys-MD
function quotedIsFromBot(m, conn) {
  const q = m.quoted
  if (!q) return false

  // Variante 1: propiedad directa .isSelf o .fromMe
  if (q.isSelf === true) return true
  if (q.fromMe === true) return true

  // Variante 2: key.fromMe dentro del quoted
  if (q.key?.fromMe === true) return true

  // Variante 3: comparar sender/participant con JID del bot
  const botJid = conn?.user?.id || conn?.authState?.creds?.me?.id || ''
  if (!botJid) return false
  const botNum = botJid.split(':')[0].split('@')[0]

  const sender = (q.sender || q.participant || q.key?.participant || q.key?.remoteJid || '')
  const senderNum = sender.split(':')[0].split('@')[0]

  return botNum && senderNum && botNum === senderNum
}

// ── Handler ───────────────────────────────────────────────
let handler = async (m, { conn }) => {
  // Solo si citan al bot
  if (!m.quoted) return
  if (!quotedIsFromBot(m, conn)) return

  // Texto del usuario (ignorar comandos)
  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return

  const apicausasKey = global.APICAUSAS_KEY
  const anthropicKey = global.ANTHROPIC_API_KEY
  if (!apicausasKey && !anthropicKey) return

  // Texto del mensaje citado como contexto inicial
  const quotedText = (m.quoted.text || m.quoted.caption || m.quoted.body || '').trim()

  // Reacción
  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  // Historial
  const history = getHistory(m.chat)
  if (history.length === 0 && quotedText) {
    history.push({ role: 'assistant', content: quotedText })
  }

  // Llamar APIs
  let reply = null, usedApi = null

  if (apicausasKey) {
    try {
      reply = await callAPICausas(userText, history, apicausasKey)
      usedApi = 'APICausas'
    } catch (e) {
      console.warn('[kana/ia] APICausas falló →', e.message)
    }
  }

  if (!reply && anthropicKey) {
    try {
      reply = await callClaude(userText, history, anthropicKey)
      usedApi = 'Anthropic'
    } catch (e) {
      console.error('[kana/ia] Anthropic falló →', e.message)
    }
  }

  if (!reply) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: '...Algo salió mal. No es mi culpa.' }, { quoted: m })
  }

  pushHistory(m.chat, 'user', userText)
  pushHistory(m.chat, 'assistant', reply)
  console.log(`[kana/ia] ✅ ${usedApi} → ${m.chat}`)

  await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
}

handler.all     = true
handler.command = false
handler.tags    = ['ia']

export default handler
