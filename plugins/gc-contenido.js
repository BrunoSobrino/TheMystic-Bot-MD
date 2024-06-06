let handler = async (m, { conn }) => {
m.reply(global.contenido)}
handler.help = ['contenido']
handler.tags = ['grupo']
handler.command = /^(contenido|listacontenido|listcontenido|contenidopermitido)$/i
handler.group = true;
export default handler

global.contenido = `*_✅|CONTENIDO PERMITIDO_*
★ Futanari
★ Trapos/Femboy's
★ Hentai/Furry
★ Transexual
★ Porno normal
★ Lolis (solo estilo de dibujo/animado)

*_❌|CONTENIDO PROHIBIDO_*
✦ Earfuck
✦ Scat
✦ Necrofilia 
✦ Zoofilia
✦ Gore
✦ Vore
✦ CP (Child Porn)

⭐| Recuerda que la temática tiene que ser más de Futanari.`
