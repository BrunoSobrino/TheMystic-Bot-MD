import fs from 'fs'

const handler = async (m, {conn, args, text, command, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_warn

  // Asegurar que mentionedJid sea siempre array
  let mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  if (!mentioned.length && text) mentioned = conn.parseMention(text)

  let who
  if (m.isGroup) {
    if (mentioned[0]) {
      who = mentioned[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else if (text) {
      who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }
  } else {
    who = m.chat
  }

  // Evitar warn al bot
  if (who === conn.user.jid) return

  const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`
  if (!who) {
    throw m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)})
  }

  // Crear registro si no existe
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {warn: 0}
  }

  const user = global.db.data.users[who]
  const bot = global.db.data.settings[conn.user.jid] || {}

  const dReason = 'Sin motivo'
  const msgtext = text || dReason
  const sdms = msgtext.replace(/@\d+-?\d* /g, '')

  user.warn += 1

  await m.reply(
    `*@${who.split('@')[0]}* ${tradutor.texto2[0]} ${sdms}\n${tradutor.texto2[1]} ${user.warn}/6*`,
    null,
    {mentions: [who]}
  )

  if (user.warn >= 6) {
    if (!bot.restrict) {
      return m.reply(`${tradutor.texto3[0]} (#enable restrict) ${tradutor.texto3[1]}`)
    }
    user.warn = 0
    await m.reply(
      `${tradutor.texto4[0]}\n*@${who.split('@')[0]}* ${tradutor.texto4[1]}`,
      null,
      {mentions: [who]}
    )
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  }
}

handler.tags = ['group']
handler.help = ['warn']
handler.command = /^(advertir|advertencia|warn|warning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
