import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_addmsg
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {command, usedPrefix, text}) => {
  const M = m.constructor;
  const which = command.replace(/agregar/i, '');
  if (!m.quoted) throw tradutor.texto1;
  if (!text) throw `${tradutor.texto2[0]} *${usedPrefix}list${which}* ${tradutor.texto2[1]}`;
  const msgs = global.db.data.msgs;
  if (text in msgs) throw `*[❗𝐈𝐍𝐅𝐎❗] '${text}' ${tradutor.texto3}`;
  msgs[text] = M.toObject(await m.getQuotedObj());
  m.reply(`${tradutor.texto4[0]} '${text}'${tradutor.texto4[1]} ${usedPrefix}ver${which} ${text}*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'add' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^agregar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;
