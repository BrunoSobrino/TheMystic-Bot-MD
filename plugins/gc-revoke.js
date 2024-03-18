/* Creditos a https://github.com/ALBERTO9883 */
import _translate from "./_translate.js"
const tradutor = _translate.plugins.gc_revoke

const handler = async (m, {conn}) => {
  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `${tradutor.texto1} ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;
