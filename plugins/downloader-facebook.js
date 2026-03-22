import fetch from 'node-fetch'

let handler = async (m, { args, command, conn }) => {
  // 1. Validación de entrada
  if (!args[0]) throw `*⚠️ Ingresa un enlace de Facebook.*\n\n*Ejemplo:* .${command} https://www.facebook.com/watch/?v=12345`

  const fbLink = args[0]
  if (!/facebook\.com|fb\.watch/g.test(fbLink)) throw '*❌ El enlace no parece ser de Facebook.*'

  await m.reply('*[⏳] Descargando video de Facebook...*')

  try {
    const encoded = encodeURIComponent(fbLink)
    const apiKey = "causa-0e3eacf90ab7be15" // Tu API Key proporcionada
    
    // Lista de APIs priorizadas (Agregada la nueva al principio)
    const apis = [
      `https://rest.apicausas.xyz//api/v1/descargas/facebook?apikey=causa-0e3eacf90ab7be15=https://www.facebook.com/watch?v=123456789`,
      `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
      `https://api.botcahx.eu.org/api/dowloader/fbdown?url=${encoded}&apikey=BrunoSobrino`,
      `https://api.vreden.my.id/api/facebook?url=${encoded}`
    ]

    let videoUrl = null

    // Bucle de intento (Fallback)
    for (const api of apis) {
      try {
        const res = await fetch(api)
        if (!res.ok) continue
        const json = await res.json()
        
        // Mapeo inteligente de la respuesta para diferentes APIs
        // Se añade soporte para la estructura de apicausas (usualmente json.status y json.resultado)
        videoUrl = json.resultado?.url || 
                   json.data?.url || 
                   json.result?.url || 
                   (Array.isArray(json.data) ? json.data[0].url : null) ||
                   json.url // Algunos devuelven el link directo en la raíz
        
        if (videoUrl && videoUrl.startsWith('http')) break 
      } catch (err) { 
        console.error(`Fallo en API: ${api}`, err.message)
        continue 
      }
    }

    if (!videoUrl) throw '*[ ❌ ] No se pudo extraer el video. Las APIs podrían estar caídas.*'

    // 2. Envío del archivo
    await conn.sendFile(m.chat, videoUrl, 'fb_video.mp4', `✅ *Video de Facebook descargado*`, m)

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Error:* ${e.message || 'Ocurrió un problema inesperado.'}`)
  }
}

handler.help = ['fb <enlace>']
handler.tags = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
