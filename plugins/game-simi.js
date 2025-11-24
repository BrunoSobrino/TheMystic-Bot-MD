import fs from 'fs'
import translate from '@vitalets/google-translate-api'
import axios from 'axios'

const handler = async (m, { conn, text, command, args, usedPrefix }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.fun_simi

  const botJid = (conn.user && (conn.user.jid || conn.user.id)) || ''
  const mentionedJids = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  const mentioned = mentionedJids.includes(botJid)
  const quotedFromBot = m.quoted?.sender === botJid

  // Si menciona o responde al bot, tomar ese texto
  if (!text && (mentioned || quotedFromBot)) {
    text = (m.text || '').replace(new RegExp(`@${botJid.split('@')[0]}`, 'gi'), '').trim()
  }

  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Hola Bot*`

  try {
    const resSimi = await simitalk(text)
    await conn.sendMessage(m.chat, { text: resSimi.resultado.simsimi }, { quoted: m })
  } catch (err) {
    console.error(err)
    throw tradutor.texto2
  }
}

handler.before = async (m, { conn }) => {
  const botJid = (conn.user && (conn.user.jid || conn.user.id)) || ''
  const mentionedJids = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  const mentioned = mentionedJids.includes(botJid)
  const quotedFromBot = m.quoted?.sender === botJid

  if (mentioned || quotedFromBot) {
    const text = (m.text || '').replace(new RegExp(`@${botJid.split('@')[0]}`, 'gi'), '').trim()
    if (!text) return

    try {
      const resSimi = await simitalk(text)
      await conn.sendMessage(m.chat, { text: resSimi.resultado.simsimi }, { quoted: m })
    } catch (err) {
      console.error('Error en simi.auto:', err)
    }
  }
}

handler.help = ['simi', 'bot'].map(v => v + ' <texto>')
handler.tags = ['game']
handler.command = /^((sim)?simi|bot|alexa|cortana)$/i

export default handler

async function simitalk(ask, apikeyyy = "iJ6FxuA9vxlvz5cKQCt3", language = "es") {
  if (!ask) return { status: false, resultado: { msg: "Debes ingresar un texto para hablar con SimSimi." } }
  try {
    const response11 = await chatsimsimi(ask, language)
    if (!response11.message || response11.message === 'indefinida') throw new Error()
    return { status: true, resultado: { simsimi: response11.message } }
  } catch {
    try {
      const response1 = await axios.get(`https://delirius-apiofc.vercel.app/tools/simi?text=${encodeURIComponent(ask)}`)
      const trad1 = await translate(`${response1.data.data.message}`, { to: language, autoCorrect: true })
      if (!trad1.text || trad1.text === 'indefinida') throw new Error()
      return { status: true, resultado: { simsimi: trad1.text } }
    } catch {
      try {
        const response2 = await axios.get(`https://api.anbusec.xyz/api/v1/simitalk?apikey=${apikeyyy}&ask=${ask}&lc=${language}`)
        return { status: true, resultado: { simsimi: response2.data.message } }
      } catch (error2) {
        return { status: false, resultado: { msg: "Todas las APIs fallaron.", error: error2.message } }
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
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5)'
        }
      }
    )
    return response.data
  } catch (error) {
    return { success: false, message: 'Error en SimSimi API.' }
  }
}
