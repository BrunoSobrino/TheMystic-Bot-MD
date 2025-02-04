import util from 'util';
import path from 'path';


const user = (a) => '@' + a.split('@')[0];
function handler(m, {groupMetadata, command, conn, participants}) {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.fun_tops;

  const ps = groupMetadata.participants.map((v) => v.id);
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

  if (command == 'topgays') {
    const vn = './src/assets/audio/01J673A5RN30C5EYPMKE5MR9XQ.mp3';
    const top = `${tradutor.texto1}
    
*_1.- ${user(a)}_*
*_2.- ${user(b)}_*
*_3.- ${user(c)}_*
*_4.- ${user(d)}_*
*_5.- ${user(e)}_*
*_6.- ${user(f)}_*
*_7.- ${user(g)}_*
*_8.- ${user(h)}_*
*_9.- ${user(i)}_*
*_10.- ${user(j)}_*`;
    m.reply(top, null, {mentions: [a, b, c, d, e, f, g, h, i, j]});
    conn.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
    // conn.sendFile(m.chat, vn, 'error.mp3', null, m, true, { type: 'audioMessage', ptt: true })
  }

  if (command == 'topotakus') {
    const vn = './src/assets/audio/01J67441AFAPG1YRQXDQ0VDTZB.mp3';
    const top = `${tradutor.texto2}
    
*_1.- ${user(a)}_*
*_2.- ${user(b)}_*
*_3.- ${user(c)}_*
*_4.- ${user(d)}_*
*_5.- ${user(e)}_*
*_6.- ${user(f)}_*
*_7.- ${user(g)}_*
*_8.- ${user(h)}_*
*_9.- ${user(i)}_*
*_10.- ${user(j)}_*`;
    m.reply(top, null, {mentions: [a, b, c, d, e, f, g, h, i, j]});
    conn.sendMessage(m.chat, {audio: {url: vn}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
    // conn.sendFile(m.chat, vn, './src/assets/audio/01J67441AFAPG1YRQXDQ0VDTZB.mp3', null, m, true, { type: 'audioMessage', ptt: true })
  }
}
handler.help = handler.command = ['topgays', 'topotakus'];
handler.tags = ['games'];
handler.group = true;
export default handler;
