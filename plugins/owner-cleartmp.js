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
const handler = async (m, {conn, usedPrefix: _p, __dirname, args}) => {
  conn.reply(m.chat, '*[ ✔ ] 𝙰𝚁𝙲𝙷𝙸𝚅𝙾𝚂 𝙳𝙴 𝙻𝙰 𝙲𝙰𝚁𝙿𝙴𝚃𝙰 𝚃𝙼𝙿 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾𝚂 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾!!*', m);

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
