import {pinterest} from '@bochilteam/scraper';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_pinterest
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Minecraft*`;
  const json = await pinterest(text);
  conn.sendFile(m.chat, json.getRandom(), 'error.jpg', `
${tradutor.texto2}
${text}
`.trim(), m);
};
handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest)$/i;
export default handler;
