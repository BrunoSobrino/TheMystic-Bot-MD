/*  
   * Adaptación para Código de Carousel echo por:
   * by: https://github.com/GataNina-Li/
*/

import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command, text }) => {
const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_pinterest
  
let query = text.trim()

  const sections = [{
    title: `${htki} LISTA ${htka}`,
    rows: [{
      header: 'wwww',
      title: "ADMFJ",
      description: 'yyyyyyy',
      id: ".MENU"
    }, {
      title: "ADJNF",
      id: ".MENU"
    }, {
      title: "DNFKV",
      id: ".MENU" 
    }, {
      title: "DHJNS",
      id: ".MENU"
    }, ]
  }, ]  

const listMessage = {
text: 'Texto',
footer: '┏- - - - -  INFO - - - - -\n┊ 🅟 = Premium\n┊ Ⓕ = Free\n┗•',
title: `❏––––[ *TEX* ]–––`,
buttonText: "- -- -",
sections
  }

async function getPinterestImages(query) {
let response = await fetch(`https://aemt.me/pinterest?query=${encodeURIComponent(query)}`)
let data = await response.json()
return data.result
}

async function getGoogleImages(query) {
let response = await fetch(`https://aemt.me/googleimage?query=${encodeURIComponent(query)}`)
let data = await response.json()
return data.result
}

async function sendPinterestCarousel(conn, chat, query, usedPrefix) {
let images = await getPinterestImages(query)
const messages = images.map((image) => [ null, null, 
image, 
[['u', usedPrefix + `pinterest ${query}`], ['Buscar con Google 🌐', usedPrefix + `image2 ${query}`]],
null, 
[['🔗 Enlace de imagen', image]], 
[['DDDDD', sections]]
])
await conn.sendCarousel(chat, `${tradutor.texto2}`, 'Imágenes', '✨ Imágenes de Pinterest', messages)
}

async function sendGoogleCarousel(conn, chat, query, usedPrefix) {
let images = await getGoogleImages(query);
const messages = images.map((image) => [ null, null, 
image, 
[['Buscar de nuevo 🔎', usedPrefix + `image2 ${query}`], ['Buscar con Pinterest ✨', usedPrefix + `pinterest ${query}`]], 
null, 
[['🔗 Enlace de imagen', image]], 
[]
])
await conn.sendCarousel(chat, '🤩 *Resultados de Google*', 'Imágenes', '✅ Imágenes de Google', messages)
}

if (!query) {
conn.reply(m.chat, `${tradutor.texto1} ${usedPrefix + command} Minecraft*`, m)
return
}

if (command === 'pinterest') {
await sendPinterestCarousel(conn, m.chat, query)
} else if (command === 'image2') {
await sendGoogleCarousel(conn, m.chat, query)
}
}

handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest|imagen2)$/i;
export default handler;


/*import {pinterest} from '@bochilteam/scraper';


const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_pinterest


  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Minecraft*`;
  const json = await pinterest(text);
  conn.sendFile(m.chat, json.getRandom(), 'error.jpg', `
${tradutor.texto2}
${text}
`.trim(), m);
};
handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest)$/i;
export default handler;
*/
