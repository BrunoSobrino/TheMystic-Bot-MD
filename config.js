import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath} from 'url';
import fs from 'fs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

global.botnumber = ""
global.confirmCode = ""

global.owner = [
  ['5492604845932', true], 
  ['5493772406612', true],
  ['593968585383', true]];

global.suittag = ['5492604050270', '5493772406612']
global.prems = [] 
global.reportes_solicitudes = ['5492604050270', '5493772406612']

global.packname = 'A̳s̳a̳k̳u̳r̳a̳ ̳B̳O̳T̳💎'
global.author = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ'
global.wm = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ'
global.titulowm = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ';
global.titulowm2 = `ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ`
global.igfg = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ'
global.wait = '*[ ⏳ ] Cargando...*'

global.imagen1 = fs.readFileSync('./IMG_20231228_032617_881.jpg');
global.imagen2 = fs.readFileSync('./src/nuevobot.jpg');
global.imagen3 = fs.readFileSync('./src/Pre Bot Publi.png');
global.imagen4 = fs.readFileSync('./IMG_20231228_032617_881.jpg');
global.imagen5 = fs.readFileSync('./IMG_20231228_032617_881.jpg');
global.imagen6 = fs.readFileSync('./Menu3.png');

global.mods = ['5492604050270', '5493772406612'] 

//* *******Tiempo***************
global.d = new Date(new Date + 3600000);
global.locale = 'es';
global.dia = d.toLocaleDateString(locale, {weekday: 'long'});
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'});
global.mes = d.toLocaleDateString('es', {month: 'long'});
global.año = d.toLocaleDateString('es', {year: 'numeric'});
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true});
//* ****************************
global.wm2 = `▸ ${dia} ${fecha}\n▸ ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ`;
global.gt = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ';
global.mysticbot = 'ᴀꜱᴀᴋᴜʀᴀ-ᴍᴀᴏ ʙᴏᴛ';
global.md = 'https://github.com/ColapsusHD/AsakuraMaoBotV2-MD';
global.mysticbot = 'https://github.com/ColapsusHD/AsakuraMaoBotV2-MD';
global.waitt = '*[ ⏳ ] Cargando...*';
global.waittt = '*[ ⏳ ] Cargando...*';
global.waitttt = '*[ ⏳ ] Cargando...*';
global.nomorown = '5219993404349';
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];
global.cmenut = '❖––––––『';
global.cmenub = '┊✦ ';
global.cmenuf = '╰━═┅═━––––––๑\n';
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ';
global.dmenut = '*❖─┅──┅〈*';
global.dmenub = '*┊»*';
global.dmenub2 = '*┊*';
global.dmenuf = '*╰┅────────┅✦*';
global.htjava = '⫹⫺';
global.htki = '*⭑•̩̩͙⊱•••• ☪*';
global.htka = '*☪ ••••̩̩͙⊰•⭑*';
global.comienzo = '• • ◕◕════';
global.fin = '════◕◕ • •';
global.botdate = `*[ 📅 ] Fecha:*  ${moment.tz('America/Argentina/Mendoza').format('DD/MM/YY')}`;
global.bottime = `*[ ⏳ ] Hora:* ${moment.tz('America/Argentina/Mendoza').format('HH:mm:ss')}`;
global.fgif = {key: {participant: '0@s.whatsapp.net'}, message: {'videoMessage': {'title': wm, 'h': `Hmm`, 'seconds': '999999999', 'gifPlayback': 'true', 'caption': bottime, 'jpegThumbnail': fs.readFileSync('./Menu.png')}}};
global.multiplier = 99;

global.flaaa = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=',
];
//* ************************

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'config.js\''));
  import(`${file}?update=${Date.now()}`);
});
