// plugins/ia.js
// Kana Arima — IA con ejecución de comandos por lenguaje natural
// v5: Detecta intención del usuario y reescribe m.text para ejecutar el comando

import fetch from 'node-fetch'

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

// ── Mapa de comandos disponibles ──────────────────────────
// Formato: 'comando_a_ejecutar': ['palabras clave / intenciones']
const COMMAND_MAP = {
  // Descargas
  'tiktok':      ['tiktok', 'descargar tiktok', 'bajar tiktok', 'video tiktok'],
  'x':           ['twitter', 'x.com', 'descargar twitter', 'tweet', 'video twitter'],
  'fb':          ['facebook', 'video facebook', 'descargar facebook', 'fb'],
  'spotify':     ['spotify', 'descargar canción', 'bajar música', 'música spotify'],
  'ytmp3':       ['youtube audio', 'descargar audio youtube', 'yt mp3', 'youtube mp3'],
  'ytmp4':       ['youtube video', 'descargar video youtube', 'yt mp4', 'youtube mp4'],
  'instagram':   ['instagram', 'ig', 'reel', 'descargar instagram'],
  'pinterest':   ['pinterest', 'pin', 'imagen pinterest'],
  'gdrive':      ['drive', 'google drive', 'descargar drive'],
  'mediafire':   ['mediafire', 'descargar mediafire'],
  'soundcloud':  ['soundcloud', 'descargar soundcloud'],

  // Búsquedas
  'google':      ['buscar en google', 'googlear', 'busca en google', 'google'],
  'anime':       ['info anime', 'información anime', 'buscar anime', 'anime info'],
  'yts':         ['buscar película', 'película torrent', 'yts'],
  'lyrics':      ['letra de canción', 'letra canción', 'lyrics'],
  'pinterest':   ['buscar imágenes', 'buscar en pinterest', 'fotos de'],
  'npm':         ['paquete npm', 'buscar npm', 'nodejs package'],

  // Herramientas
  'translate':   ['traducir', 'traduce', 'translate', 'traducción'],
  'clima':       ['clima', 'tiempo', 'temperatura', 'lluvia en', 'hace frío en', 'hace calor en'],
  'calc':        ['calcular', 'cuánto es', 'cuanto es', 'matemática', 'operación'],
  'tts':         ['texto a voz', 'tts', 'leer en voz', 'audio de texto'],
  'sticker':     ['hacer sticker', 'crear sticker', 'convertir sticker', 'sticker'],
  'toimg':       ['sticker a imagen', 'convertir imagen', 'webp a jpg'],
  'qrcode':      ['generar qr', 'crear qr', 'código qr', 'qr de'],
  'ssweb':       ['captura web', 'screenshot', 'foto de página', 'captura de pantalla web'],
  'ocr':         ['leer imagen', 'texto de imagen', 'ocr', 'extraer texto'],
  'tourl':       ['subir archivo', 'url de imagen', 'link de archivo'],
  'topdf':       ['convertir pdf', 'a pdf', 'crear pdf'],
  'upscale':     ['mejorar imagen', 'upscale', 'mejorar calidad', 'aumentar resolución'],

  // Información del bot
  'host':        ['info del bot', 'información del servidor', 'datos del host'],
  'ping':        ['ping', 'velocidad del bot', 'respuesta del bot'],
  'repo':        ['repositorio', 'código fuente', 'github del bot'],

  // Juegos / RPG
  'slot':        ['tragamonedas', 'slot', 'girar ruleta'],
  'daily':       ['recompensa diaria', 'daily', 'reclamar diario'],
  'balance':     ['mis diamantes', 'mi balance', 'cuántos diamantes tengo'],
  'mine':        ['minar', 'minería'],
  'leaderboard': ['tabla de clasificación', 'top jugadores', 'leaderboard', 'ranking'],

  // Imágenes random / anime
  'waifu':       ['waifu', 'imagen waifu', 'anime girl'],
  'neko':        ['neko', 'imagen neko'],
  'meme':        ['meme', 'imagen meme'],
}

