

const handler = async (m, {conn, command, usedPrefix, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.owner_getmsg

  const which = command.replace(/ver/i, '');
  if (!text) throw `${tradutor.texto1[0]} *${usedPrefix}list${which}* ${tradutor.texto1[1]}`;
  const msgs = global.db.data.msgs;
  if (!text in msgs) throw `*[❗𝐈𝐍𝐅𝐎❗] '${text}' ${tradutor.texto2}`;
  const _m = await conn.serializeM(msgs[text]);
  await _m.copyNForward(m.chat, true);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'get' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^ver(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;
