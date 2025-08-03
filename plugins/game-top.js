import util from 'util';
import path from 'path';

const user = (a) => '@' + a.split('@s.whatsapp.net')[0];
function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.fun_top

  if (!text) throw `${tradutor.texto1}`;
  const ps = groupMetadata.participants.map((v) => v.jid);
  const a = ps.getRandom();
  const b = ps.getRandom();
  const c = ps.getRandom();
  const d = ps.getRandom();
  const e = ps.getRandom();
  const f = ps.getRandom();
  const g = ps.getRandom();
  const h = ps.getRandom();
  const i = ps.getRandom();
  const j = ps.getRandom();
  const k = Math.floor(Math.random() * 70);
  const x = `${pickRandom(['🤓', '😅', '😂', '😳', '😎', '🥵', '😱', '🤑', '🙄', '💩', '🍑', '🤨', '🥴', '🔥', '👇🏻', '😔', '👀', '🌚'])}`;
  const l = Math.floor(Math.random() * x.length);
  const top = `*${x} Top 10 ${text} ${x}*\n\n*1. ${user(a)}*\n*2. ${user(b)}*\n*3. ${user(c)}*\n*4. ${user(d)}*\n*5. ${user(e)}*\n*6. ${user(f)}*\n*7. ${user(g)}*\n*8. ${user(h)}*\n*9. ${user(i)}*\n*10. ${user(j)}*`;
  m.reply(top, null, { mentions: [a, b, c, d, e, f, g, h, i, j]});
}
handler.help = ["top"];
handler.tags = ["game"];
handler.command = ["top"];
handler.group = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
