import ws from 'ws'

const handler = async (m, { conn }) => {
  const subBots = [...new Set([...globalThis.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]

  if (!subBots.includes(globalThis.conn.user.jid)) {
    subBots.push(globalThis.conn.user.jid)
  }

  const who = m?.message?.extendedTextMessage?.contextInfo?.participant || m?.mentionedJid[0] || await m?.quoted?.sender
  const chat = globalThis.db.data.chats[m.chat]
  if (!who) return conn.reply(m.chat, `Por favor menciona un bot para convertirlo en primario.`, m)

  if (!subBots.includes(who)) return conn.reply(m.chat, `El usuario mencionado no es un bot de Mystic.`, m)

  if (chat.primaryBot === who) {
    return conn.reply(m.chat, `@${who.split`@`[0]} ya es el Bot principal del Grupo.`, m, { mentions: [who] });
  }

  try {
    chat.primaryBot = who
    conn.reply(m.chat, `@${who.split`@`[0]}.`, m, { mentions: [who] })
  } catch (e) {
    await m.reply(`${e}`);
  }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.admin = true

export default handler