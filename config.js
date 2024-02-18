import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath} from 'url';
import fs from 'fs'; 
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

global.botnumber = "212648753294"
global.confirmCode = "212618578927"

global.owner = [
  ['212648753294, '👑 Mystic - Creador 👑', true],
  ['212648753294', '💫 Mystic - Collaborator 1 💫', true],
  ['212618578927', '💫 Mystic - Collaborator 2 💫', true],
  ['212618578927, '💫 Mystic - Collaborator 3 💫', true],
  ['212689707732', '💫 Mystic - Collaborator 4 💫', true],
  ['212689707732, '💫 Mystic - Collaborator 5 💫', true],
  ['212774459373', '💫 Mystic - Collaborator 6 💫', true],
  ['212774459373', '💫 Mystic - Rey Endymion 💫', false],
  ['212719596553', '💫 Mystic - Collaborator 8 💫', true],
  ['212712263052','💫 Mystic - Tester Fabri115💫', true],
  ['593968585283'],
  ['5219993404349'],
  ['5219991402134'],
  ['5492266466080'],
  ['5219996125657'],
  ['5218442114446'],
  ['59894808483'],
  ['593980586516'], 
  ['595975740803'],  
  ['5492266613038'],
  ['50497150165'],
  ['51906662557'],
  ['573183650526'], 
  ['5217441298510'], 
  ['5217294888993'],
  ['595992611272']
];

global.suittag = ['212648753294];
global.prems = ['212618578927'];

global.packname = 'Sticker';
global.author = 'The Mystic - Bot';
global.wm = 'Essaouidi Bot';
global.titulowm = 'The Mystic - Bot';
global.titulowm2 = `The Mystic - Bot`
global.igfg = 'The Mystic - Bot';
global.wait = '*[ ⏳ ] Cargando...*';

global.imagen1 = fs.readFileSync('./Menu2.jpg');
global.imagen2 = fs.readFileSync('./src/nuevobot.jpg');
global.imagen3 = fs.readFileSync('./src/Pre Bot Publi.png');
global.imagen4 = fs.readFileSync('./Menu.png');
global.imagen5 = fs.readFileSync('./src/+18.jpg');
global.imagen6 = fs.readFileSync('./Menu3.png');

global.mods = [];

