import axios from 'axios';

const handler = async (m, {conn, usedPrefix, command}) => {
 const cristiano = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/CristianoRonaldo.json`)).data;
 const ronaldo = await cristiano[Math.floor(cristiano.length * Math.random())];

 conn.sendFile(m.chat, ronaldo, 'error.jpg', `*Siiiuuuuuu*`, m);
};

handler.help = ['cristianoronaldo', 'cr7'];
handler.tags = ['random'];
handler.command = /^(cristianoronaldo|cr7)$/i;

export default handler;
