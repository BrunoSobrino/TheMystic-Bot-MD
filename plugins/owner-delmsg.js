

const handler = async (m, {command, usedPrefix, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_delmsg

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
