import fs from 'fs';


async function handler(m, {conn, usedPrefix}) {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.mipilot_stopbot;


  if (conn.user.jid == global.conn.user.jid) return m.reply(tradutor.texto1);
  m.reply(tradutor.texto2);
  conn.fstop = true;
  conn.ws.close();
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true;
export default handler;
