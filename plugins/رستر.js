/* Creditos a https://github.com/ALBERTO9883 */

const handler = async (m, {conn}) => {
  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `🔹️ *_تم تغير لينك الجروب._*\n♾ • اللينك الجديد: ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.command = ['resetlink', 'تغيير_اللينك'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;