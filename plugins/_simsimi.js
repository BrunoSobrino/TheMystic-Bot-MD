import translate from '@vitalets/google-translate-api'
import axios from 'axios'
import fetch from 'node-fetch'

const handler = (m) => m

handler.before = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat]
  if (!chat.simi) return true // si no está activado el simi, no hace nada

  // Detectar si el mensaje menciona o responde al bot
  const botJid = conn.user?.jid || conn.user?.id || ''
  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  const isBotMentioned = mentioned.includes(botJid)
  const isReplyToBot = m.quoted && m.quoted.sender === botJid

  // Si no lo mencionan ni le responden, no responde
  if (!isBotMentioned && !isReplyToBot) return true

  // Evitar que responda a comandos conocidos
  if (/^.*false|disable|(turn)?off|0/i.test(m.text)) return true
  const texto = (m.text || '').trim().toLowerCase()
  const palabrasBloqueadas = [
    'serbot', 'bots', 'jadibot', 'menu', 'play', 'play2', 'playdoc', 'tiktok',
    'facebook', 'menu2', 'infobot', 'estado', 'ping', 'instalarbot', 'sc',
    'sticker', 's ', 'wm', 'qc'
  ]
  if (palabrasBloqueadas.some(p => texto.includes(p))) return true

  try {
    const respuesta = await simitalk(m.text)
    if (!respuesta?.resultado?.simsimi) throw new Error('Sin respuesta')
    await conn.sendMessage(m.chat, { text: respuesta.resultado.simsimi }, { quoted: m })
  } catch (e) {
    await conn.sendMessage(m.chat, { text: '*[❗] La API de Simsimi presenta errores.*' }, { quoted: m })
  }
  return true
}

export default handler

// FUNCIONES AUXILIARES
async function simitalk(ask, apikeyyy = 'iJ6FxuA9vxlvz5cKQCt3', language = 'es') {
  if (!ask) return { status: false, resultado: { msg: 'Debes ingresar un texto para hablar con simsimi.' } }
  try {
    let response11 = await chatsimsimi(ask, language)
    if (response11.message == 'indefinida' || !response11.message) throw new Error('Respuesta vacía')
    return { status: true, resultado: { simsimi: response11.message } }
  } catch (error1) {
    try {
      const response1 = await axios.get(`https://delirius-apiofc.vercel.app/tools/simi?text=${encodeURIComponent(ask)}`)
      const trad1 = await translate(`${response1.data.data.message}`, { to: language, autoCorrect: true })
      if (trad1.text == 'indefinida' || !trad1.text) throw new Error('Respuesta vacía')
      return { status: true, resultado: { simsimi: trad1.text } }
    } catch {
      try {
        const response2 = await axios.get(`https://api.anbusec.xyz/api/v1/simitalk?apikey=${apikeyyy}&ask=${encodeURIComponent(ask)}&lc=${language}`)
        return { status: true, resultado: { simsimi: response2.data.message } }
      } catch (error2) {
        return { status: false, resultado: { msg: 'Todas las API’s fallaron. Inténtalo de nuevo más tarde.', error: error2.message } }
      }
    }
  }
}

async function chatsimsimi(ask, language) {
  try {
    const response = await axios.post(
      'https://simi.anbuinfosec.live/api/chat',
      { ask, lc: language },
      {
        headers: {
          'sec-ch-ua-platform': '"Android"',
          Referer: 'https://simi.anbuinfosec.live/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)',
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch {
    return { success: false, message: 'An error occurred.', author: 'https://facebook.com/anbuinfosec' }
  }
}
