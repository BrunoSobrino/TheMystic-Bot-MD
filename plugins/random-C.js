import axios from 'axios';
import fs from 'fs';

const handler = async (m, {conn, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.random_c
 const cristiano = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/CristianoRonaldo.json`)).data;
 const ronaldo = await cristiano[Math.floor(cristiano.length * Math.random())];

 conn.sendFile(m.chat, ronaldo, 'error.jpg', tradutor.texto1, m);
};

handler.help = ['cristianoronaldo', 'cr7'];
handler.tags = ['random'];
handler.command = /^(cristianoronaldo|cr7)$/i;

export default handler;
