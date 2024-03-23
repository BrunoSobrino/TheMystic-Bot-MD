import {youtubedl, youtubedlv2} from '@bochilteam/scraper';
import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_yta_2
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.
s

const handler = async (m, {conn, args}) => {
  if (!args[0]) throw tradutor.texto1;
  await m.reply(tradutor.texto2);
  try {
    const q = '128kbps';
    const v = args[0];
    const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
    const dl_url = await yt.audio[q].download();
    const ttl = await yt.title;
    const size = await yt.audio[q].fileSizeH;
    const cap = `${tradutor.texto3[0]} ${ttl}\n${tradutor.texto3[1]}  ${size}`.trim();
    await conn.sendMessage(m.chat, {document: {url: dl_url}, caption: cap, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3`}, {quoted: m});
  } catch {
    try {
      const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${args[0]}`);
      const lolh = await lolhuman.json();
      const n = lolh.result.title || 'error';
      const n2 = lolh.result.link;
      const n3 = lolh.result.size;
      const cap2 = `${tradutor.texto3[0]} ${n}\n${tradutor.texto3[1]}${n3}`.trim();
      await conn.sendMessage(m.chat, {document: {url: n2}, caption: cap2, mimetype: 'audio/mpeg', fileName: `${n}.mp3`}, {quoted: m});
    } catch {
      await conn.reply(m.chat, tradutor.texto4, m);
    }
  }
};
handler.command = /^ytmp3doc|ytadoc|ytmp3.2|yta.2$/i;
export default handler;
