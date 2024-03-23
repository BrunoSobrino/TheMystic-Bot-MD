import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_chatgpt_del
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {usedPrefix}) => {
  try {
    delete global.chatgpt.data.users[m.sender];
    m.reply(`${tradutor.texto1} ${usedPrefix}chatgpt2 O ${usedPrefix}ia2*`);
  } catch (error1) {
    console.log(error1);
    throw tradutor.texto2;
  }
};
handler.command = ['delchatgpt'];
export default handler;
