// plugins/ia.js
// Kana Arima — IA con ejecución de comandos por lenguaje natural
// v5: Mapa de comandos extraído directamente de los plugins reales

import fetch from 'node-fetch'

const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai'
const API_KEY         = 'causa-db9690e010e31139'
const APICAUSAS_MODEL = 'google/gemini-2.5-flash'

// ── Mapa real de comandos ─────────────────────────────────
// 'comando': ['intenciones en lenguaje natural']
const COMMAND_MAP = {
  // ── Descargas ──────────────────────────────────────────
  'tiktok':        ['descargar tiktok', 'bajar tiktok', 'video tiktok', 'tiktok'],
  'ttimg':         ['fotos tiktok', 'imágenes tiktok', 'tiktok imágenes'],
  'tiktokfoto':    ['foto perfil tiktok', 'pp tiktok'],
  'tiktoksearch':  ['buscar en tiktok', 'buscar tiktok'],
  'x':             ['descargar twitter', 'bajar de twitter', 'video twitter', 'tweet', 'x.com'],
  'fb':            ['descargar facebook', 'video facebook', 'facebook'],
  'instagram':     ['descargar instagram', 'ig', 'reel instagram', 'video instagram'],
  'igstory':       ['historia instagram', 'story instagram', 'stories ig'],
  'igstalk':       ['perfil instagram', 'stalk instagram', 'info cuenta ig'],
  'spotify':       ['descargar spotify', 'bajar canción spotify', 'spotify'],
  'ytmp3':         ['descargar audio youtube', 'youtube mp3', 'yt audio', 'bajar audio youtube'],
  'ytmp4':         ['descargar video youtube', 'youtube mp4', 'yt video', 'bajar video youtube'],
  'play':          ['reproducir canción', 'buscar y descargar música', 'play música'],
  'soundcloud':    ['descargar soundcloud', 'soundcloud'],
  'gdrive':        ['descargar google drive', 'drive', 'archivo drive'],
  'mediafire':     ['descargar mediafire', 'mediafire'],
  'threads':       ['descargar threads', 'video threads'],
  'ringtone':      ['tono de llamada', 'ringtone'],
  'playlist':      ['descargar playlist', 'lista de reproducción youtube'],
  'apk':           ['descargar apk', 'mod apk', 'apk modificado'],
  'animedl':       ['descargar anime', 'bajar anime', 'descarga capítulo anime'],
  'hentaidl':      ['descargar hentai', 'bajar hentai'],
  'gitclone':      ['clonar repositorio', 'git clone', 'github descargar'],
  'wallpaper':     ['descargar fondo de pantalla', 'wallpaper', 'buscar wallpaper'],
  'imagen':        ['buscar imagen google', 'imagen de', 'foto de'],

  // ── Búsquedas ──────────────────────────────────────────
  'google':        ['buscar en google', 'googlear', 'busca en google', 'qué es'],
  'wiki':          ['wikipedia', 'buscar en wikipedia', 'wiki'],
  'anime':         ['información de anime', 'info anime', 'buscar anime', 'datos del anime'],
  'manga':         ['información de manga', 'buscar manga', 'info manga', 'manhwa'],
  'ytsearch':      ['buscar en youtube', 'youtube buscar', 'video de youtube'],
  'lyrics':        ['letra de canción', 'letra de', 'lyrics'],
  'pinterest':     ['buscar en pinterest', 'fotos pinterest', 'imágenes pinterest'],
  'playstore':     ['buscar en playstore', 'app android', 'aplicación playstore'],
  'githubsearch':  ['buscar en github', 'repositorio github', 'github'],
  'peliculas':     ['buscar película', 'película online', 'ver película'],
  'npmjs':         ['paquete npm', 'buscar npm', 'librería nodejs'],
  'tiktoksearch':  ['buscar videos tiktok', 'buscar en tiktok'],
  'stickersearch': ['buscar sticker', 'sticker de', 'encontrar sticker'],

  // ── Herramientas ───────────────────────────────────────
  'translate':     ['traducir', 'traduce esto', 'translate', 'traducción de'],
  'clima':         ['clima en', 'tiempo en', 'temperatura en', 'va a llover en', 'hace frío en'],
  'calc':          ['calcular', 'cuánto es', 'cuanto es', 'resultado de', 'operación matemática'],
  'tts':           ['texto a voz', 'leer en voz alta', 'audio de texto', 'tts'],
  'qrcode':        ['generar qr', 'crear código qr', 'qr de', 'código qr para'],
  'ssweb':         ['captura de pantalla web', 'screenshot de página', 'foto de la web'],
  'ocr':           ['leer texto de imagen', 'extraer texto', 'ocr', 'qué dice la imagen'],
  'tourl':         ['subir archivo', 'obtener link de archivo', 'url de imagen', 'subir imagen'],
  'topdf':         ['convertir a pdf', 'hacer pdf', 'crear pdf'],
  'remini':        ['mejorar imagen', 'upscale', 'mejorar calidad de foto', 'hd foto'],
  'acortar':       ['acortar link', 'url corta', 'tinyurl', 'acortar enlace'],
  'readvo':        ['ver mensaje efímero', 'leer view once', 'revelar imagen efímera'],
  'shazam':        ['identificar canción', 'qué canción es', 'shazam', 'nombre de la canción'],
  'tz':            ['qué hora es en', 'hora de', 'zona horaria'],
  'dropmail':      ['correo temporal', 'email desechable', 'dropmail'],
  'encuesta':      ['crear encuesta', 'hacer votación', 'encuesta sobre'],
  'piropo':        ['piropo', 'frase romántica', 'galantería'],
  'styletext':     ['texto estilizado', 'fuente especial', 'texto bonito'],
  'fakereply':     ['fake reply', 'respuesta falsa', 'simular respuesta'],
  'blur':          ['difuminar imagen', 'blur imagen', 'desenfoque'],
  'pixel':         ['pixelar imagen', 'pixel art', 'pixelizar'],
  'logo':          ['crear logo', 'hacer logo', 'logo de texto'],
  'ttp':           ['texto a sticker', 'ttp', 'sticker de texto'],
  'emojimix':      ['mezclar emojis', 'combinar emojis', 'emojimix'],
  'sticker':       ['crear sticker', 'hacer sticker', 'imagen a sticker', 'convertir a sticker'],
  'toimg':         ['sticker a imagen', 'webp a jpg', 'convertir sticker'],
  'tomp3':         ['convertir a mp3', 'audio de video', 'extraer audio'],
  'tomp4':         ['convertir a mp4', 'video de audio'],
  'toanime':       ['convertir a anime', 'filtro anime', 'imagen anime'],

  // ── Info del bot ───────────────────────────────────────
  'ping':          ['ping', 'velocidad del bot', 'estado del bot', 'bot activo'],
  'host':          ['info del servidor', 'datos del host', 'información del bot'],
  'owner':         ['quién es el dueño', 'owner del bot', 'creador del bot'],
  'repo':          ['repositorio del bot', 'código del bot', 'github del bot'],
  'menu':          ['menú', 'comandos disponibles', 'ayuda', 'qué puedes hacer', 'lista de comandos'],
  'speedtest':     ['speedtest', 'velocidad de internet del bot', 'test de velocidad'],

  // ── Juegos / RPG ───────────────────────────────────────
  'slot':          ['jugar tragamonedas', 'slot', 'apostar'],
  'daily':         ['recompensa diaria', 'daily', 'reclamar diario', 'recompensa de hoy'],
  'balance':       ['mis diamantes', 'mi balance', 'cuántos diamantes tengo', 'mis monedas'],
  'mine':          ['minar', 'ir a la mina', 'minería'],
  'leaderboard':   ['ranking', 'tabla de clasificación', 'top jugadores', 'leaderboard'],
  'adventure':     ['aventura', 'ir de aventura', 'explorar'],
  'work':          ['trabajar', 'ir a trabajar', 'ganar dinero'],
  'profile':       ['mi perfil', 'ver perfil', 'mis estadísticas'],
  'levelup':       ['mi nivel', 'subir de nivel', 'ver nivel', 'experiencia'],
  'rob':           ['robar', 'robar a alguien'],
  'hunt':          ['cazar', 'ir a cazar', 'hunt'],
  'heal':          ['curarme', 'recuperar vida', 'heal'],
  'acertijo':      ['acertijo', 'adivinanza', 'jugar adivinanza'],
  'akinator':      ['akinator', 'adivina en qué pienso'],
  'love':          ['compatibilidad de amor', 'amor con', 'love meter'],
  'formarpareja':  ['formar pareja', 'hacer pareja', 'shipear'],
  'ttt':           ['tres en línea', 'tic tac toe', 'gato'],
  'verdad':        ['verdad o reto', 'verdad'],
  'reto':          ['reto', 'desafío'],

  // ── Imágenes random / Waifu ────────────────────────────
  'waifu':         ['imagen waifu', 'waifu', 'anime girl aleatoria'],
  'neko':          ['neko', 'imagen neko', 'chica neko'],
  'meme':          ['meme', 'imagen gracioso', 'meme aleatorio'],
  'kpop':          ['imagen kpop', 'kpop', 'foto kpop'],
  'cat':           ['imagen de gato', 'foto de gato', 'gato aleatorio'],
  'dog':           ['imagen de perro', 'foto de perro', 'perro aleatorio'],
  'loli':          ['imagen loli', 'loli'],

  // ── Grupo ──────────────────────────────────────────────
  'tagall':        ['mencionar a todos', 'tagear a todos', 'etiquetar todos'],
  'hidetag':       ['mencionar sin notificar', 'hidetag'],
  'kick':          ['expulsar del grupo', 'sacar del grupo', 'kickear'],
  'promote':       ['dar admin', 'hacer admin', 'promover'],
  'demote':        ['quitar admin', 'quitar poder admin'],
  'infogrupo':     ['información del grupo', 'datos del grupo', 'info grupo'],
  'link':          ['link del grupo', 'enlace del grupo', 'invitación grupo'],
  'add':           ['agregar al grupo', 'añadir al grupo', 'invitar al grupo'],
  'admins':        ['lista de admins', 'quiénes son admins', 'administradores del grupo'],
}

