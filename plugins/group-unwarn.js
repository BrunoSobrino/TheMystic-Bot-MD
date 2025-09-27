import fs from 'fs'

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_unwarn

  let who

  if (m.isGroup) {
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
      who = m.quoted.sender
    } else if (text) {
      const numero = text.replace(/\D/g, '')
      if (numero) {
        // intentamos escoger la JID que exista en la DB (preferir la real si la hay)
        const a = `${numero}@s.whatsapp.net`
        const b = `${numero}@c.us`
        if (global.db.data.users[a]) who = a
        else if (global.db.data.users[b]) who = b
        else who = a // fallback si no hay registro
      }
    }
  } else {
    who = m.chat
  }

  const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`

  if (!who) {
    return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
  }

  // Asegurar estructura de usuario en la DB
  if (!global.db.data.users[who]) global.db.data.users[who] = {}

  // Normalizar warn (si viene como "1" lo convertimos a 1, si viene null/undefined -> 0)
  const rawWarn = global.db.data.users[who].warn
  const warnNumber = Number(rawWarn) || 0
  global.db.data.users[who].warn = warnNumber

  // Evitar unwarn al bot
  if (who === conn.user.jid) return

  if (global.db.data.users[who].warn <= 0) {
    // responder indicando que no tiene warns (mencionando al usuario)
    return m.reply(tradutor.texto2, null, { mentions: [who] })
  }

  // Restar 1 (asegurando que no baje de 0)
  global.db.data.users[who].warn = Math.max(0, global.db.data.users[who].warn - 1)

  await m.reply(
    `♻️ *@${who.split('@')[0]}* ${tradutor.texto3} ${global.db.data.users[who].warn}/6`,
    null,
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
