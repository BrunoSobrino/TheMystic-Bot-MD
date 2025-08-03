import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath} from 'url';
import fs from 'fs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';

/* To add more APIs, make sure to put global.apiname = ['APIKey'] */ /* By Skid 🤑 */

global.openai_key = 'sk-0';
/* Get your API Key here: https://platform.openai.com/account/api-keys */

global.openai_org_id = 'org-3';
/* Get your Organization ID here: https://platform.openai.com/account/org-settings */

global.MyApiRestBaseUrl = 'https://api.cafirexos.com'; // IP Block -> use this to avoid being blocked: 'https://api-brunosobrino.onrender.com';
global.MyApiRestApikey = 'BrunoSobrino';

global.MyApiRestBaseUrl2 = 'https://api-brunosobrino-dcaf9040.koyeb.app';

global.MyApiRestBaseUrl3 = 'https://api-brunosobrino.onrender.com'; 

global.keysZens = ['LuOlangNgentot', 'c2459db922', '37CC845916', '6fb0eff124', 'hdiiofficial', 'fiktod', 'BF39D349845E', '675e34de8a', '0b917b905e6f'];
global.keysxxx = keysZens[Math.floor(keysZens.length * Math.random())];
global.keysxteammm = ['29d4b59a4aa687ca', '5LTV57azwaid7dXfz5fzJu', 'cb15ed422c71a2fb', '5bd33b276d41d6b4', 'HIRO', 'kurrxd09', 'ebb6251cc00f9c63'];
global.keysxteam = keysxteammm[Math.floor(keysxteammm.length * Math.random())];
global.keysneoxrrr = ['5VC9rvNx', 'cfALv5'];
global.keysneoxr = keysneoxrrr[Math.floor(keysneoxrrr.length * Math.random())];
global.lolkeysapi = ['GataDiosV3']; // ['BrunoSobrino_2']
global.itsrose = ['4b146102c4d500809da9d1ff'];

global.APIs = {
  CFROSAPI: 'https://api.cafirexos.com',
  xteam: 'https://api.xteam.xyz',
  stellar: 'https://api.stellarwa.xyz',
  dzx: 'https://api.dhamzxploit.my.id',
  lol: 'https://api.lolhuman.xyz',
  neoxr: 'https://api.neoxr.my.id',
  zenzapis: 'https://api.zahwazein.xyz',
  akuari: 'https://api.akuari.my.id',
  akuari2: 'https://apimu.my.id',
  fgmods: 'https://api-fgmods.ddns.net',
  botcahx: 'https://api.botcahx.biz.id',
  ibeng: 'https://api.ibeng.tech/docs',
  rose: 'https://api.itsrose.site',
  popcat: 'https://api.popcat.xyz',
  xcoders: 'https://api-xcoders.site',
  vihangayt: 'https://vihangayt.me',
  erdwpe: 'https://api.erdwpe.com',
  xyroinee: 'https://api.xyroinee.xyz',
  nekobot: 'https://nekobot.xyz',
  BK9: 'https://apii.bk9.site'
},
global.APIKeys = {
  'https://api.xteam.xyz': `${keysxteam}`,
  'https://api.stellarwa.xyz': `BrunoSobrino`,
  'https://api.lolhuman.xyz': 'GataDios',
  'https://api.neoxr.my.id': `${keysneoxr}`,
  'https://api.zahwazein.xyz': `${keysxxx}`,
  'https://api-fgmods.ddns.net': 'fg-dylux',
  'https://api.botcahx.biz.id': 'Admin',
  'https://api.ibeng.tech/docs': 'tamvan',
  'https://api.itsrose.site': 'Rs-Zeltoria',
  'https://api-xcoders.site': 'Frieren',
  'https://api.xyroinee.xyz': 'uwgflzFEh6',
  'https://apikasu.onrender.com': 'ApiKey'
};

