let handler = async (m, { conn }) => {
m.reply(global.concurso)}
handler.help = ['concurso']
handler.tags = ['grupo']
handler.command = /^(concurso|concursofutabuclub)$/i
export default handler

global.concurso = `Nada aún!`
