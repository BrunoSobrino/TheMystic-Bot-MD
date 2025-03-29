/* -------------------------------------------------------*/
/* [❗]                      [❗]                      [❗] */
/*                                                       */
/*       |- [ ⚠ ] - CREDITOS DEL CODIGO - [ ⚠ ] -|      */
/*     —◉ DESAROLLADO POR OTOSAKA:                       */
/*     ◉ Otosaka (https://github.com/6otosaka9)          */
/*     ◉ Número: wa.me/51993966345                       */
/*                                                       */
/*     —◉ FT:                                            */
/*     ◉ BrunoSobrino (https://github.com/BrunoSobrino)  */
/*                                                       */
/* [❗]                      [❗]                      [❗] */
/* -------------------------------------------------------*/

import axios from 'axios';

const handler = async (m, {conn, text, usedPrefix, command}) => {
const datas = global
const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
const tradutor = _translate.plugins.herramientas_chatgpt

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]} ${usedPrefix + command} ${tradutor.texto1[2]}`;
try {
conn.sendPresenceUpdate('composing', m.chat);
const prompt = tradutor.texto3;
const chatgpt = await axios.get(`https://skynex.boxmine.xyz/docs/ai/myprompt?text=${text}&prompt=${prompt}&apikey=BrunoSobrino`);
const data = chatgpt.data;
m.reply(`${data.answer}`.trim());
} catch (error) {
throw tradutor.texto4;
}};
handler.command = /^(openai|chatgpt|ia|robot|Mystic|MysticBot)$/i;
export default handler;
