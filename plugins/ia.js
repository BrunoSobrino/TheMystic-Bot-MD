// plugins/ia.js
// Kana Arima — IA con ejecución de comandos por lenguaje natural
// v6: Gestión de archivos, plugins, config y base de datos (solo owner)

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

// ── APIs de IA con fallback en cadena ────────────────────
// Configura tus API keys aquí. Las que estén vacías se saltan.
const AI_APIS = [
  // 1. APICausas (actual)
  {
    name: 'APICausas',
    call: async (prompt) => {
      const params = new URLSearchParams({
        apikey: 'causa-db9690e010e31139',
        model: 'google/gemini-2.5-flash',
        q: prompt
      })
      const res = await fetch(`https://rest.apicausas.xyz/api/v1/ai?${params}`, {
        method: 'GET', signal: AbortSignal.timeout(15_000)
      })
      if (!res.ok) throw new Error(`APICausas HTTP ${res.status}`)
      const d = await res.json()
      return d?.reply || d?.result || d?.response || d?.text || d?.message || ''
    }
  },
  // 2. Groq (gratis, muy rápido) — pon tu key de console.groq.com
  {
    name: 'Groq',
    key: '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',   // <- pega aquí tu Groq API key
    call: async (prompt, key) => {
      if (!key) throw new Error('Sin key')
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024
        }),
        signal: AbortSignal.timeout(15_000)
      })
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`)
      const d = await res.json()
      return d?.choices?.[0]?.message?.content || ''
    }
  },
  // 3. Google Gemini (gratis en aistudio.google.com)
  {
    name: 'Gemini',
    key: 'AIzaSyDdcujsIGlJFpiLUCdoz4DPiYFHTExGKXQ',   // <- pega aquí tu Gemini API key
    call: async (prompt, key) => {
      if (!key) throw new Error('Sin key')
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(15_000)
        }
      )
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
      const d = await res.json()
      return d?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
  },
  // 4. OpenRouter (tier gratuito en openrouter.ai)
  {
    name: 'OpenRouter',
    key: 'sk-or-v1-c05...bbe',   // <- pega aquí tu OpenRouter API key
    call: async (prompt, key) => {
      if (!key) throw new Error('Sin key')
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/KanaArima-MD',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024
        }),
        signal: AbortSignal.timeout(15_000)
      })
      if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`)
      const d = await res.json()
      return d?.choices?.[0]?.message?.content || ''
    }
  },
  // 5. Cohere (tier gratuito en cohere.com)
  {
    name: 'Cohere',
    key: '',   // <- pega aquí tu Cohere API key
    call: async (prompt, key) => {
      if (!key) throw new Error('Sin key')
      const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'command-r-plus',
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(15_000)
      })
      if (!res.ok) throw new Error(`Cohere HTTP ${res.status}`)
      const d = await res.json()
      return d?.message?.content?.[0]?.text || ''
    }
  },
  // 6. Hugging Face Inference API (gratuita)
  {
    name: 'HuggingFace',
    key: '',   // <- pega aquí tu HF token (hf_...)
    call: async (prompt, key) => {
      if (!key) throw new Error('Sin key')
      const res = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'mistralai/Mistral-7B-Instruct-v0.3',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
          }),
          signal: AbortSignal.timeout(20_000)
        }
      )
      if (!res.ok) throw new Error(`HuggingFace HTTP ${res.status}`)
      const d = await res.json()
      return d?.choices?.[0]?.message?.content || ''
    }
  },
]

// ── Motor de IA con fallback automático ───────────────────
// Intenta cada API en orden hasta obtener respuesta válida.
// Lleva registro de cuál fue la última que funcionó para priorizar.
let lastWorkingApiIndex = 0

