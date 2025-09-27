const handler = async (m, {conn, isOwner, isAdmin}) => {
  if (!isAdmin && !isOwner) {
    return m.reply('❌ Solo un admin o el dueño puede limpiar los warns.');
  }

  // Recorremos todos los usuarios y reseteamos sus warns
  for (let jid in global.db.data.users) {
    if (global.db.data.users[jid].warn) {
      global.db.data.users[jid].warn = 0;
    }
  }

  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.gc_listwarn;

  // Mensaje de confirmación
  await conn.sendMessage(
    m.chat,
    { text: tradutor.textoReset || '✅ Todos los warns han sido limpiados.' },
    { quoted: m }
  );
};

handler.help = ['clearwarns'];
handler.tags = ['group'];
handler.command = /^(clearwarns|resetwarns)$/i;
handler.group = true;
handler.admin = true;
export default handler;
