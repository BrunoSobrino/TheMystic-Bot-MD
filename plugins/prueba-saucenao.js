//import fs from 'fs'
import axios from 'axios'
import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
const api_key = '45e67c4cbc3d784261ffc83806b5a1d7e3bd09ae'
//const image_url = 'https://i.imgur.com/oZjCxGo.jpg'

try {
let regex = /\.(jpg|jpeg|png)$/i

if (!text) return m.reply('INGRESE EL ENLACE DE UNA IMAGEN QUE TERMINE EN jpg, jpeg o png')
if (!regex.test(text)) return m.reply('SOLO SE PERMITE ENLACE DE IMAGEN QUE TERMINE EN jpg, jpeg o png')   
    
const response = await axios.get(`https://saucenao.com/search.php?db=999&output_type=2&testmode=1&numres=6&api_key=${api_key}&url=${encodeURIComponent(text)}`)
const results = response.data.results;
const primerResultado = results[0];
    
let resultadoEnBruto = ''
for (let prop in primerResultado.header) {
let propName = '';
switch (prop) {
case 'similarity': propName = 'Puntuación de similitud' 
break
        
case 'thumbnail': propName = 'URL de la miniatura' 
break
        
case 'index_id': propName = 'ID del índice' 
break
        
case 'index_name': propName = 'Nombre del índice' 
break
        
case 'dupes': propName = 'Imágenes duplicadas' 
break
        
case 'hidden': propName = 'Imágenes ocultas o bloqueadas' 
break
        
case 'author_name': propName = 'Nombre del autor' 
break 
        
case 'source': propName = 'Fuente' 
break
        
case 'material': propName = 'Material' 
break

default:
propName = prop;
}
resultadoEnBruto += `*${propName}*\n${primerResultado.header[prop]}\n`}
resultadoEnBruto += '\n'
    
for (let prop in primerResultado.data) {
let propName = ''

switch (prop) {
case 'title': propName = 'Título' 
break
        
case 'ext_urls': propName = 'URLs' 
break
        
case 'member_name': propName = 'Nombre del autor' 
break
        
case 'pixiv_id': propName = 'ID de Pixiv' 
break
        
case 'danbooru_id': propName = 'ID de Danbooru' 
break
        
case 'gelbooru_id': propName = 'ID de Gelbooru' 
break
        
case 'source': propName = 'Fuente' 
break
        
case 'material': propName = 'Material' 
break
        
case 'da_id': propName = 'ID de la imagen' 
break
        
case 'author_name': propName = 'Nombre del Autor' 
break
        
case 'author_url': propName = 'URL del Autor' 
break
        
case 'member_id': propName = 'ID del Autor' 
break
        
case 'fa_id': propName = 'ID del Autor en FurAffinity' 
break
        
case 'as_project': propName = 'Proyecto en Anime-Source' 
break

default:
propName = prop
}
resultadoEnBruto += `*${propName}*\n${primerResultado.data[prop]}\n`}
    
//let enlace = { contextInfo: { externalAdReply: { showAdAttribution: true, mediaUrl: md, mediaType: 'IMAGE', description: '', title: wm, body: '😻 𝗦𝘂𝗽𝗲𝗿 𝗚𝗮𝘁𝗮𝗕𝗼𝘁-𝗠𝗗 - 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 ', thumbnailUrl: await(await fetch(img3)).buffer(), sourceUrl: md }}}
let frep = { contextInfo: { externalAdReply: {title: wm, body: author, sourceUrl: md, thumbnail: await(await fetch(primerResultado.header.thumbnail)).buffer()}}}

await m.reply('*ESPERE UN MOMENTO...*')
await conn.sendButton(m.chat, `*Número de resultados:* ${results.length}
*Resultados encontrados:* ${Boolean(results) === true ? 'Si' : 'No'}

*◎ L Í M I T E S*

*Solicitudes restantes (corto plazo*
• ${results.short_remaining === undefined ? 'No especificado' : results.short_remaining} 

*Solicitudes restantes (largo plazo)*
• ${results.long_remaining === undefined ? 'No especificado' : results.long_remaining} 


*◎ R E S U L T A D O*

*URL de la miniatura*
• ${primerResultado.header.thumbnail}

*Puntuación de similitud*
• ${primerResultado.header.similarity}%

*Título*
• ${primerResultado.data.title}

*URLs*
• ${primerResultado.data.ext_urls}

*Autor*
• ${primerResultado.data.member_name === undefined ? 'No encontrado' : primerResultado.data.member_name}\n`,  `*◎ R E S U L T A D O  E N  B R U T O*

${resultadoEnBruto}`.trim(), text, [['𝗠 𝗘 𝗡 𝗨 ☘️', '/menu']], m, frep)
} catch (error) {
console.log(error);
}}

handler.command = /^sauce$/i
export default handler
