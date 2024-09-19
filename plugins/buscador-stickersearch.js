/* By https://github.com/ALBERTO9883 */
import fs from 'fs';
import fetch from 'node-fetch';
import {googleImage} from '@bochilteam/scraper';


const handler = async (m, {text, usedPrefix, command, conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.buscador_stickersearch

  try {
    const res2 = await googleImage(text);
    const sfoto = res2.getRandom();
    if (!text) throw `*${tradutor.texto1}*`;
    const json = await fetch(`https://api.akuari.my.id/search/sticker?query=${text}`);
    const jsons = await json.json();
    const res = jsons.result.map((v, index) => `*${tradutor.texto2[0]}* ${1 + index}\n* ${tradutor.texto2[1]} * ${v.title}\n*${tradutor.texto2[2]}* ${v.url}`).join`\n\n───\n\n`;
    await conn.sendFile(m.chat, sfoto, 'error.jpg', res, m);
  } catch {
    await m.reply(`*${tradutor.texto3}*`);
  }
};
handler.tags = ['sticker', 'search'];
handler.command = ['stickersearch', 'searchsticker', 'stickerssearch', 'searchstickers'];
export default handler;
