// Codigo creado por: (@glytglobal)

import fetch from 'node-fetch'

let handler = async (m, { text }) => {
  if (!text) return m.reply(`*[ ❗️ ] INGRESA EL TITULO O NOMBRE DEL SCRAPER DE NPMJS (NPM.ORG) A BUSCAR*`)
  let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`)
  let { objects } = await res.json()
  if (!objects.length) return m.reply(`[ ❗️ ] LA BUSQUEDA "${text}" NO FUE ENCONTRADA\n\nINTENTE CON OTRO TIPO DE RESULTADOS`)
  let txt = objects.map(({ package: pkg }) => {
    return `
  ℹ️ Nombre: ${pkg.name}
  🧿 Versión: V${pkg.version}
  🔗 Link: ${pkg.links.npm}
  🔮 Descripción: ${pkg.description}\n\n\`\`\`----------\`\`\``
  }).join`\n`
  m.reply(txt)
}
handler.help = ['npmjs']
handler.tags = ['search']
handler.command = /^npmjs?$/i

export default handler
