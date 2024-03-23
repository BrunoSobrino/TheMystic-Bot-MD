import yts from 'yt-search';
import fs from 'fs';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_playlist
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `${tradutor.texto1} \n*${usedPrefix + command} Begin you*`;
  try {
    const vids_ = {
      from: m.sender,
      urls: [],
    };
    if (!global.videoList) {
      global.videoList = [];
    }
    if (global.videoList[0]?.from == m.sender) {
      global.videoList.splice(0, global.videoList.length);
    }
    const results = await yts(text);
    const textoInfo = `${tradutor.texto2[0]}
◉ ${usedPrefix}audio <numero>
◉ ${usedPrefix}video <numero> 

${tradutor.texto2[1]}
*◉ ${usedPrefix}audio 5*
*◉ ${usedPrefix}video 8*`.trim();
    const teks = results.all.map((v, i) => {
      const link = v.url;
      vids_.urls.push(link);
      return `[${i + 1}] ${v.title}
↳ ${tradutor.texto2[2]} ${v.url}
↳ ${tradutor.texto2[3]}* ${v.timestamp}
↳ ${tradutor.texto2[4]} ${v.ago}
↳ ${tradutor.texto2[5]} ${v.views}`;
    }).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
    conn.sendFile(m.chat, results.all[0].thumbnail, 'yts.jpeg', textoInfo + '\n\n' + teks, m);
    global.videoList.push(vids_);
  } catch {
    await m.reply(`${tradutor.texto3}`);
  }
};
handler.help = ['playlist *<texto>*'];
handler.tags = ['search'];
handler.command = /^playlist|playlist2$/i;
export default handler;
