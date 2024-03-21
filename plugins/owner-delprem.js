import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_delprem
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw tradutor.texto1;
  if (!user) throw tradutor.texto2;
  if (user.premiumTime = 0) throw tradutor.texto3;
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;

  user.premium = false;

  const textdelprem = `*[❗] @${who.split`@`[0]} ${tradutor.texto4}`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['delprem <@user>'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)prem$/i;
handler.group = true;
handler.rowner = true;
export default handler;
