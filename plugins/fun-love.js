let handler = async (m, { conn, command, text }) => {
conn.reply(m.chat, `
*❤️❤️ MEDIDOR DE AMOR ❤️❤️*
*El amor de ${text} por ti es de* *${Math.floor(Math.random() * 100)}%* *de un 100%*
*Deberias pedirle que sea tu  novia/o ?*
`.trim(), m, m.mentionedJid ? {
contextInfo: {
mentionedJid: m.mentionedJid
}} : {})}
handler.help = ['love']
handler.tags = ['fun']
handler.command = /^(love)$/i
export default handler
