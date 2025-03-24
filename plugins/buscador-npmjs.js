// - Código desarrollado por: GabrielVz <@glytglobal>

import fetch from 'node-fetch'

let handler = async (m, { text }) => {
if (!text) return m.reply(`〔 ❀ 〕INGRESA EL *TITULO* DE UN *MODULO* O *COMPLEMENTO* DE LA PLATAFORMA *NPMJS*`)
let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`)
let { objects } = await res.json()
if (!objects.length) return m.reply(`〔 ❀ 〕NO SE HAN ENCONTRADO *RESULTADOS* PARA SU *BUSQUEDA* EN LA PLATAFORMA DE *NPMJS*`)
let npmpp = 'https://unitedcamps.in/Images/IMG_1742157594.jpg';
let npmtext = objects.map(({ package: pkg }) => {
return `❀ Titulo: *${pkg.name}*\n❀ Versión: *${pkg.version || 'Sin Información'}*\n❀ Información: *${pkg.description || 'Sin Información'}*\n❀ Enlace: *${pkg.links.npm || 'Sin Información'}*\n\n─────────────────`
}).join`\n\n`

conn.sendMessage(m.chat, { image: { url: npmpp }, caption: npmtext }, { quoted: m });
}
handler.help = ['npmjs']
handler.tags = ['search']
handler.command = /^npmjs?$/i

export default handler;
