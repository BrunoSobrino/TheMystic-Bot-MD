import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_unbanuser
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text}) => {
  if (!text) throw tradutor.texto1;
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
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
