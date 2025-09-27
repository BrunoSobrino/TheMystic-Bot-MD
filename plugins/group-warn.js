const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_warn

  // Helper para normalizar a JID
  const normalizeJid = (id) => {
    if (!id) return id
    id = String(id).trim()
    if (id.endsWith('@s.whatsapp.net')) return id
    if (id.includes('@')) return id.split('@')[0] + '@s.whatsapp.net'
    if (/^\d+$/.test(id)) return id + '@s.whatsapp.net'
    return id
  }

  // Resolver el target (who)
  let who
  if (m.isGroup) {
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
      who = m.quoted.sender
    } else if (text) {
      // Si se pasa un número o jid en el texto
      const candidate = text.split(' ')[0].trim()
      who = normalizeJid(candidate)
    }
  } else {
    who = m.chat
  }

  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`
    return m.reply(warntext, m.chat, { mentions: conn.parseMention ? conn.parseMention(warntext) : [] })
  }

  // Proteger contra menciones al bot
  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  if (mentioned.includes(conn.user.jid)) return

  // Asegurar estructura DB y campo warn
  global.db = global.db || { data: { users: {}, settings: {} } }
  global.db.data.users[who] = global.db.data.users[who] || {}
  const user = global.db.data.users[who]
  const bot = global.db.data.settings[conn.user.jid] || {}

  if (typeof user.warn !== 'number') user.warn = 0

  // Motivo del warn
  const dReason = 'Sin motivo'
  const msgtext = text || dReason
  const sdms = msgtext.replace(/@\d+-?\d* /g, '')

  // Aplicar warn
  user.warn += 1
  await m.reply(
    `*@${who.split('@')[0]}* ${tradutor.texto2[0]} ${sdms}\n${tradutor.texto2[1]} ${user.warn}/6*`,
    m.chat,
    { mentions: [who] }
  )

  // Si llegó al máximo, expulsar
  if (user.warn >= 6) {
    if (!bot.restrict) {
      return m.reply(`${tradutor.texto3[0]} (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) ${tradutor.texto3[1]}`, m.chat)
    }
    user.warn = 0
    await m.reply(`${tradutor.texto4[0]}\n*@${who.split('@')[0]}* ${tradutor.texto4[1]}`, m.chat, { mentions: [who] })
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
