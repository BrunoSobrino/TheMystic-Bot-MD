/* Creditos a https://github.com/ALBERTO9883 */

const handler = async (m, {conn}) => {
  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `🔹️ *_S𝐒𝐞 𝐇𝐚 𝐑𝐞𝐬𝐭𝐚𝐛𝐥𝐞𝐜𝐢𝐝𝐨 𝐂𝐨𝐧 𝐄́𝐱𝐢𝐭𝐨 𝐄𝐥 𝐋𝐢𝐧𝐤 𝐃𝐞𝐥 𝐆𝐫𝐮𝐩𝐨._*\n♾ • Link Nuevo: ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;
