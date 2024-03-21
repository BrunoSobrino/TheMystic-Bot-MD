//CÓDIGO CREADO POR elrebelde21 : https://github.com/elrebelde21
import _translate from "./_translate.js"
const tradutor = _translate.plugins.fun_ruletas
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, isPrems}) => {
if (!db.data.chats[m.chat].game) throw tradutor.texto1 
const date = global.db.data.users[m.sender].juegos + 21600000; //21600000 = 6 hs 
if (new Date - global.db.data.users[m.sender].juegos < 21600000) throw `${tradutor.texto2[0]} ${msToTime(date - new Date())} ${tradutor.texto2[1]} `
let user = global.db.data.users[m.sender]
const prem = Math.floor(Math.random() * 3600000)
const exp = Math.floor(Math.random() * 10000)
const diamond = Math.floor(Math.random() * 300)
const money = Math.floor(Math.random() * 10000)
let rulet = ['text', 'text2', 'text3', 'text4', 'text5', 'text6']; 
let ruleta = rulet[Math.floor(Math.random() * 6)]
global.db.data.users[m.sender].juegos = new Date * 1;
if (ruleta === 'text') return m.reply(`${tradutor.texto3} ${exp} XP`).catch(global.db.data.users[m.sender].exp += exp) 
if (ruleta === 'text2') return m.reply(`${tradutor.texto4} ${exp} XP`).catch(global.db.data.users[m.sender].exp -= exp) 
if (ruleta === 'text3') return conn.groupParticipantsUpdate(m.chat, [m.sender], 'demote').catch(m.reply(tradutor.texto5)) 
if (ruleta === 'text4') return conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote').catch(m.reply(tradutor.texto6)) 
if (ruleta === 'text5') return m.reply(`${tradutor.texto7} ${diamond} 💎`).catch(global.db.data.users[m.sender].diamond += diamond) 
if (ruleta === 'text6') return m.reply(tradutor.texto8).catch(global.db.data.users[m.sender].premium += prem) 
}
handler.help = ['game'];
handler.tags = ['xp'];
handler.command = /^(ruletas|ruleta|suerte)$/i
handler.fail = null;
handler.group = true
handler.register = true
export default handler;

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? "0" + hours : hours
minutes = (minutes < 10) ? "0" + minutes : minutes
seconds = (seconds < 10) ? "0" + seconds : seconds
return hours + " Hora(s) " + minutes + " Minuto(s)"}


function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}