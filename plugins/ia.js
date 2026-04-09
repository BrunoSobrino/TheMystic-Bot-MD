// plugins/ia_test.js
// Comando de prueba: .ia [texto]

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139' // Tu API Key directa
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.
Ejemplos: "Hmph... supongo que puedo responderte eso." / "¿En serio no sabes eso? Escucha bien." / "...No es que me importe, pero aquí va."`

async function callAPICausas(userText) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    model: APICAUSAS_MODEL,
    prompt: KANA_PROMPT,
    q: userText 
  });

  const url = `${APICAUSAS_BASE}?${params.toString()}`;
  
  const res = await fetch(url, {
    method: 'GET', 
    signal: AbortSignal.timeout(20_000),
  })
  
  if (!res.ok) throw new Error(`Error HTTP: ${res.status} - ${await res.text()}`)
  
  const data = await res.json()
  
  // ¡Hemos añadido data?.reply aquí al principio!
  const reply = data?.reply || data?.result || data?.response || data?.answer || data?.text || data?.message || data?.data || data?.choices?.[0]?.message?.content || (typeof data === 'string' ? data : null)
  
  if (!reply || typeof reply !== 'string') {
    throw new Error(`Respuesta vacía o formato desconocido. Raw: ${JSON.stringify(data)}`)
  }
  
  return reply.trim()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: `¿Qué quieres que te responda? Úsalo así: ${usedPrefix + command} hola` }, { quoted: m })
  }

  console.log(`[kana/ia] Probando API con texto: "${text}"`)
  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    const reply = await callAPICausas(text)
    
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log(`[kana/ia] API funcionó correctamente.`)

  } catch (e) {
    console.error('[kana/ia] Error de la API →', e.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `...Hubo un problema con la API: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['ia', 'kana'] 
handler.tags    = ['ia']
handler.help    = ['ia <texto>']

export default handler
