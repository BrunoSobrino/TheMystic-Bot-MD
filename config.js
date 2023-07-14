import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.owner = [
  ['923074060856', '👑 Mystic - Creador 👑', true],
  ['923074060856', '💫 Mystic - Collaborator 1 💫', true],
  ['923074060856', '💫 Mystic - Collaborator 2 💫', true],
  ['923074060856', '💫 Mystic - Collaborator 3 💫', true],
  ['923074060856', '💫 Mystic - Collaborator 4 💫', true],
  ['923074060856', '💫 Mystic - Collaborator 5 💫', true],  
  ['923074060856', '💫 Mystic - Collaborator 6 💫', true],
  ['923074060856', '💫 Mystic - Collaborator 7 💫', false],
  ['923074060856'],
  ['923074060856'],
  ['923074060856'],
  ['923074060856'],	
  ['923074060856'],
  ['923074060856'],
  ['923074060856'],
  ['923074060856'],
  ['923074060856']
] 

global.suittag = ['923074060856'] 
global.prems = ['923074060856'] 
global.reportes_solicitudes = ['923074060856']

global.packname = '(☞ﾟZain🥰NawabZaaDaa ²⁰²³)☞'
global.author = '★𝐙𝐀𝐈𝐍 - 𝙱𝚘𝚝★'
global.wm = '★𝐙𝐀𝐈𝐍 - 𝙱𝚘𝚝★'
global.igfg = '★𝐙𝐀𝐈𝐍 - 𝙱𝚘𝚝★'
global.wait = '*[❗] Loading, Wait For a  Moment...*'

global.imagen1 = fs.readFileSync('./Menu2.jpg')
global.imagen2 = fs.readFileSync('./src/nuevobot.jpg') 
global.imagen3 = fs.readFileSync('./src/Pre Bot Publi.png')
global.imagen4 = fs.readFileSync('./Menu.png')
global.imagen5 = fs.readFileSync('./src/+18.jpg')

global.mods = [] 

//********Tiempo***************
global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
global.mes = d.toLocaleDateString('es', { month: 'long' })
global.año = d.toLocaleDateString('es', { year: 'numeric' })
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
//*****************************
global.wm2 = `▸ ${dia} ${fecha}\n▸ 𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝`
global.gt = '★𝐙𝐀𝐈𝐍 - 𝙱𝚘𝚝★'
global.mysticbot = '𝐙𝐀𝐈𝐍 - 𝙱𝚘𝚝★'
global.md = 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'
global.mysticbot = 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'
global.waitt = '*[❗] Loading, Wait For a  Moment...*'
global.waittt = '*[❗] Loading, Wait For a  Moment...*'
global.waitttt = '*[❗] Loading, Wait For a  Moment...*'
global.nomorown = '923074060856'
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf']
global.cmenut = '❖––––––『'
global.cmenub = '┊✦ '
global.cmenuf = '╰━═┅═━––––––๑\n'
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     '
global.dmenut = '*❖─┅──┅〈*'
global.dmenub = '*┊»*'
global.dmenub2 = '*┊*'
global.dmenuf = '*╰┅────────┅✦*'
global.htjava = '⫹⫺'
global.htki = '*⭑•̩̩͙⊱•••• ☪*'
global.htka = '*☪ ••••̩̩͙⊰•⭑*'
global.comienzo = '• • ◕◕════'
global.fin = '════◕◕ • •'
global.botdate = `⫹⫺ Date :  ${moment.tz('America/Los_Angeles').format('DD/MM/YY')}` //Asia/Jakarta
global.bottime = `𝗧 𝗜 𝗠 𝗘 : ${moment.tz('America/Los_Angeles').format('HH:mm:ss')}`//America/Los_Angeles
global.fgif = {key: { participant : '0@s.whatsapp.net'}, message: { "videoMessage": { "title": wm, "h": `Hmm`, 'seconds': '999999999',  'gifPlayback': 'true',  'caption': bottime, 'jpegThumbnail': fs.readFileSync('./Menu.png')}}}
global.multiplier = 99
//*************************

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'config.js'"))
import(`${file}?update=${Date.now()}`)})
