import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_listmsg
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = (m) => {
  const msgs = global.db.data.msgs;
  m.reply(`
${tradutor.texto1[0]}

${tradutor.texto1[1]}
${Object.keys(msgs).map((v) => '*👉🏻 ' + v).join('*\n*')}*
`.trim());
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'list' + v);
handler.tags = ['database'];
handler.command = /^lista(vn|msg|video|audio|img|sticker)$/;
export default handler;
