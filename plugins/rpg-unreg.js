import {createHash} from 'crypto';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.rpg_unreg
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async function(m, {args}) {
  if (!args[0]) throw tradutor.texto1;
  const user = global.db.data.users[m.sender];
  const sn = createHash('md5').update(m.sender).digest('hex');
  if (args[0] !== sn) throw tradutor.texto2;
  user.registered = false;
  m.reply(tradutor.texto3);
};
handler.help = ['', 'ister'].map((v) => 'unreg' + v + ' <numero de serie>');
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;
handler.register = true;
export default handler;