async function callAI(prompt) {
  // Empezar desde la última que funcionó
  const order = [
    ...Array.from({ length: AI_APIS.length }, (_, i) => (lastWorkingApiIndex + i) % AI_APIS.length)
  ]

  const errors = []
  for (const idx of order) {
    const api = AI_APIS[idx]
    try {
      console.log(`[kana/ia] 🤖 Intentando con ${api.name}...`)
      const result = await api.call(prompt, api.key || '')
      if (!result?.trim()) throw new Error('Respuesta vacía')
      lastWorkingApiIndex = idx
      console.log(`[kana/ia] ✅ ${api.name} respondió`)
      return result.trim()
    } catch (e) {
      console.warn(`[kana/ia] ⚠️ ${api.name} falló: ${e.message}`)
      errors.push(`${api.name}: ${e.message}`)
    }
  }
  throw new Error(`Todas las APIs fallaron:\n${errors.join('\n')}`)
}

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

// ── Detecta intención de comando ─────────────────────────
async function detectIntent(userText) {
  const raw = await callAI(`${buildIntentPrompt()}\n\nMensaje: "${userText}"`)
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
  return await callAI(query)
}


// ── BASE PATH del bot ─────────────────────────────────────
const BOT_PATH = '/data/data/com.termux/files/home/KanaArima-MD'
const PLUGINS_PATH = path.join(BOT_PATH, 'plugins')

// ── Prompt de gestión de archivos (solo owner) ────────────
const FILE_MGMT_PROMPT = `Eres un asistente de gestión de archivos para un bot de WhatsApp.
Analiza el mensaje y responde SOLO con JSON válido sin markdown:
{
  "es_archivo": true o false,
  "operacion": "crear_plugin | editar_plugin | eliminar_plugin | listar_plugins | editar_config | ver_config | ver_db | editar_db | crear_archivo | editar_archivo | eliminar_archivo | leer_archivo",
  "nombre": "nombre del archivo o plugin (sin ruta)",
  "contenido": "contenido completo del archivo si aplica, null si no",
  "clave": "clave de config o db si aplica, null si no",
  "valor": "nuevo valor si aplica, null si no",
  "confianza": "alta, media o baja"
}

Operaciones disponibles:
- crear_plugin: crear un nuevo plugin en /plugins/
- editar_plugin: modificar un plugin existente
- eliminar_plugin: borrar un plugin
- listar_plugins: listar plugins disponibles
- editar_config: cambiar una variable en config.js
- ver_config: leer config.js
- ver_db: ver datos de la base de datos (users, chats, settings)
- editar_db: modificar datos en la base de datos
- crear_archivo: crear cualquier archivo en el bot
- editar_archivo: editar cualquier archivo existente
- eliminar_archivo: borrar un archivo
- leer_archivo: leer contenido de un archivo

Si el mensaje no es una operación de archivos, responde con es_archivo: false.`

