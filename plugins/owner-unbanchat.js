
const handler = async (m) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.owner_unbanchat;

  global.db.data.chats[m.chat].isBanned = false;
  m.reply(tradutor.texto1);
};
handler.help = ['unbanchat'];
handler.tags = ['owner'];
handler.command = /^unbanchat$/i;
handler.rowner = true;
export default handler;
