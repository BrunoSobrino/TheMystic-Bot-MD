//Código creado por https://github.com/GataNina-Li || @gata_dios
import fs from 'fs'
import axios from 'axios'
import fetch from "node-fetch"
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import formData from 'form-data'
let handler = async (m, { conn, args, usedPrefix, command, text }) => {
try {   
let url
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
//const urlRegex = /\.(jpg|jpeg|png)$/i;
//const pageUrlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
//if (pageUrlRegex.test(text) && urlRegex.test(text)) {
if (text) {
url = text
    
} else if (m.quoted && /image\/(png|jpe?g)/.test(mime) || mime.startsWith('image/')) {
let media = await q.download()
url = await uploadImage(media)
    
} else if (m.quoted && /image\/webp/.test(mime)) {
let media = await q.download()
url = await webp2png(media)
    
} else {
return m.reply('Ingrese un enlace o responda al mensaje con una imagen en formato PNG o JPG o JPEG.')
}
const apiKeys = ["45e67c4cbc3d784261ffc83806b5a1d7e3bd09ae", "d3a88baf236200c2ae23f31039e599c252034be8", "a74012c56b54b8d36d2675e12b1a216809c353fe",
"9812eb9464efa1201c69e5592ba0c74e7edd95e8", "2e7da9f5e70c65f2885b07d48595ba03c4be2ba7", "dafca3c54e59ae1b7fea087ca75984f9e64b74e1"]
let response;
let success = false;
for (let i = 0; i < apiKeys.length; i++) {
const apiKey = apiKeys[i]
try {
response = await axios.get(`https://saucenao.com/search.php?db=999&output_type=2&testmode=1&numres=6&api_key=${apiKey}&url=${encodeURIComponent(url)}`)
success = true;
break;
} catch (error) {
//console.error(error);
}}
if (!success) {
m.reply("Todas las solicitudes fallaron. No se pudo encontrar una respuesta exitosa.")
return 
}
const results = response.data.results;
const primerResultado = results[0]
    
let resultadoEnBruto = ''
for (let prop in primerResultado.header) {
let propName = '';
switch (prop) {
case 'similarity': propName = 'Puntuación de similitud' 
break                              
case 'author_name': propName = 'Nombre del autor' 
break      

default:
propName = prop;  
}
resultadoEnBruto += `*${propName}*\n${primerResultado.header[prop]}\n\n`}
//resultadoEnBruto += ''
    
for (let prop in primerResultado.data) {
let propName = ''
switch (prop) {
case 'title': propName = 'Título' 
break        
case 'ext_urls': propName = 'URLs' 
break        
case 'member_name': propName = 'Nombre del autor' 
break                
case 'source': propName = 'Fuente' 
break                       
case 'author_name': propName = 'Nombre del Autor' 
break        
case 'author_url': propName = 'URL del Autor' 
break

default:
propName = prop               
}
resultadoEnBruto += `*${propName}*\n${primerResultado.data[prop]}\n\n`}
    
let twa = {key: {participant: "0@s.whatsapp.net", "remoteJid": "0@s.whatsapp.net"}, "message": {"groupInviteMessage": {"groupJid": "51995386439-1616969743@g.us", "inviteCode": "m", "groupName": "P", "caption": wm, 'jpegThumbnail': await(await fetch(primerResultado.header.thumbnail)).buffer()}}}
await conn.reply(m.chat, '_*ESPERE UN MOMENTO...*_', twa, m)
await conn.reply(m.chat, `*◎ R E S U L T A D O*

${resultadoEnBruto}`, twa, m)
} catch (e) {
await m.reply(lenguajeGB['smsMalError3']() + '\n*' + lenguajeGB.smsMensError1() + '*\n*' + usedPrefix + `${lenguajeGB.lenguaje() == 'es' ? 'reporte' : 'report'}` + '* ' + `${lenguajeGB.smsMensError2()} ` + usedPrefix + command)
console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)}
}
handler.command = /^sauce|source|salsa|zelda$/i
export default handler
