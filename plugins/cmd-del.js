import _translate from "./_translate.js"
const tradutor = _translate.plugins.cmd_del
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, usedPrefix, text, command}) => {
  let hash = text;
  if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256.toString('hex');
  if (!hash) throw `*${tradutor.texto1} ${usedPrefix}listcmd*`;
  const sticker = global.db.data.sticker;
  if (sticker[hash] && sticker[hash].locked) throw `*${tradutor.texto2}*`;
  delete sticker[hash];
  m.reply(`*${tradutor.texto3}*`);
};
handler.command = ['delcmd'];
handler.rowner = true;
export default handler;
