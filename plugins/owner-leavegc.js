

const handler = async (m, {conn, text, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_leavegc

  const id = text ? text : m.chat;
  await conn.reply(id, tradutor.texto1);
  await conn.groupLeave(id);
};
handler.command = /^(out|leavegc|leave|salirdelgrupo)$/i;
handler.group = true;
handler.rowner = true;
export default handler;
