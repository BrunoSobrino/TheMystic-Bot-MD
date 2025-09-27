const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  try {
    const datas = global
    const idioma = datas?.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es'
    let _translate = {}
    try {
      _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    } catch (e) {
      // fallback si no existe idioma
      try { _translate = JSON.parse(fs.readFileSync(`./src/languages/es.json`)) } catch (e) { _translate = {} }
    }
    const tradutor = _translate.plugins?.gc_warn || {}

    const bot = global.db?.data?.settings?.[conn.user.jid] || {}
    const pp = './src/assets/images/menu/main/warn.jpg'

    // --- Determinar "who" robustamente ---
    let who = null

    // 1) Si respondió (quoted)
    if (m.quoted && m.quoted.sender) who = m.quoted.sender

    // 2) Si la librería ya trae mentionedJid
    if (!who && Array.isArray(m.mentionedJid) && m.mentionedJid.length) who = m.mentionedJid[0]

    // 3) Intentar parsear el texto con conn.parseMention (si está disponible)
    if (!who && typeof conn.parseMention === 'function') {
      const parsed = conn.parseMention(text || '')
      if (Array.isArray(parsed) && parsed.length) who = parsed[0]
    }

    // 4) Si el primer arg parece número/telefono -> convertir a JID
    if (!who && args && args.length) {
      const onlyDigits = args[0].replace(/[^0-9]/g, '')
      if (onlyDigits.length >= 5) {
        who = `${onlyDigits}@s.whatsapp.net`
      }
    }

    // 5) Buscar por @Nombre en los participantes (cuando el usuario escribe @Marcos sin metadata)
    if (!who && m.isGroup && text) {
      const atName = text.match(/@([^@\s]+)/)
      if (atName) {
        const nameToFind = atName[1].toLowerCase()
        try {
          const metadata = await conn.groupMetadata(m.chat)
          for (const p of metadata.participants) {
            const id = p.id || p
            // getName suele devolver el nombre a mostrar del contacto
            let display = ''
            try { display = (await conn.getName(id)) || '' } catch (e) { display = '' }
            // también intentar con contacts cache
            if ((!display || display === '') && conn.contacts && conn.contacts[id]) {
              display = conn.contacts[id].name || conn.contacts[id].notify || ''
            }
            if (display && display.toLowerCase().includes(nameToFind)) {
              who = id
              break
            }
          }
        } catch (e) {
          // ignore metadata errors
        }
      }
    }

    // Si no se pudo determinar a quién advertir, informar uso
    if (!who) {
      const warntext = `${tradutor.texto1 || 'Indica a quién advertir'}\n*${usedPrefix + command} @usuario*`
      return m.reply(warntext, m.chat, { mentions: typeof conn.parseMention === 'function' ? conn.parseMention(warntext) : [] })
    }

    // Evitar advertir al bot o al propio autor
    if (who === conn.user.jid) return m.reply('No puedo advertirme a mí mismo.')
    if (who === m.sender) return m.reply('No puedes advertirte a ti mismo.')

    // Asegurar entrada en la DB
    if (!global.db) global.db = { data: { users: {}, settings: {} } }
    if (!global.db.data) global.db.data = { users: {}, settings: {} }
    if (!global.db.data.users[who]) global.db.data.users[who] = {}
    const user = global.db.data.users[who]

    // Motivo opcional (elimina tokens @nombre del texto)
    const reason = (text || '').replace(/@\S+/g, '').trim() || 'Sin motivo'

    // Incrementar warn
    user.warn = (user.warn || 0) + 1

    // Mensaje al chat con mention
    const lines = []
    lines.push(`*@${who.split('@')[0]}* ${ (tradutor.texto2 && tradutor.texto2[0]) || 'RECIBIO UNA ADVERTENCIA EN ESTE GRUPO!' }`)
    lines.push(`Motivo: ${reason}`)
    // Si tradutor.texto2[1] es la palabra "ADVERTENCIAS" u otra estructura, intenta respetarla
    const suffix = (Array.isArray(tradutor.texto2) && tradutor.texto2[1]) ? tradutor.texto2[1] : 'ADVERTENCIAS'
    lines.push(`${ suffix } ${user.warn}/6`)
    await m.reply(lines.join('\n'), m.chat, { mentions: [who] })

    // Si llega a 6 -> expulsar (si restrict está habilitado)
    if (user.warn >= 6) {
      if (!bot.restrict) {
        return m.reply(`${ (tradutor.texto3 && tradutor.texto3[0]) || 'Necesitas habilitar restrict' } (#enable restrict) ${ (tradutor.texto3 && tradutor.texto3[1]) || '' }`)
      }
      user.warn = 0
      await m.reply(`${ (tradutor.texto4 && tradutor.texto4[0]) || 'Se expulsará al usuario'}\n*@${who.split('@')[0]}* ${ (tradutor.texto4 && tradutor.texto4[1]) || 'ha sido expulsado' }`, m.chat, { mentions: [who] })
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
    }

    return !1
  } catch (err) {
    console.error(err)
    return m.reply('Ocurrió un error al ejecutar el comando warn.')
  }
}

handler.tags = ['group']
handler.help = ['warn']
handler.command = /^(advertir|advertencia|warn|warning)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
