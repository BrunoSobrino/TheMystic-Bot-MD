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

import tools from '@takanashi-soft/tools';

const handler = async (m, {conn, text, usedPrefix, command}) => {
const datas = global
const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
const tradutor = _translate.plugins.herramientas_chatgpt

if (usedPrefix == 'a' || usedPrefix == 'A') return;
if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]} ${usedPrefix + command} ${tradutor.texto1[2]}`;
try {
const prompt = tradutor.texto3;
const chatgpt = await tools.ai.mylogic(text, prompt);
const data = chatgpt.answer;
m.reply(`${data}`.trim());
} catch (error) {
throw tradutor.texto4;
}};
handler.command = /^(openai|chatgpt|ia|robot|openai2|chatgpt2|ia2|robot2|Mystic|MysticBot)$/i;
export default handler;
