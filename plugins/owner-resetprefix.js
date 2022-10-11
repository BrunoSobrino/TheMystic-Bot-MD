let handler = async(m, { conn }) => {

  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
    await m.reply(`[❗𝐈𝐍𝐅𝐎❗] Prefijo restablecido con éxito`)
    // conn.fakeReply(m.chat, '[❗𝐈𝐍𝐅𝐎❗] Prefijo restablecido con éxito', '0@s.whatsapp.net', 'Reset Prefix')
}
handler.help = ['resetprefix']
handler.tags = ['owner']
handler.command = /^(resetprefix)$/i
handler.rowner = true


export default handler