// Prompt para clasificar la intención
const INTENT_PROMPT = `Eres un clasificador de intenciones para un bot de WhatsApp.
Tu tarea es analizar el mensaje del usuario y responder SOLO con un JSON.

Comandos disponibles y sus usos:
${Object.entries(COMMAND_MAP).map(([cmd, uses]) => `- ${cmd}: ${uses.join(', ')}`).join('\n')}

Responde ÚNICAMENTE con este JSON (sin explicaciones, sin markdown):
{
  "es_comando": true/false,
  "comando": "nombre_del_comando_o_null",
  "args": "argumentos extraídos del mensaje o string vacío",
  "confianza": "alta/media/baja"
}

Si el mensaje es solo una conversación o pregunta general (no pide ejecutar nada), responde con es_comando: false.
Si detectas un comando pero con baja confianza, igual inclúyelo pero marca confianza: "baja".`

// Prompt de personalidad de Kana
const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

// ── Detecta si el mensaje es del bot ─────────────────────
function isQuotedFromBot(q) {
  if (!q) return false
  if (q.isBaileys === true) return true
  if (q.fromMe === true) return true
  return false
}

// ── Llama a la IA para clasificar intención ───────────────
async function detectIntent(userText) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    model: APICAUSAS_MODEL,
    q: `${INTENT_PROMPT}\n\nMensaje del usuario: "${userText}"`
  })

  const res = await fetch(`${APICAUSAS_BASE}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  const raw = data?.reply || data?.result || data?.response || data?.text || data?.message || ''

  // Limpiar markdown si viene con ```json
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── Llama a la IA para respuesta de Kana ─────────────────
async function callKana(userText, quotedText) {
  let query = `${KANA_PROMPT}\n\n`
  if (quotedText) query += `Contexto (lo que tú dijiste antes): "${quotedText}"\n`
  query += `Usuario dice: ${userText}`

  const params = new URLSearchParams({
    apikey: API_KEY,
    model: APICAUSAS_MODEL,
    q: query
  })

  const res = await fetch(`${APICAUSAS_BASE}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(20_000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

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

// ── Handler principal ─────────────────────────────────────
const handler = (m) => m

handler.before = async (m) => {
  if (!m.quoted) return true
  if (!isQuotedFromBot(m.quoted)) return true

  const userText = (m.text || '').trim()
  if (!userText || /^[./!#]/.test(userText)) return true

  console.log(`[kana/ia] ✅ Activado: "${userText}"`)

  await m.conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  try {
    // 1. Clasificar intención
    let intent = null
    try {
      intent = await detectIntent(userText)
      console.log(`[kana/ia] Intent:`, JSON.stringify(intent))
    } catch (e) {
      console.warn(`[kana/ia] ⚠️ No se pudo clasificar intención:`, e.message)
    }

    // 2. Si detectó un comando con confianza alta/media → ejecutarlo
    if (intent?.es_comando && intent?.comando && intent?.confianza !== 'baja') {
      const prefix = '.'
      const cmdText = intent.args
        ? `${prefix}${intent.comando} ${intent.args}`
        : `${prefix}${intent.comando}`

      console.log(`[kana/ia] 🚀 Ejecutando: "${cmdText}"`)

      // Kana confirma lo que va a hacer
      const confirmaciones = [
        `...Bien, haré eso. No me lo agradezcas.`,
        `Hmph. Solo porque me lo pediste. Ejecutando *${intent.comando}*.`,
        `¿No puedes hacerlo tú solo? En fin... *${intent.comando}*.`,
        `Supongo que puedo hacer eso. *${intent.comando}*.`,
      ]
      const conf = confirmaciones[Math.floor(Math.random() * confirmaciones.length)]
      await m.reply(conf)

      // Reescribir m.text para que el handler procese el comando
      m.text = cmdText
      m.body = cmdText

      await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })

      // Retornar false para que el handler continúe procesando m con el nuevo texto
      return false
    }

    // 3. Si no es comando o baja confianza → respuesta normal de Kana
    const quotedText = (m.quoted.text || '').trim()
    const reply = await callKana(userText, quotedText)

    await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    await m.conn.sendMessage(m.chat, { text: reply }, { quoted: m })
    console.log('[kana/ia] ✅ Respondido como Kana.')

  } catch (e) {
    console.error('[kana/ia] Error →', e.message)
    await m.conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply('...Hmph. Algo falló. No me molestes ahora.')
  }

  return true
}

export default handler
  