/** ************************/
global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase();
    const emot = {
      level: '🧬 Level',
      limit: '💎 Diamond',
      exp: '⚡ Experience',
      bank: '🏦 Bank',
      diamond: '💎 Diamond',
      health: '❤️ Health',
      kyubi: '🌀 Magic',
      joincount: '🪙 Token',
      emerald: '💚 Emerald',
      stamina: '✨ Energy',
      role: '💪 Rank',
      premium: '🎟️ Premium',
      pointxp: '📧 Exp Points',
      gold: '👑 Gold',
      trash: '🗑 Trash',
      crystal: '🔮 Crystal',
      intelligence: '🧠 Intelligence',
      string: '🕸️ String',
      keygold: '🔑 Gold Key',
      keyiron: '🗝️ Iron Key',
      emas: '🪅 Piñata',
      fishingrod: '🎣 Fishing Rod',
      gems: '🍀 Gems',
      magicwand: '⚕️ Magic Wand',
      mana: '🪄 Spell',
      agility: '🤸‍♂️ Agility',
      darkcrystal: '♠️ Dark Crystal',
      iron: '⛓️ Iron',
      rock: '🪨 Rock',
      potion: '🥤 Potion',
      superior: '💼 Superior',
      robo: '🚔 Robo',
      upgrader: '🧰 Upgrade Boost',
      wood: '🪵 Wood',
      strength: '🦹‍ ♀️ Strength',
      arc: '🏹 Bow',
      armor: '🥼 Armor',
      bow: '🏹 Super Bow',
      pickaxe: '⛏️ Pickaxe',
      sword: '⚔️ Sword',
      common: '📦 Common Box',
      uncoommon: '🥡 Uncommon Box',
      mythic: '🗳️ Mythic Box',
      legendary: '🎁 Legendary Box',
      petFood: '🍖 Pet Food',
      pet: '🍱 Pet Box',
      bibitanggur: '🍇 Grape Seed',
      bibitapel: '🍎 Apple Seed',
      bibitjeruk: '🍊 Orange Seeds',
      bibitmangga: '🥭 Mango Seed',
      bibitpisang: '🍌 Banana Seeds',
      ayam: '🐓 Chicken',
      babi: '🐖 Pig',
      Jabali: '🐗 Wild Boar',
      bull: '🐃 Bull',
      buaya: '🐊 Crocodile',
      cat: '🐈 Cat',
      centaur: '🐐 Centaur',
      chicken: '🐓 Chicken',
      cow: '🐄 Cow',
      dog: '🐕 Dog',
      dragon: '🐉 Dragon',
      elephant: '🐘 Elephant',
      fox: '🦊 Fox',
      giraffe: '🦒 Giraffe',
      griffin: '🦅 Bird',
      horse: '🐎 Horse',
      kambing: '🐐 Goat',
      kerbau: '🐃 Buffalo',
      lion: '🦁 Lion',
      money: '👾 MysticCoins',
      monyet: '🐒 Monkey',
      panda: '🐼 Panda',
      snake: '🐍 Snake',
      phonix: '🕊️ Phoenix',
      rhinoceros: '🦏 Rhinoceros',
      wolf: '🐺 Wolf',
      tiger: '🐅 Tiger',
      cumi: '🦑 Squid',
      udang: '🦐 Shrimp',
      ikan: '🐟 Fish',
      fideos: '🍝 Noodles',
      ramuan: '🧪 NOVA Ingredient',
      knife: '🔪 Knife',
    };
    const results = Object.keys(emot).map((v) => [v, new RegExp(v, 'gi')]).filter((v) => v[1].test(string));
    if (!results.length) return '';
    else return emot[results[0][0]];
  }};
