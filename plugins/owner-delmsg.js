import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_delmsg
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {command, usedPrefix, text}) => {
  const which = command.replace(/eliminar/i, '');
  if (!text) throw `${tradutor.texto1[0]} ${usedPrefix}list${which} ${tradutor.texto1[1]}`;
  const msgs = global.db.data.msgs;
  if (!text in msgs) throw `${tradutor.texto2[0]} '${text}' ${tradutor.texto2[1]}`;
  delete msgs[text];
  m.reply(`${ tradutor.texto3} '${text}'*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'del' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^eliminar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;
