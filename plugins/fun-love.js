let handler = async (m, { conn, command, text }) => {
let love = `*✨💜نسبه💜✨*
*نسبة  ${text} هي ✨💜* *${Math.floor(Math.random() * 100)}%* *من 100%*
*━━▣━◤🎩◢━▣━━*
`.trim()
m.reply(love, null, { mentions: conn.parseMention(love) })}
handler.help = ['love']
handler.tags = ['fun']
handler.command = /^(نسبه)$/i
export default handler
