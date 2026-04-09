// plugins/ia.js
// Responde cuando citan un mensaje del bot — Kana Arima (Oshi no Ko)

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139' // Tu API Key
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

// ── APIs ──────────────────────────────────────────────────
async function callAPICausas(userText, quotedText) {
  let queryText = `${KANA_PROMPT}\n\n`;
  if (quotedText) {
    queryText += `Contexto (lo que tú, Kana, dijiste antes): "${quotedText}"\n`;
  }
  queryText += `Usuario dice: ${userText}`;

  const params = new URLSearchParams({
    apikey: API_KEY,
    model: APICAUSAS_MODEL,
    q: queryText
  });

  const url = `${APICAUSAS_BASE}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

  const data = await res.json()

  const reply = data?.reply || data?.result || data?.response || data?.text || data?.message || data?.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error(`Respuesta vacía. Raw: ${JSON.stringify(data)}`)
  }

  return reply.trim()
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

// ── Before handler (compatible con TheMystic-Bot-MD) ─────
export const before = async (m, { conn }) => {
  if (!m.quoted) return
  if (!quotedIsFromBot(m, conn)) return

  const userText = (m.text || m.body || m.message?.conversation || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return

  console.log(`[kana/ia] Procesando mensaje: "${userText}"...`)

  const quotedText = (m.quoted.text || m.quoted.caption || m.quoted.body || '').trim()

  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log(`[kana/ia] ✅ Respondido con éxito.`)
  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: '...Hmph. Algo falló con la conexión. No me molestes ahora.' }, { quoted: m })
  }
}

// ── Handler fallback (por si el fork usa handler.all) ────
let handler = async (m, { conn }) => {
  if (!m.quoted) return
  if (!quotedIsFromBot(m, conn)) return

  const userText = (m.text || m.body || m.message?.conversation || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return

  console.log(`[kana/ia] Procesando mensaje: "${userText}"...`)

  const quotedText = (m.quoted.text || m.quoted.caption || m.quoted.body || '').trim()

  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(userText, quotedText)
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log(`[kana/ia] ✅ Respondido con éxito.`)
  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: '...Hmph. Algo falló con la conexión. No me molestes ahora.' }, { quoted: m })
  }
}

handler.all  = true
handler.tags = ['ia']

export default handler
