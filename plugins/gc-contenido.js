let handler = async (m, { conn }) => {
m.reply(global.contenido)}
handler.help = ['contenido']
handler.tags = ['grupo']
handler.command = /^(contenido|listacontenido|listcontenido|contenidopermitido)$/i
handler.group = true;
export default handler

global.contenido = `*_✅|CONTENIDO PERMITIDO_*
★ F

*_❌|CONTENIDO PROHIBIDO_*
✦ 

⭐| Recuerda que la temática tiene que ser más de.`
