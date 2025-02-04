

const handler = async (m, {conn, isROwner, text}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.owner_restart;

  if (!process.send) throw tradutor.texto1;
  // conn.readMessages([m.key])
  await m.reply(tradutor.texto2);
  process.send('reset');
};
handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;
export default handler;
