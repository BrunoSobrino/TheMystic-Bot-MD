/*   Creditos - ig : https://www.instagram.com/fg98._/    */
import hispamemes from 'hispamemes';
import fs from 'fs';
const handler = async (m, {command, conn}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.random_meme
  const url = await hispamemes.meme();
  conn.sendFile(m.chat, url, 'error.jpg', `${tradutor.texto1[0]}${command}${tradutor.texto1[1]}`, m);
};
// conn.sendButton(m.chat, `_${command}_`.trim(), author, url, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)}
handler.help = ['meme'];
handler.tags = ['random'];
handler.command = /^(meme|memes)$/i;
export default handler;
