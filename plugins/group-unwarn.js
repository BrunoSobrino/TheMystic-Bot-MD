const handler = async (m, { conn, text, command, usedPrefix }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_unwarn

  const pp = './src/assets/images/menu/main/warn.jpg';
  let who;

  if (m.isGroup) {
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else {
      who = text
    }
  } else {
    who = m.chat
  }

  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`
    throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) })
  }

  // Normalizamos para que nunca falle .includes
  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []

  if (mentioned.includes(conn.user.jid)) return

  const user = global.db.data.users[who]
  if (!user) throw tradutor.texto2

  if (user.warn == 0) throw tradutor.texto2
  user.warn -= 1

  await m.reply(
    `${user.warn == 1 ? `*@${who.split`@`[0]}*` : `♻️ *@${who.split`@`[0]}*`} ${tradutor.texto3} ${user.warn}/3*`,
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
