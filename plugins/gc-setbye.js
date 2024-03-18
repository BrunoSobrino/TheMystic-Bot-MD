import _translate from "./_translate.js"
const tradutor = _translate.plugins.gc_setbye

const handler = async (m, {conn, text, isROwner, isOwner}) => {
  if (text) {
    global.db.data.chats[m.chat].sBye = text;
    m.reply(tradutor.texto1);
  } else throw `${tradutor.texto2}\n*- @user ${tradutor.texto3}`;
};
handler.help = ['setbye <text>'];
handler.tags = ['group'];
handler.command = ['setbye'];
handler.admin = true;
export default handler;
