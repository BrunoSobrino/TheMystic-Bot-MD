let handler = async (m, { conn, command, text }) => {
let stupidity = `*🙂نسبة الغباء🙂*
*نسبة غباء ${text}🙂هي* *${Math.floor(Math.random() * 100)}%* *من 100%*
*ربنا يهديكم💙☁️*
`.trim()
m.reply(stupidity, null, { mentions: conn.parseMention(stupidity) })}
handler.help = ['stupidity']
handler.tags = ['fun']
handler.command = /^(غباء)$/i
export default handler
