// - Código desarrollado por: GabrielVz <@glytglobal>

import fetch from 'node-fetch'
import fs from 'fs';

let handler = async (m, { text, conn }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.search_npmjs
if (!text) return m.reply(tradutor.texto1)
let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`)
let { objects } = await res.json()
if (!objects.length) return m.reply(tradutor.texto2)
let npmtext = objects.map(({ package: pkg }) => {
return `${tradutor.texto3[0]}${pkg.name}*\n${tradutor.texto3[1]}${pkg.version || tradutor.texto3[4]}*\n${tradutor.texto3[2]}${pkg.description || tradutor.texto3[4]}*\n${tradutor.texto3[3]}${pkg.links.npm || tradutor.texto3[4]}*\n\n─────────────────`
}).join`\n\n`

conn.sendMessage(m.chat, { text: npmtext }, { quoted: m });
}
handler.help = ['npmjs']
handler.tags = ['search']
handler.command = /^npmjs?$/i

export default handler;