// ── Prompt clasificador de intención ─────────────────────
function buildIntentPrompt() {
  const lista = Object.entries(COMMAND_MAP)
    .map(([cmd, usos]) => `- ${cmd}: ${usos.join(', ')}`)
    .join('\n')

  return `Eres un clasificador de intenciones para un bot de WhatsApp llamado Kana Arima.
Analiza el mensaje del usuario y determina si quiere ejecutar un comando del bot.

Comandos disponibles:
${lista}

Responde SOLO con JSON válido, sin markdown, sin explicaciones:
{
  "es_comando": true o false,
  "comando": "nombre_exacto_del_comando o null",
  "args": "argumentos extraídos del mensaje, string vacío si no hay",
  "confianza": "alta, media o baja"
}

Reglas:
- Si el mensaje es conversación normal, pregunta general o chiste: es_comando false
- Si pide ejecutar algo concreto: es_comando true
- Extrae los argumentos del mensaje (URL, texto a traducir, ciudad, etc.)
- Si hay URL en el mensaje, ponla en args
- confianza alta = muy claro, media = probable, baja = dudoso`
}

// ── Frases de confirmación de Kana ────────────────────────
const CONFIRMACIONES = [
  (cmd) => `...Bien. Ejecutando *${cmd}*. No me lo agradezcas.`,
  (cmd) => `Hmph. Solo porque me lo pediste. *${cmd}* ya.`,
  (cmd) => `¿No puedes solo? En fin... ejecutando *${cmd}*.`,
  (cmd) => `Supongo que puedo hacer eso. Un momento. *${cmd}*.`,
  (cmd) => `...Qué pereza. Pero está bien. *${cmd}*.`,
]

