import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_banchat
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m) => {
  global.db.data.chats[m.chat].isBanned = true;
  m.reply(tradutor.texto1);
};
handler.help = ['banchat'];
handler.tags = ['owner'];
handler.command = /^banchat$/i;
handler.rowner = true;
export default handler;
