let handler = async (m, { conn, command, args }) => {
  let chats
  if (/group|gc/i.test(args[0])) chats = this.chats.array.filter(v => v.jid.endsWith('g.us') && !v.pin).map(v => v.jid)
  else if (/chat|private/i.test(args[0])) chats = this.chats.array.filter(v => v.jid.endsWith('.net') && !v.pin).map(v => v.jid)
  else if (/all/i.test(args[0])) chats = Object.entries(conn.chats).array.filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map(v => v[0])
  else chats = [m.chat]
  let isDelete = /^(delete)/i.test(command)
  let isClear = /^(clear)/i.test(command)
  for (let id of chats) {
    if (isDelete || isClear) await conn.modifyChat(id, (isDelete ? 'delete' : 'clear'), {
      includeStarred: false
    }).catch(console.log)
    else await conn.modifyChat(id, 'mute', -Math.floor(new Date / 1e3) * 1e3 - 1e3).catch(console.log)
  }
  conn.reply(m.chat, chats.length + ` MeduS.A-bot | *CLEAR*\n\n La cantidad de ${args[0] ? args[0] : ''} Mensajes Fueron` + ((isDelete || isClear) ? 'ELIMINADOS' : 'PARA SIEMPRE'), m)
}
handler.help = [
  'clearchat', 
  'clearchat chat', 
  'clearchat group', 
  'clearchat all', 
  'deletechat', 
  'deletechat chat', 
  'deletechat group', 
  'deletechat all', 
  'mutechat', 
  'mutechat chat',
  'mutechat group', 
  'mutechat all'
]
handler.tags = ['owner']
handler.command = /^(clear|delete|mute)chat$/i
handler.rowner = true
export default handler
