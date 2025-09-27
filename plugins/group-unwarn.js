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
    } else if (m.quoted?.sender) {
      who = m.quoted.sender
    } else if (text) {
      const numero = text.replace(/\D/g, '')
      if (numero) {
        const a = `${numero}@s.whatsapp.net`
        const b = `${numero}@c.us`
        if (global.db.data.users[a]) who = a
        else if (global.db.data.users[b]) who = b
        else who = a
      }
    }
  } else {
    who = m.chat
  }

  const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`

  if (!who) {
    return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
  }

  // 🔹 Normalizar usuario y warn
  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]
  user.warn = Number(user.warn) || 0

  if (who === conn.user.jid) return

  if (user.warn <= 0) {
    return m.reply(tradutor.texto2, null, { mentions: [who] })
  }

  user.warn = Math.max(0, user.warn - 1)

  await m.reply(
    `♻️ *@${who.split('@')[0]}* ${tradutor.texto3} ${user.warn}/6`,
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