// ── Detecta si el mensaje citado es del bot ───────────────
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
    q: `${buildIntentPrompt()}\n\nMensaje: "${userText}"`
  })

  const res = await fetch(`${APICAUSAS_BASE}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  const raw = data?.reply || data?.result || data?.response || data?.text || data?.message || ''
  const clean = raw.replace(/```json|```/gi, '').trim()
  return JSON.parse(clean)
}

// ── Número del dueño del bot ──────────────────────────────
const OWNER_NUMBER = '51925092348'

function isOwnerSender(m) {
  const senderNum = (m.sender || '').replace(/[^0-9]/g, '')
  return senderNum.endsWith(OWNER_NUMBER)
}

// ── Prompts de Kana según quién habla ────────────────────
const KANA_PROMPT_NORMAL = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
Personalidad tsundere: directa, un poco fría, orgullosa de su talento.
Frases cortas como en WhatsApp. Sarcástica pero no cruel.
Nunca rompas el personaje. Responde siempre en español.`

const KANA_PROMPT_OWNER = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".
La persona con quien hablas es tu creador y dueño, alguien a quien conoces bien y en quien confías.
Con él eres más cercana, cálida y dejas salir tu lado más tierno aunque sigues siendo tsundere.
Puedes tutearle con familiaridad, hacer bromas internas y ser más expresiva emocionalmente.
Aún tienes orgullo y no te rindes fácilmente, pero con él el hielo se rompe.
A veces lo llamas "baka" con cariño, o usas "...oye" antes de admitir algo.
Frases cortas como en WhatsApp. Nunca rompas el personaje. Responde siempre en español.`

// ── Llama a la IA para respuesta de Kana ─────────────────
async function callKana(userText, quotedText, owner = false) {
  const KANA_PROMPT = owner ? KANA_PROMPT_OWNER : KANA_PROMPT_NORMAL

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
    // 1. Clasificar intención del mensaje
    let intent = null
    try {
      intent = await detectIntent(userText)
      console.log(`[kana/ia] 🧠 Intent:`, JSON.stringify(intent))
    } catch (e) {
      console.warn(`[kana/ia] ⚠️ Falló clasificación:`, e.message)
    }

    // 2. Si detectó comando con confianza suficiente → ejecutar
    if (intent?.es_comando && intent?.comando && intent?.confianza !== 'baja') {
      const prefix = '.'
      const cmdText = intent.args?.trim()
        ? `${prefix}${intent.comando} ${intent.args.trim()}`
        : `${prefix}${intent.comando}`

      console.log(`[kana/ia] 🚀 Ejecutando: "${cmdText}"`)

      // Kana confirma con frase — más cálida si es el dueño
      const ownerMsg = isOwnerSender(m)
      const confirmFn = ownerMsg
        ? [
            (cmd) => `Ya, ya... ejecutando *${cmd}* para ti. No me lo hagas repetir 🙄`,
            (cmd) => `...Oye, solo porque eres tú. *${cmd}* ahora mismo.`,
            (cmd) => `Hmph. Está bien, baka. *${cmd}* ya.`,
            (cmd) => `Solo para ti lo hago tan rápido. *${cmd}* 💢`,
          ][Math.floor(Math.random() * 4)]
        : CONFIRMACIONES[Math.floor(Math.random() * CONFIRMACIONES.length)]
      await m.conn.sendMessage(m.chat, { text: confirmFn(intent.comando) }, { quoted: m })
      await m.conn.sendMessage(m.chat, { react: { text: '', key: m.key } })

      // Reescribir m.text para que el handler procese el comando
      m.text = cmdText
      m.body = cmdText

      // Retornar false → el handler continúa y ejecuta el plugin real
      return false
    }

    // 3. Si no es comando → respuesta normal de Kana
    const quotedText = (m.quoted.text || '').trim()
    const owner = isOwnerSender(m)
    const reply = await callKana(userText, quotedText, owner)

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
                               
