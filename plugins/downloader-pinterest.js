import {pinterest} from '@bochilteam/scraper';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_pinterest

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
