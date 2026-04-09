// plugins/ia_test.js
// Comando de prueba: .ia [texto]

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.
Ejemplos: "Hmph... supongo que puedo responderte eso." / "¿En serio no sabes eso? Escucha bien." / "...No es que me importe, pero aquí va."`

async function callAPICausas(userText, apiKey) {
  const messages = [
    { role: 'system', content: KANA_PROMPT },
    { role: 'user', content: userText },
  ]
  
  const res = await fetch(`${APICAUSAS_BASE}?apikey=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: APICAUSAS_MODEL, messages }),
    signal: AbortSignal.timeout(20_000), // 20 segundos de tiempo de espera
  })
  
  if (!res.ok) throw new Error(`Error HTTP: ${res.status} - ${await res.text()}`)
  
  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content || data?.result || data?.response || data?.answer || data?.text || data?.message || (typeof data === 'string' ? data : null)
  
  if (!reply) throw new Error(`Respuesta vacía. Raw: ${JSON.stringify(data)}`)
  
  return reply.trim()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Comprobar que el usuario escribió algo después de .ia
  if (!text) {
    return conn.sendMessage(m.chat, { text: `¿Qué quieres que te responda? Úsalo así: ${usedPrefix + command} hola` }, { quoted: m })
  }

  // Comprobar la API Key
  const apicausasKey = global.APICAUSAS_KEY
  if (!apicausasKey) {
    console.log('[kana/ia] ERROR: global.APICAUSAS_KEY no está definida.')
    return conn.sendMessage(m.chat, { text: '❌ Error interno: Falta la API Key.' }, { quoted: m })
  }

  console.log(`[kana/ia] Probando API con texto: "${text}"`)
  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    // Llamar a la API
    const reply = await callAPICausas(text, apicausasKey)
    
    // Si funciona, enviar respuesta
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log(`[kana/ia] API funcionó correctamente.`)

  } catch (e) {
    // Si falla, avisar en el chat y mostrar el error en Termux
    console.error('[kana/ia] Error de la API →', e.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `...Hubo un problema con la API: ${e.message}` }, { quoted: m })
  }
}

// Configuración para que actúe como un comando
handler.command = ['ia', 'kana'] 
handler.tags    = ['ia']
handler.help    = ['ia <texto>']

export default handler
