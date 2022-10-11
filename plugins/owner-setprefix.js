let handler = async(m, { conn, text }) => {
  if (!text) throw `[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾 𝚂𝙴 𝙷𝙰 𝙳𝙴𝚃𝙴𝙲𝚃𝙰𝙳𝙾 𝙽𝙸𝙽𝙶𝚄𝙽 𝙿𝚁𝙴𝙵𝙸𝙹𝙾...`
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  await m.reply(`[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝙷𝙰 𝚂𝙸𝙳𝙾 𝙲𝙰𝙼𝙱𝙸𝙰𝙳𝙾 𝙰  *${text}*`)
    // conn.fakeReply(m.chat, '[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝙷𝙰 𝚂𝙸𝙳𝙾 𝙲𝙰𝙼𝙱𝙸𝙰𝙳𝙾 𝙰 *${text}*', '0@s.whatsapp.net', 'Set Prefix Bot')
}
handler.help = ['setprefix'].map(v => v + ' [prefix]')
handler.tags = ['owner']
handler.command = /^(setprefix)$/i
handler.rowner = true

export default handler 
