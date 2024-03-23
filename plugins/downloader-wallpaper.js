import {wallpaper} from '@bochilteam/scraper';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_wallpaper
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Minecraft*`;
  const res = await wallpaper(text);
  const img = res[Math.floor(Math.random() * res.length)];
  conn.sendFile(m.chat, img, 'error.jpg', `${tradutor.texto2} ${text}*`, m);
};
handler.help = ['', '2'].map((v) => 'wallpaper' + v + ' <query>');
handler.tags = ['downloader'];
handler.command = /^(wallpaper2?)$/i;
export default handler;
