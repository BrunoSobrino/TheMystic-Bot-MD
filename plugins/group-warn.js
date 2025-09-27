const handler = async (m, {conn, args, text, command, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_warn

  // Asegurar que siempre sea array
  m.mentionedJid = Array.isArray(m.mentionedJid) ? m.mentionedJid : []

  if (m.mentionedJid.includes(conn.user.jid)) return;

  if (m.mentionedJid.length === 0 && args.length > 0) {
    m.mentionedJid = conn.parseMention(text)
  }

  let who
  if (m.isGroup) {
    who = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
        ? m.quoted.sender
        : null
  } else who = m.chat

  // Si no se detectó usuario
  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`
    throw m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)})
  }

  // Si el usuario no existe en la DB, crearlo
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = { warn: 0 }
  }

  const user = global.db.data.users[who]
  const bot = global.db.data.settings[conn.user.jid] || {}
  const dReason = 'Sin motivo'
  const msgtext = text || dReason
  const sdms = msgtext.replace(/@\d+-?\d* /g, '')

  user.warn += 1

  await m.reply(
    `*@${who.split`@`[0]}* ${tradutor.texto2[0]} ${sdms}\n${tradutor.texto2[1]} ${user.warn}/6*`,
    null,
    {mentions: [who]},
  )

  if (user.warn >= 6) {
    if (!bot.restrict) {
      return m.reply(
        `${tradutor.texto3[0]} (#enable restrict) ${tradutor.texto3[1]}`,
      )
    }
    user.warn = 0
    await m.reply(
      `${tradutor.texto4[0]}\n*@${who.split`@`[0]}* ${tradutor.texto4[1]}`,
      null,
      {mentions: [who]},
    )
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  }
  return !1
}

handler.tags = ['group']
handler.help = ['warn']
handler.command = /^(advertir|advertencia|warn|warning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
