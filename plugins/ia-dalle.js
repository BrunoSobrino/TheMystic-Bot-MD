// Creditos a https://pastes.io/imagen-ai
import axios from 'axios'
import similarity from 'similarity'

const normalizeText = (text = '') => {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
}

const synonyms = {
  'realista': 'Realistic',
  'realistic': 'Realistic',
  'ghibli': 'Ghibli',
  'anime': 'Anime',
  'gta': 'GTA',
  'cinematica': 'Cinematic', 'cinematic': 'Cinematic', 'cinematografico': 'Cinematic',
  'fotografica': 'Photographic', 'fotografico': 'Photographic',
  'fantasia': 'Fantasy', 'fantastico': 'Fantasy',
  'cartoon': 'Cartoon', 'caricatura': 'Cartoon',
  'cyberpunk': 'Cyberpunk',
  'manga': 'Manga',
  'digital': 'Digital Art', 'digitalart': 'Digital Art',
  'colorido': 'Colorful', 'colorful': 'Colorful',
  'robot': 'Robot',
  'neonpunk': 'Neonpunk',
  'pixel': 'Pixel Art', 'pixelart': 'Pixel Art',
  'disney': 'Disney',
  '3d': '3D Model', '3dmodel': '3D Model'
}

const estilosDisponibles = [
  'No Style', 'Realistic', 'Ghibli', 'GTA', 'Anime', 'Cinematic',
  'Photographic', 'Fantasy', 'Cartoon', 'Cyberpunk', 'Manga',
  'Digital Art', 'Colorful', 'Robot', 'Neonpunk', 'Pixel Art',
  'Disney', '3D Model'
]

