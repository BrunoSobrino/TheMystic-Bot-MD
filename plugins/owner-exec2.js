import cp, {exec as _exec} from 'child_process';
import {promisify} from 'util';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_exec2
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const exec = promisify(_exec).bind(cp);
const handler = async (m, {conn, isOwner, command, text, usedPrefix, args, isROwner}) => {
  if (!isROwner) return;
  if (global.conn.user.jid != conn.user.jid) return;
  m.reply(tradutor.texto1);
  let o;
  try {
    o = await exec(command.trimStart() + ' ' + text.trimEnd());
  } catch (e) {
    o = e;
  } finally {
    const {stdout, stderr} = o;
    if (stdout.trim()) m.reply(stdout);
    if (stderr.trim()) m.reply(stderr);
  }
};
handler.customPrefix = /^[$]/;
handler.command = new RegExp;
export default handler;