// ── Ejecutor de operaciones de archivos ───────────────────
async function ejecutarArchivoOp(intent, m) {
  const op = intent.operacion

  // ── Listar plugins ──────────────────────────────────────
  if (op === 'listar_plugins') {
    const files = fs.readdirSync(PLUGINS_PATH).filter(f => f.endsWith('.js') && f !== 'ia.js')
    const lista = files.map((f, i) => `${i + 1}. ${f}`).join('\n')
    return `...Aquí tienes la lista. No me pidas que los recuerde todos.\n\n${lista}`
  }

  // ── Crear plugin ────────────────────────────────────────
  if (op === 'crear_plugin') {
    if (!intent.nombre || !intent.contenido) return '...Necesito el nombre y el contenido del plugin.'
    const nombre = intent.nombre.endsWith('.js') ? intent.nombre : intent.nombre + '.js'
    const filePath = path.join(PLUGINS_PATH, nombre)
    if (fs.existsSync(filePath)) return `...Ese plugin ya existe (${nombre}). ¿Quieres editarlo?`
    fs.writeFileSync(filePath, intent.contenido, 'utf8')
    return `Plugin *${nombre}* creado. ...No me agradezcas.`
  }

  // ── Editar plugin ───────────────────────────────────────
  if (op === 'editar_plugin') {
    if (!intent.nombre) return '...¿Qué plugin quieres editar? Dime el nombre.'
    const nombre = intent.nombre.endsWith('.js') ? intent.nombre : intent.nombre + '.js'
    const filePath = path.join(PLUGINS_PATH, nombre)
    if (!fs.existsSync(filePath)) return `...No existe ningún plugin llamado *${nombre}*.`
    if (!intent.contenido) {
      const actual = fs.readFileSync(filePath, 'utf8')
      return `Contenido actual de *${nombre}*:\n\n\`\`\`\n${actual.slice(0, 2000)}\n\`\`\``
    }
    fs.writeFileSync(filePath, intent.contenido, 'utf8')
    return `Plugin *${nombre}* actualizado. Ya era hora de arreglarlo.`
  }

  // ── Eliminar plugin ─────────────────────────────────────
  if (op === 'eliminar_plugin') {
    if (!intent.nombre) return '...¿Cuál plugin quieres eliminar?'
    const nombre = intent.nombre.endsWith('.js') ? intent.nombre : intent.nombre + '.js'
    const filePath = path.join(PLUGINS_PATH, nombre)
    if (!fs.existsSync(filePath)) return `...No encuentro el plugin *${nombre}*.`
    fs.unlinkSync(filePath)
    return `Plugin *${nombre}* eliminado. Desaparecido. Para siempre.`
  }

  // ── Ver config ──────────────────────────────────────────
  if (op === 'ver_config') {
    const configPath = path.join(BOT_PATH, 'config.js')
    const content = fs.readFileSync(configPath, 'utf8')
    // Solo mostrar las variables globales, no el código interno
    const lines = content.split('\n').filter(l => l.startsWith('global.') || l.startsWith('// '))
    return `Variables de config:\n\n\`\`\`\n${lines.join('\n').slice(0, 3000)}\n\`\`\``
  }

  // ── Editar config ───────────────────────────────────────
  if (op === 'editar_config') {
    if (!intent.clave || intent.valor === null) return '...Dime qué variable y qué valor quieres cambiar.'
    const configPath = path.join(BOT_PATH, 'config.js')
    let content = fs.readFileSync(configPath, 'utf8')
    const clave = intent.clave.startsWith('global.') ? intent.clave : `global.${intent.clave}`
    // Reemplazar la línea que contiene la variable
    const regex = new RegExp(`^(${clave.replace('.', '\\.')}\\s*=\\s*).*$`, 'm')
    const valor = typeof intent.valor === 'string' && !intent.valor.startsWith('[') && !intent.valor.startsWith('{')
      ? `'${intent.valor}'`
      : intent.valor
    if (!regex.test(content)) return `...No encuentro la variable *${clave}* en config.js.`
    content = content.replace(regex, `${clave} = ${valor};`)
    fs.writeFileSync(configPath, content, 'utf8')
    return `*${clave}* actualizado a \`${valor}\`. Reinicia el bot para que tome efecto.`
  }

  // ── Ver base de datos ───────────────────────────────────
  if (op === 'ver_db') {
    if (!global.db?.data) return '...La base de datos no está cargada aún.'
    const clave = intent.clave || 'settings'
    const data = global.db.data[clave]
    if (!data) return `...No existe la sección *${clave}* en la base de datos.`
    const json = JSON.stringify(data, null, 2).slice(0, 3000)
    return `Sección *${clave}* de la DB:\n\n\`\`\`json\n${json}\n\`\`\``
  }

  // ── Editar base de datos ────────────────────────────────
  if (op === 'editar_db') {
    if (!intent.clave || intent.valor === null) return '...Necesito la clave y el nuevo valor.'
    if (!global.db?.data) return '...La base de datos no está disponible.'
    // Formato esperado: "users.51925092348.exp" → 9999
    const keys = intent.clave.split('.')
    let obj = global.db.data
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {}
      obj = obj[keys[i]]
    }
    try {
      obj[keys[keys.length - 1]] = JSON.parse(intent.valor)
    } catch {
      obj[keys[keys.length - 1]] = intent.valor
    }
    global.db.data = global.db.data // Trigger save
    return `Base de datos actualizada: *${intent.clave}* = \`${intent.valor}\``
  }

  // ── Leer archivo genérico ───────────────────────────────
  if (op === 'leer_archivo') {
    if (!intent.nombre) return '...¿Qué archivo quieres leer?'
    const filePath = path.isAbsolute(intent.nombre)
      ? intent.nombre
      : path.join(BOT_PATH, intent.nombre)
    if (!fs.existsSync(filePath)) return `...No existe el archivo *${intent.nombre}*.`
    const content = fs.readFileSync(filePath, 'utf8').slice(0, 3000)
    return `Contenido de *${intent.nombre}*:\n\n\`\`\`\n${content}\n\`\`\``
  }

  // ── Crear archivo genérico ──────────────────────────────
  if (op === 'crear_archivo') {
    if (!intent.nombre) return '...¿Cómo se llama el archivo?'
    const filePath = path.isAbsolute(intent.nombre)
      ? intent.nombre
      : path.join(BOT_PATH, intent.nombre)
    if (fs.existsSync(filePath)) return `...Ese archivo ya existe. ¿Quieres editarlo?`
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, intent.contenido || '', 'utf8')
    return `Archivo *${intent.nombre}* creado.`
  }

  // ── Editar archivo genérico ─────────────────────────────
  if (op === 'editar_archivo') {
    if (!intent.nombre) return '...¿Qué archivo quieres editar?'
    const filePath = path.isAbsolute(intent.nombre)
      ? intent.nombre
      : path.join(BOT_PATH, intent.nombre)
    if (!fs.existsSync(filePath)) return `...No existe el archivo *${intent.nombre}*.`
    if (!intent.contenido) {
      const content = fs.readFileSync(filePath, 'utf8').slice(0, 3000)
      return `Contenido actual de *${intent.nombre}*:\n\n\`\`\`\n${content}\n\`\`\``
    }
    fs.writeFileSync(filePath, intent.contenido, 'utf8')
    return `Archivo *${intent.nombre}* actualizado.`
  }

  // ── Eliminar archivo genérico ───────────────────────────
  if (op === 'eliminar_archivo') {
    if (!intent.nombre) return '...¿Qué archivo quieres eliminar?'
    const filePath = path.isAbsolute(intent.nombre)
      ? intent.nombre
      : path.join(BOT_PATH, intent.nombre)
    if (!fs.existsSync(filePath)) return `...No existe el archivo *${intent.nombre}*.`
    fs.unlinkSync(filePath)
    return `Archivo *${intent.nombre}* eliminado. Sin rastro.`
  }

  return '...No entendí qué operación quieres hacer con los archivos.'
}

