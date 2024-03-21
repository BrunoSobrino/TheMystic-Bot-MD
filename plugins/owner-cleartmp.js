import {tmpdir} from 'os';
import path, {join} from 'path';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
} from 'fs';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_cleartmp


const handler = async (m, {conn, usedPrefix: _p, __dirname, args}) => {
  conn.reply(m.chat, tradutor.texto1, m);

  const tmp = [tmpdir(), join(__dirname, '../tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    unlinkSync(file);
  });
};
handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp|cleartemp)$/i;
handler.rowner = true;
export default handler;
