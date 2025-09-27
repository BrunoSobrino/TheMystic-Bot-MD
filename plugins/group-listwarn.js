import fs from "fs"

const handler = async (m, { conn, isOwner }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_listwarn

  // 🔹 Normalizar todos los usuarios antes de filtrar
  for (const jid in global.db.data.users) {
    const u = global.db.data.users[jid]
    u.warn = Number(u.warn) || 0
  }

  const adv = Object.entries(global.db.data.users).filter(([jid, u]) => u.warn > 0)

  const imagewarn = './src/assets/images/menu/main/warn.jpg'
  let mentions = []

  const caption = `${tradutor.texto1}\n
*╔═══════════════════·•*
║ ${tradutor.texto2[0]} ${adv.length} ${tradutor.texto2[1]}
${adv.length > 0 ? adv.map(([jid, user], i) => {
    const numero = jid.split('@')[0]
    const display = isOwner ? `@${numero}` : numero
    mentions.push(jid)
    return `
║ ${i + 1}.- ${display} *(${user.warn}/6)*
║ - - - - - - - - -`
  }).join('\n') : ''}
*╚══════════════════·•*`

  await conn.sendMessage(
    m.chat,
    { text: caption, mentions },
    { quoted: m }
  )
}

handler.help = ['listwarn']
handler.tags = ['group']
handler.command = /^(listwarn)$/i
handler.group = true
handler.admin = true

export default handler