// ── Detecta intención de archivo ─────────────────────────
async function detectFileIntent(userText) {
  const raw = await callAI(`${FILE_MGMT_PROMPT}\n\nMensaje: "${userText}"`)
  const clean = raw.replace(/```json|```/gi, '').trim()
  return JSON.parse(clean)
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
    const ownerSender = isOwnerSender(m)

    // 0. Si es el owner → verificar si es operación de archivos primero
    if (ownerSender) {
      let fileIntent = null
      try {
        fileIntent = await detectFileIntent(userText)
        console.log(`[kana/ia] 📁 FileIntent:`, JSON.stringify(fileIntent))
      } catch (e) {
        console.warn(`[kana/ia] ⚠️ Falló detección de archivo:`, e.message)
      }

      if (fileIntent?.es_archivo && fileIntent?.operacion && fileIntent?.confianza !== 'baja') {
        console.log(`[kana/ia] 📁 Operación: ${fileIntent.operacion}`)
        await m.conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })
        try {
          const resultado = await ejecutarArchivoOp(fileIntent, m)
          await m.conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
          await m.conn.sendMessage(m.chat, { text: resultado }, { quoted: m })
        } catch (e) {
          console.error('[kana/ia] Error archivo →', e.message)
          await m.conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          await m.conn.sendMessage(m.chat, { text: `...Algo salió mal: ${e.message}` }, { quoted: m })
        }
        return true
      }
    }

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
      const ownerMsg = ownerSender
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
    const owner = ownerSender
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
