// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)
// APICausas principal

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

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
function quotedIsFromBot(m, conn) {
  const q = m.quoted
  if (!q) return false

  if (q.isSelf === true) return true
  if (q.fromMe === true) return true
  if (q.key?.fromMe === true) return true

  const botJid = conn?.user?.jid || conn?.user?.id || conn?.authState?.creds?.me?.id || ''
  if (!botJid) return false
  const botNum = botJid.split(':')[0].split('@')[0]

  const sender = (q.sender || q.participant || q.key?.participant || q.key?.remoteJid || '')
  if (!sender) return false
  const senderNum = sender.split(':')[0].split('@')[0]

  return botNum === senderNum
}

// ── Handler ───────────────────────────────────────────────
let handler = async (m, { conn }) => {
  // 1. Debe haber un mensaje citado
  if (!m.quoted) return

  // 2. Comprobar que le estamos respondiendo al bot
  if (!quotedIsFromBot(m, conn)) {
    // Descomenta esto solo si quieres ver todo lo que ignoras
    // console.log('[kana/ia] Ignorado: El mensaje citado no es del bot')
    return
  }

  // 3. Obtener el texto del usuario (con fallbacks por si m.text falla)
  const userText = (m.text || m.body || m.message?.conversation || '').trim()
  
  if (!userText || /^[./!#]/.test(userText)) {
    console.log(`[kana/ia] Detenido: Texto vacío o es un comando (${userText})`)
    return
  }

  // 4. Comprobar la API Key
  const apicausasKey = global.APICAUSAS_KEY
  if (!apicausasKey) {
    console.log('[kana/ia] ERROR: global.APICAUSAS_KEY no está definida o está vacía.')
    return
  }

  console.log(`[kana/ia] Procesando mensaje para Kana: "${userText}"...`)

  // Texto del mensaje citado como contexto inicial
  const quotedText = (m.quoted.text || m.quoted.caption || m.quoted.body || '').trim()

  // Reacción de pensando
  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  // Historial
  const history = getHistory(m.chat)
  if (history.length === 0 && quotedText) {
    history.push({ role: 'assistant', content: quotedText })
  }

  // Llamar API
  let reply = null

  try {
    reply = await callAPICausas(userText, history, apicausasKey)
  } catch (e) {
    console.error('[kana/ia] APICausas falló →', e.message)
  }

  if (!reply) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.sendMessage(m.chat, { text: '...Algo salió mal. No es mi culpa.' }, { quoted: m })
  }

  pushHistory(m.chat, 'user', userText)
  pushHistory(m.chat, 'assistant', reply)
  console.log(`[kana/ia] ✅ Respondido con éxito en ${m.chat}`)

  await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
}

handler.all     = true
handler.command = false
handler.tags    = ['ia']

export default handler
  