const removeNormalizedTokens = (original, tokensToRemoveNormalized) => {
  return original
    .split(/\s+/)
    .filter(w => !tokensToRemoveNormalized.includes(normalizeText(w)))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

let handler = async (m, { conn, command, args }) => {
  const input = args.join(' ').trim()
  if (!input) return m.reply('*[❗] Ingresa una descripción de la imagen que quieres generar.*')

  const inputNormalizado = normalizeText(input)
  const tokens = inputNormalizado.split(/\s+/).filter(Boolean)

  let estiloDetectado = 'No Style'
  let matchedToken = null
  for (const t of tokens) {
    if (synonyms[t]) {
      estiloDetectado = synonyms[t]
      matchedToken = t
      break
    }
  }

  if (estiloDetectado === 'No Style') {
    for (const estilo of estilosDisponibles) {
      const normEstilo = normalizeText(estilo)
      if (tokens.includes(normEstilo)) {
        estiloDetectado = estilo
        matchedToken = normEstilo
        break
      }
    }
  }

  const thresholdWhole = 0.45
  const thresholdToken = 0.75
  let maxWholeSim = 0, maxWholeStyle = null
  let maxTokenSim = 0, maxTokenStyle = null

  if (estiloDetectado === 'No Style') {
    for (const estilo of estilosDisponibles) {
      const normEstilo = normalizeText(estilo)
      const wholeSim = similarity(inputNormalizado, normEstilo)
      if (wholeSim > maxWholeSim) {
        maxWholeSim = wholeSim
        maxWholeStyle = estilo
      }
      const tokenSims = tokens.map(t => similarity(t, normEstilo))
      const bestTokenSim = tokenSims.length ? Math.max(...tokenSims) : 0
      if (bestTokenSim > maxTokenSim) {
        maxTokenSim = bestTokenSim
        maxTokenStyle = estilo
      }
    }
    if (maxTokenSim >= thresholdToken) {
      estiloDetectado = maxTokenStyle
    } else if (maxWholeSim >= thresholdWhole) {
      estiloDetectado = maxWholeStyle
    }
  }

  const tokensToRemove = []
  if (matchedToken) tokensToRemove.push(matchedToken)
  tokensToRemove.push(normalizeText(estiloDetectado))
  const promptLimpio = removeNormalizedTokens(input, tokensToRemove)

  const res = await imagen.generate(promptLimpio || input, estiloDetectado, '', 'Max')
  if (!res.success) return m.reply(`❌ Error: ${res.result.error}`)

  await conn.sendMessage(m.chat, { image: { url: res.result.url }, caption: `🖼 Prompt: ${promptLimpio || input}\n🎨 Estilo: ${estiloDetectado}` }, { quoted: m })
}

handler.command = ['dalle', 'dall-e']
export default handler

const imagen = {
  api: {
    base: 'https://image.pollinations.ai',
    endpoints: {
      textToImage: (prompt, width, height, seed) =>
        `/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&safe=true&seed=${seed}`
    }
  },

  headers: {
    'user-agent': 'NB Android/1.0.0',
    accept: 'image/jpeg',
    Authorization: 'Bearer Vxbsp6f84MqPzLgK',
    referer: 'https://image.pollinations.ai/'
  },

  request: (prompt, type, negative, size) => {
    const stylePrompts = {
      'No Style': '{prompt}',
      Realistic: 'realistic photo {prompt}. highly detailed, high budget, highly details, epic, high quality',
      Ghibli: 'style of studio ghibli, Hayao Miyazaki style',
      GTA: 'GTA style {prompt}. Realistic gta art style, rockstar games artwork, vice city, photorealistic concept art, detailed face, realistic anatomy, epic, cinematic, high detail, highly detailed, 4k RAW',
      Anime: 'anime style {prompt}. key visual, vibrant, studio anime, highly detailed',
      Cinematic: 'cinematic still {prompt}. emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy',
      Photographic: 'cinematic photo {prompt}. 35mm photograph, film, bokeh, professional, 4k, highly detailed',
      Fantasy: 'ethereal fantasy concept art of {prompt}. magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy',
      Cartoon: 'cartoon style {prompt}. cartoon, vibrant, high-energy, detailed',
      Cyberpunk: 'cyberpunk style {prompt}. extremely detailed, photorealistic, 8k, realistic, neon ambiance, vibrant, high-energy, cyber, futuristic',
      Manga: 'manga style {prompt}. vibrant, high-energy, detailed, iconic, Japanese comic style',
      'Digital Art': 'concept art {prompt}. digital artwork, illustrative, painterly, matte painting, highly detailed',
      Colorful: 'colorful style {prompt}. color, vibrant, high-energy, detailed, cover art, dreamy',
      Robot: 'robotic style {prompt}. robotic, vibrant, high-energy, detailed, cyber, futuristic',
      Neonpunk: 'neonpunk style {prompt}. cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional',
      'Pixel Art': 'pixel-art style {prompt}. low-res, blocky, 8-bit graphics, 16-bit, pixel',
      Disney: 'disney style {prompt}. disney cartoon, vibrant, high-energy, detailed, 3d, disney styles',
      '3D Model': 'professional 3d model {prompt}. octane render, highly detailed, volumetric, dramatic lighting',
    }

    const negativePrompts = {
      'No Style': 'extra hand, extra legs, ugly, glitch, bad eyes, low quality face, text, glitch, deformed, mutated, ugly, disfigured',
      Realistic: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Ghibli: '-',
      GTA: 'ugly, deformed, noisy, blurry, anime, cartoon, distorted, out of focus, bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, missing fingers',
      Anime: 'photo, deformed, black and white, realism, disfigured, low contrast',
      Cinematic: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Photographic: 'drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly',
      Fantasy: 'photographic, realis, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white',
      Cartoon: 'ugly, deformed, noisy, blurry, low contrast, realism, photorealistic',
      Cyberpunk: 'anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      Manga: 'ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, Western comic style',
      'Digital Art': 'photo, photorealistic, realism, ugly',
      Colorful: 'graphic, text, painting, crayon, graphite, glitch, deformed, mutated, ugly, disfigured',
      Robot: 'anime, cartoon, text, painting, crayon, graphite, glitch, deformed, mutated, ugly, disfigured',
      Neonpunk: 'painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured',
      'Pixel Art': 'sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic',
      Disney: 'graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured',
      '3D Model': 'ugly, deformed, noisy, low poly, blurry, painting',
    }

    const extraPrompt = (stylePrompts[type] || '{prompt}').replace('{prompt}', prompt)
    const fullNegative = `${negative}, ${negativePrompts[type] || ''}, nude, nudity, naked, sfw, nsfw, sex, erotic, pornography, hentai, explicit, fetish, bdsm, orgy, masturbate, masturbation, genital, vagina, penis, nipples, nipple, intercourse, ejaculation, orgasm, cunt, boobs, ****, tits, breast, ass, topless, fisting, censored`

    const dimensions = [1366, 1366]

    return { extraPrompt, negative: fullNegative, dimensions }
  },

  generate: async (prompt = '', type = 'No Style', negative = '', size = 'Max') => {
    if (!prompt?.trim()) {
      return { success: false, code: 400, result: { error: 'Prompt vacío' } }
    }

    try {
      const { extraPrompt, negative: fullNegative, dimensions } = imagen.request(prompt, type, negative, size)
      const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      const url = `${imagen.api.base}${imagen.api.endpoints.textToImage(`${extraPrompt}, ${prompt}`, dimensions[0], dimensions[1], seed)}`

      const { data } = await axios.get(url, {
        headers: imagen.headers,
        timeout: 60000,
        responseType: 'arraybuffer'
      })

      if (!data || data.length === 0) {
        return { success: false, code: 404, result: { error: 'Sin respuesta de la API' } }
      }

      return { success: true, code: 200, result: { prompt, type, negative: fullNegative, dimensions, url, created: new Date().toISOString() } }
    } catch (error) {
      return { success: false, code: error?.response?.status || 500, result: { error: 'Error en la generación' } }
    }
  }
}
