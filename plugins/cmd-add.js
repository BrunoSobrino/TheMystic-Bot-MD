import _translate from "./_translate.js"
const tradutor = _translate.plugins.cmd_add
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, usedPrefix, command}) => {
  global.db.data.sticker = global.db.data.sticker || {};
  if (!m.quoted) throw `*${tradutor.texto1}*`;
  if (!m.quoted.fileSha256) throw `*${tradutor.texto2}*`;
  if (!text) throw `*${tradutor.texto3[0]}*\n*—◉ ${usedPrefix + command} ${tradutor.texto3[1]}*\n\n*${tradutor.texto3[2]}*\n*—◉ ${usedPrefix + command} <#menu> ${tradutor.texto3[3]}*`;
  const sticker = global.db.data.sticker;
  const hash = m.quoted.fileSha256.toString('base64');
  if (sticker[hash] && sticker[hash].locked) throw `*${tradutor.texto4}*`;
  sticker[hash] = {text, mentionedJid: m.mentionedJid, creator: m.sender, at: + new Date, locked: false};
  m.reply(`*${tradutor.texto5}*`);
};
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.rowner = true;
export default handler;
