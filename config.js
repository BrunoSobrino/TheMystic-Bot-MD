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
  ['212648753294', '👑 Mystic - Creador 👑', true],
  ['212618578927', '💫 Mystic - Collaborator 1 💫', true],
  ['212689707732', '💫 Mystic - Collaborator 2 💫', true],
  ['212712263052', '💫 Mystic - Collaborator 3 💫', true],
  ['212774459373', '💫 Mystic - Collaborator 4 💫', true],
  ['212719596553', '💫 Mystic - Collaborator 5 💫', true],

global.suittag = ['212648753294'];
global.prems = ['212618578927'];

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
global.imagen4 = fs.readFileSync('./Menu.png');
global.imagen5 = fs.readFileSync('./src/+18.jpg');
global.imagen6 = fs.readFileSync('./Menu3.png');

global.mods = [];