global.rpgg = { // Emojis only
  emoticon(string) {
    string = string.toLowerCase();
    const emott = {
      level: '🧬',
      limit: '💎',
      exp: '⚡',
      bank: '🏦',
      diamond: '💎+',
      health: '❤️',
      kyubi: '🌀',
      joincount: '🪙',
      emerald: '💚',
      stamina: '✨',
      role: '💪',
      premium: '🎟️',
      pointxp: '📧',
      gold: '👑',
      trash: '🗑',
      crystal: '🔮',
      intelligence: '🧠',
      string: '🕸️',
      keygold: '🔑',
      keyiron: '🗝️',
      emas: '🪅',
      fishingrod: '🎣',
      gems: '🍀',
      magicwand: '⚕️',
      mana: '🪄',
      agility: '🤸‍♂️',
      darkcrystal: '♠️',
      iron: '⛓️',
      rock: '🪨',
      potion: '🥤',
      superior: '💼',
      robo: '🚔',
      upgrader: '🧰',
      wood: '🪵',
      strength: '🦹‍ ♀️',
      arc: '🏹',
      armor: '🥼',
      bow: '🏹',
      pickaxe: '⛏️',
      sword: '⚔️',
      common: '📦',
      uncoommon: '🥡',
      mythic: '🗳️',
      legendary: '🎁',
      petFood: '🍖',
      pet: '🍱',
      bibitanggur: '🍇',
      bibitapel: '🍎',
      bibitjeruk: '🍊',
      bibitmangga: '🥭',
      bibitpisang: '🍌',
      ayam: '🐓',
      babi: '🐖',
      Jabali: '🐗',
      bull: '🐃',
      buaya: '🐊',
      cat: '🐈',
      centaur: '🐐',
      chicken: '🐓',
      cow: '🐄',
      dog: '🐕',
      dragon: '🐉',
      elephant: '🐘',
      fox: '🦊',
      giraffe: '🦒',
      griffin: '🦅',
      horse: '🐎',
      kambing: '🐐',
      kerbau: '🐃',
      lion: '🦁',
      money: '👾',
      monyet: '🐒',
      panda: '🐼',
      snake: '🐍',
      phonix: '🕊️',
      rhinoceros: '🦏',
      wolf: '🐺',
      tiger: '🐅',
      cumi: '🦑',
      udang: '🦐',
      ikan: '🐟',
      fideos: '🍝',
      ramuan: '🧪',
      knife: '🔪',
    };
    const results = Object.keys(emott).map((v) => [v, new RegExp(v, 'gi')]).filter((v) => v[1].test(string));
    if (!results.length) return '';
    else return emott[results[0][0]];
  }};
global.rpgshop = { // Shop
  emoticon(string) {
    string = string.toLowerCase();
    const emottt = {
      exp: '⚡ Experience',
      limit: '💎 Diamond',
      diamond: '💎 Diamond',
      joincount: '🪙 Token',
      emerald: '💚 Emerald',
      berlian: '♦️ Jewel',
      kyubi: '🌀 Magic',
      gold: '👑 Gold',
      money: '👾 MysticCoins',
      tiketcoin: '🎫 mystic Tickets',
      stamina: '✨ Energy',
      potion: '🥤 Potion',
      aqua: '💧 Water',
      trash: '🗑 Trash',
      wood: '🪵 Wood',
      rock: '🪨 Rock',
      batu: '🥌 Stone',
      string: '🕸️ String',
      iron: '⛓️ Iron',
      coal: '⚱️ Coal',
      botol: '🍶 Bottle',
      kaleng: '🥫 Can',
      kardus: '🪧 Cardboard',
      eleksirb: '💡 Electricity',
      emasbatang: '〽️ Gold Bar',
      emasbiasa: '🧭 Common Gold',
      rubah: '🦊🌫️ Great Fox',
      sampah: '🗑🌫️ Super Trash',
      serigala: '🐺🌫️ Super Wolf',
      kayu: '🛷 Super Wood',
      sword: '⚔️ Sword',
      umpan: '🪱 Bait',
      healtmonster: '💵 Bills',
      emas: '🪅 Piñata',
      pancingan: '🪝 Hook',
      pancing: '🎣 Fishing Rod',
      common: '📦 Common Box',
      uncoommon: '🥡 Uncommon Box',
      mythic: '🗳️ Mythic Box',
      pet: '📫 Pet Box', // ?
      gardenboxs: '💐 Garden Box', // ?
      legendary: '🎁 Legendary Box',
      anggur: '🍇 Grape',
      apel: '🍎 Apple',
      jeruk: '🍊 Orange',
      mangga: '🥭 Mango',
      pisang: '🍌 Banana',
      bibitanggur: '🌾🍇 Grape Seeds',
      bibitapel: '🌾🍎 Apple Seeds',
      bibitjeruk: '🌾🍊 Orange Seeds',
      bibitmangga: '🌾🥭 Mango Seeds',
      bibitpisang: '🌾🍌 Banana Seeds',
      centaur: '🐐 Centaur',
      griffin: '🦅 Bird',
      kucing: '🐈 Cat',
      naga: '🐉 Dragon',
      fox: '🦊 Fox',
      kuda: '🐎 Horse',
      phonix: '🕊️ Phoenix',
      wolf: '🐺 Wolf',
      anjing: '🐶 Dog',
      petFood: '🍖 Pet Food', // ?
      makanancentaur: '🐐🥩 Centaur Food',
      makanangriffin: '🦅🥩 Bird Food',
      makanankyubi: '🌀🥩 Magic Food',
      makanannaga: '🐉🥩 Dragon Food',
      makananpet: '🍱🥩 Pet Foods',
      makananphonix: '🕊️🥩 Phoenix Food',
    };
    const results = Object.keys(emottt).map((v) => [v, new RegExp(v, 'gi')]).filter((v) => v[1].test(string));
    if (!results.length) return '';
    else return emottt[results[0][0]];
  }};
