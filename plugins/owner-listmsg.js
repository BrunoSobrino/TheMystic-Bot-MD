

const handler = (m) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.owner_listmsg;

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
