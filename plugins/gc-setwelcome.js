

const handler = async (m, {conn, text, isROwner, isOwner}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.gc_setwelcome

  if (text) {
    global.db.data.chats[m.chat].sWelcome = text;
    m.reply(tradutor.texto1);
  } else throw `${tradutor.texto2[0]}\n*- @user (mención)*\n*- @group (nombre de grupo)*\n*- @desc (description de grupo)*`;
};
handler.help = ['setwelcome <text>'];
handler.tags = ['group'];
handler.command = ['setwelcome'];
handler.admin = true;
export default handler;
