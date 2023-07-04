let handler = async (m, { conn }) => {
m.reply(global.eventos)}
handler.help = ['eventos']
handler.tags = ['grupo']
handler.command = /^(evento|eventos|eventofutabuclub)$/i
export default handler

global.eventos = `Nada aún!`
