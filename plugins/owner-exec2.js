import cp, {exec as _exec} from 'child_process';
import {promisify} from 'util';

const exec = promisify(_exec).bind(cp);
const handler = async (m, {conn, isOwner, command, text, usedPrefix, args, isROwner}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_exec2

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
