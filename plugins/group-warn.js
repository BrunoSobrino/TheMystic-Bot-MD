const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  try {
    const datas = global
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins.gc_warn

    const bot = global.db.data.settings[conn.user.jid] || {}
    const pp = './src/assets/images/menu/main/warn.jpg'

    // Determinar a quién dar warn
    let who
    if (m.isGroup) {
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]
      } else if (m.quoted) {
        who = m.quoted.sender
      } else if (args[0]) {
        // Permite escribir el número directamente: .warn 5491234567890
        who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      }
    } else {
      who = m.chat
    }

    if (!who) {
      const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @usuario*`
      return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
    }

    if (who === conn.user.jid) return // Evita dar warn al bot

    const user = global.db.data.users[who]
    if (!user) return m.reply(`${tradutor.texto5 || 'Usuario no encontrado en la base de datos.'}`)

    // Motivo opcional
    const dReason = 'Sin motivo'
    const msgtext = text ? text.replace(/@\d+/g, '').trim() : dReason

    // Aumenta el warn
    user.warn = (user.warn || 0) + 1

    await m.reply(
      `*@${who.split('@')[0]}* ${tradutor.texto2[0]} ${msgtext}\n${tradutor.texto2[1]} ${user.warn}/6*`,
      null,
      { mentions: [who] }
    )

    // Si llega al límite, expulsar
    if (user.warn >= 6) {
      if (!bot.restrict) {
        return m.reply(`${tradutor.texto3[0]} (#enable restrict) ${tradutor.texto3[1]}`)
      }
      user.warn = 0
      await m.reply(
        `${tradutor.texto4[0]}\n*@${who.split('@')[0]}* ${tradutor.texto4[1]}`,
        null,
        { mentions: [who] }
      )
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    }

    return !1
  } catch (e) {
    console.error(e)
    m.reply('Ocurrió un error con el comando warn.')
  }
}

handler.tags = ['group']
handler.help = ['warn']
handler.command = /^(advertir|advertencia|warn|warning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
