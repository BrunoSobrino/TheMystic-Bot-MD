

const handler = async (m, {conn, participants, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_banuser

  const BANtext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`;
  if (!m.mentionedJid[0] && !m.quoted) return m.reply(BANtext, m.chat, {mentions: conn.parseMention(BANtext)});
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : await m?.quoted?.sender;
  else who = m.chat;
  const users = global.db.data.users;
  users[who].banned = true;
  m.reply(tradutor.texto2);
};
handler.command = /^banuser$/i;
handler.rowner = true;
export default handler;
