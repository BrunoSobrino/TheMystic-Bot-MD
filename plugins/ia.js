// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)
// v4: Usa q.isBaileys del fork (detecta prefijos SUKI*, BAE5, etc.)
//     Sin caché manual, sin comparación de JIDs, sin Promises de @lid

import fetch from 'node-fetch'

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

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

// ── Helper: detecta si el mensaje citado es del bot ───────
// El fork define q.isBaileys que detecta prefijos del bot:
//   SUKI*, MYSTIC*, BAE5*, 3EB0*, NJX-*, etc.
// También cubre q.fromMe como respaldo.
function isQuotedFromBot(q) {
  if (!q) return false

  // Método principal: isBaileys del fork (cubre SUKI* y todos los prefijos)
  if (q.isBaileys === true) {
    console.log(`[kana/ia] ✅ match por isBaileys (id: ${q.id})`)
    return true
  }

  // Respaldo: fromMe sincrónico
  if (q.fromMe === true) {
    console.log(`[kana/ia] ✅ match por fromMe`)
    return true
  }

  console.log(`[kana/ia] ✗ no es del bot — isBaileys=${q.isBaileys} fromMe=${q.fromMe} id=${q.id}`)
  return false
}

// ── Handler ───────────────────────────────────────────────
const handler = (m) => m

handler.before = async (m) => {
  if (!m.quoted) return true
  if (!isQuotedFromBot(m.quoted)) return true

  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return true

  console.log(`[kana/ia] ✅ Activado: "${userText}"`)

  const quotedText = (m.quoted.text || '').trim()

  await m.conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)
    await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
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
