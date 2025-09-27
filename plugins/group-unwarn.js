import fs from 'fs'

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_unwarn

  let who

  if (m.isGroup) {
    if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else if (text) {
      const numero = text.replace(/[^0-9]/g, '')
      if (numero) who = numero + '@s.whatsapp.net'
    }
  } else {
    who = m.chat
  }

  const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`

  if (!who) {
    throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
  }

  // crear registro de usuario si no existe
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {}
  }

  // asegurar propiedad warn
  if (typeof global.db.data.users[who].warn !== 'number') {
    global.db.data.users[who].warn = 0
  }

  const user = global.db.data.users[who]

  // evitar unwarn al bot
  if (who === conn.user.jid) return

  if (user.warn <= 0) {
    throw tradutor.texto2 // no tiene warns
  }

  user.warn -= 1

  await m.reply(
    `♻️ *@${who.split('@')[0]}* ${tradutor.texto3} ${user.warn}/6*`,
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
