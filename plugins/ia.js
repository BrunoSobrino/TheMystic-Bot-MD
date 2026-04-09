// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)

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
    data?.reply ||
    data?.result ||
    data?.response ||
    data?.text ||
    data?.message ||
    data?.choices?.[0]?.message?.content

  if (!reply) throw new Error(`Respuesta vacía. Raw: ${JSON.stringify(data)}`)

  return reply.trim()
}

// ── Handler ───────────────────────────────────────────────
const handler = (m) => m

handler.before = async (m) => {
  // 1. Debe haber mensaje citado
  if (!m.quoted) return true

  // 2. El quoted.fromMe ya usa areJidsSameUser internamente — confiar en él
  if (!m.quoted.fromMe) return true

  // 3. Texto del usuario
  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return true

  console.log(`[kana/ia] Procesando: "${userText}"`)

  const quotedText = (m.quoted.text || '').trim()

  await m.conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)
    await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    await m.reply(reply)
    console.log(`[kana/ia] ✅ Respondido.`)
  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await m.conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply('...Hmph. Algo falló con la conexión. No me molestes ahora.')
  }

  return true
}

export default handler
