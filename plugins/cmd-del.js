

const handler = async (m, {conn, usedPrefix, text, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.cmd_del;


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
