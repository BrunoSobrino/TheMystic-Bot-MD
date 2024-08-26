/* Created by https://github.com/unptoadrih15 */

const handler = async (m, {conn}) => {
  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {};
  const id = m.chat;
  if (!(id in conn.tebaklagu)) throw false;
  const json = conn.tebaklagu[id][1];
  const nya = json.jawaban;
  const nyanya = nya.replace(/[bcdfghjklmnñpqrstvwxyzBCDEFGHJKLMNÑPQRSTVWXYZ]/g, '_');
  m.reply('' + nyanya + '');
};
handler.command = /^hint|pista$/i;
export default handler;
