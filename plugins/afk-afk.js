import _translate from "./_translate.js";
const tradutor = _translate.plugins.afk_afk
 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {text}) => {
  const user = global.db.data.users[m.sender];
  user.afk = + new Date;
  user.afkReason = text;
  m.reply(`${tradutor.texto1[0]} ${conn.getName(m.sender)} ${tradutor.texto1[1]} ${text ? ': ' + text : ''}*
`);
};
handler.help = ['afk [alasan]'];
handler.tags = ['main'];
handler.command = /^afk$/i;
export default handler;
