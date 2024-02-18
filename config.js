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
  ['212648753294', 'Essaouidi', true],
  ['212618578927', 'Essaouidi ', true],
  ['212648753294, 'Essaouidi', true],
  

global.suittag = ['212648753294];
global.prems = ['212648753294];

global.packname = 'Sticker';
global.author = 'Essaouidi Bot';
global.wm = 'Essaouidi Bot';
global.titulowm = 'Essaouidi Bot';
global.titulowm2 = `Essaouidi Bot`
global.igfg = 'Essaouidi Bot';
global.wait = '*[ ⏳ ] Cargando...*';

global.imagen1 = fs.readFileSync('./Menu2.jpg');
global.imagen2 = fs.readFileSync('./src/nuevobot.jpg');
global.imagen3 = fs.readFileSync('./src/Pre Bot Publi.png');
