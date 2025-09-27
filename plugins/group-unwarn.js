const handler = async (m, { conn, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_unwarn

  // helper para normalizar a JID
  const normalizeJid = (id) => {
    if (!id) return id
    id = String(id).trim()
    if (id.endsWith('@s.whatsapp.net')) return id
    if (id.includes('@')) return id.split('@')[0] + '@s.whatsapp.net'
    if (/^\d+$/.test(id)) return id + '@s.whatsapp.net'
    return id
  }

  // resolver target (who)
  let who
  if (m.isGroup) {
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
      who = m.quoted.sender
    } else if (text) {
      // si el comando recibe un número o un jid en el texto
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

  // proteger contra menciones al bot
  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  if (mentioned.includes(conn.user.jid)) return

  // asegurar estructura DB y campo warn
  global.db = global.db || { data: { users: {}, settings: {} } }
  global.db.data.users[who] = global.db.data.users[who] || {}
  const user = global.db.data.users[who]
  if (typeof user.warn !== 'number') user.warn = 0

  if (user.warn <= 0) {
    // Mensaje cuando no tiene warns
    return m.reply(tradutor.texto2 || '[❗] 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝚃𝙸𝙴𝙽𝙴 0 𝙰𝙳𝚅𝙴𝚁𝚃𝙴𝙽𝙲𝙸𝙰𝚂', m.chat, { mentions: [who] })
  }

  user.warn = Math.max(0, user.warn - 1)

  await m.reply(
    `${user.warn == 1 ? `*@${who.split('@')[0]}*` : `♻️ *@${who.split('@')[0]}*`} ${tradutor.texto3} ${user.warn}/3`,
    m.chat,
    { mentions: [who] }
  )
}

handler.tags = ['group']
handler.help = ['unwarn']
handler.command = /^(unwarn|delwarn|deladvertir|deladvertencia|delwarning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
