


const handler = async (m, {conn, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_unbanuser

  if (!text) throw tradutor.texto1;
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw tradutor.texto2;
  const users = global.db.data.users;
  users[who].banned = false;
  conn.reply(m.chat, tradutor.texto3, m);
};
handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser$/i;
handler.rowner = true;
export default handler;
