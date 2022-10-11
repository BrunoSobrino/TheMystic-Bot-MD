let handler = async(m, { conn, text }) => {
  if (!text) throw `[❗𝐈𝐍𝐅𝐎❗] No se ha detectado ningún prefijo...`
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  await m.reply(`[❗𝐈𝐍𝐅𝐎❗] El prefijo ha sido cambiado a *${text}*`)
    // conn.fakeReply(m.chat, '[❗𝐈𝐍𝐅𝐎❗] El prefijo ha sido cambiado a *${text}*', '0@s.whatsapp.net', 'Set Prefix Bot')
}
handler.help = ['setprefix'].map(v => v + ' [prefix]')
handler.tags = ['owner']
handler.command = /^(setprefix)$/i
handler.rowner = true

export default handler 