global.rpgshopp = { // Shop
  emoticon(string) {
    string = string.toLowerCase();
    const emotttt = {
      exp: '⚡',
      limit: '💎',
      diamond: '💎+',
      joincount: '🪙',
      emerald: '💚',
      berlian: '♦️',
      kyubi: '🌀',
      gold: '👑',
      money: '👾',
      tiketcoin: '🎫',
      stamina: '✨',
      potion: '🥤',
      aqua: '💧',
      trash: '🗑',
      wood: '🪵',
      rock: '🪨',
      batu: '🥌',
      string: '🕸️',
      iron: '⛓️',
      coal: '⚱️',
      botol: '🍶',
      kaleng: '🥫',
      kardus: '🪧',
      eleksirb: '💡',
      emasbatang: '〽️',
      emasbiasa: '🧭',
      rubah: '🦊🌫️',
      sampah: '🗑🌫️',
      serigala: '🐺🌫️',
      kayu: '🛷',
      sword: '⚔️',
      umpan: '🪱',
      healtmonster: '💵',
      emas: '🪅',
      pancingan: '🪝',
      pancing: '🎣',
      common: '📦',
      uncoommon: '🥡',
      mythic: '🗳️',
      pet: '📫', // ?
      gardenboxs: '💐', // ?
      legendary: '🎁',
      anggur: '🍇',
      apel: '🍎',
      jeruk: '🍊',
      mangga: '🥭',
      pisang: '🍌',
      bibitanggur: '🌾🍇',
      bibitapel: '🌾🍎',
      bibitjeruk: '🌾🍊',
      bibitmangga: '🌾🥭',
      bibitpisang: '🌾🍌',
      centaur: '🐐',
      griffin: '🦅',
      kucing: '🐈',
      naga: '🐉',
      fox: '🦊',
      kuda: '🐎',
      phonix: '🕊️',
      wolf: '🐺',
      anjing: '🐶',
      petFood: '🍖', // ?
      makanancentaur: '🐐🥩',
      makanangriffin: '🦅🥩',
      makanankyubi: '🌀🥩',
      makanannaga: '🐉🥩',
      makananpet: '🍱🥩',
      makananphonix: '🕊️🥩',
    };
    const results = Object.keys(emotttt).map((v) => [v, new RegExp(v, 'gi')]).filter((v) => v[1].test(string));
    if (!results.length) return '';
    else return emotttt[results[0][0]];
  }};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Updated \'api.js\''));
  import(`${file}?update=${Date.now()}`);
});