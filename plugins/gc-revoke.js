/* Creditos a https://github.com/ALBERTO9883 */


const handler = async (m, {conn}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.gc_revoke;

  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `${tradutor.texto1} ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;
