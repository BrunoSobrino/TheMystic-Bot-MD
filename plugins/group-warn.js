const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_warn

  // helpers
  const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const normalizeJid = (id) => {
    if (!id) return id
    id = String(id).trim()
    // quitar arrobas iniciales si las trae
    id = id.replace(/^@+/, '')
    // quedarnos sólo con el primer token (por si vienen cosas después)
    id = id.split(/\s+/)[0]
    // si ya es un jid conocido
    if (id.endsWith('@s.whatsapp.net') || id.endsWith('@c.us')) return id
    // número con + opcional
    if (/^\+?\d+$/.test(id)) return id.replace(/^\+/, '') + '@s.whatsapp.net'
    // si contiene @ pero no es dominio s.whatsapp.net
    if (id.includes('@')) return id.split('@')[0] + '@s.whatsapp.net'
    // fallback intentar tratar como número
    if (/^\d+$/.test(id)) return id + '@s.whatsapp.net'
    // último recurso
    return id + '@s.whatsapp.net'
  }

  // Resolver target (who)
  let who
  let candidateRaw = null

  if (m.isGroup) {
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
      who = m.quoted.sender
    } else if (text) {
      candidateRaw = text.split(' ')[0].trim()
      // si es @nombre (no numérico) intentamos buscar por displayName
      if (candidateRaw.startsWith('@') && !/@\d+/.test(candidateRaw)) {
        try {
          const metadata = await conn.groupMetadata(m.chat)
          const matchName = candidateRaw.replace(/^@+/, '').toLowerCase()
          for (const p of (metadata.participants || [])) {
            const id = p.id || p
            // getName existe en muchas libs de baileys; si no, se usa el id
            const name = conn.getName ? await conn.getName(id) : id
            if (!name) continue
            if (name.toLowerCase() === matchName || name.toLowerCase().includes(matchName)) {
              who = id
              break
            }
          }
        } catch (e) {
          // no rompemos si falla groupMetadata
        }
      }
      // si no lo encontramos por nombre, normalizamos a jid (número/jid)
      if (!who) who = normalizeJid(candidateRaw)
    }
  } else {
    who = m.chat
  }

  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`
    return m.reply(warntext, m.chat, { mentions: conn.parseMention ? conn.parseMention(warntext) : [] })
  }

  // Proteger contra advertir al bot
  if (who === conn.user.jid) return

  // Asegurar estructura DB y campo warn
  global.db = global.db || { data: { users: {}, settings: {} } }
  global.db.data.users[who] = global.db.data.users[who] || {}
  const user = global.db.data.users[who]
  const bot = global.db.data.settings[conn.user.jid] || {}
  if (typeof user.warn !== 'number') user.warn = 0

  // Extraer motivo: borramos el candidateRaw del inicio si existe
  const dReason = 'Sin motivo'
  let reason = dReason
  if (text && text.trim()) {
    reason = text.trim()
    if (candidateRaw) {
      reason = reason.replace(new RegExp('^\\s*' + escapeRegex(candidateRaw)), '').trim()
    }
    if (!reason) reason = dReason
  }

  // Aplicar warn
  user.warn += 1
  await m.reply(
    `*@${(await conn.getName(who) || who.split('@')[0])}* ${tradutor.texto2[0]} ${reason}\n${tradutor.texto2[1]} ${user.warn}/6*`,
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
