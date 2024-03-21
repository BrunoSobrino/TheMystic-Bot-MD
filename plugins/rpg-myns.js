import {createHash} from 'crypto';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.rpg_myns
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async function(m, {conn, text, usedPrefix}) {
  const sn = createHash('md5').update(m.sender).digest('hex');
  m.reply(`┏┅ ━━━━━━━━━━━━ ┅ ━
┃${tradutor.texto1} 
┃ ${sn}
┗┅ ━━━━━━━━━━━━ ┅ ━`.trim());
};
handler.help = ['myns'];
handler.tags = ['xp'];
handler.command = /^(myns|ceksn)$/i;
handler.register = true;
export default handler;
