import Presence from '@whiskeysockets/baileys';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.gc_setname

const handler = async (m, {conn, args, text}) => {
  if (!text) throw tradutor.texto1;
  try {
    const text = args.join` `;
    if (!args || !args[0]) {
    } else {
      conn.groupUpdateSubject(m.chat, text);
    }
  } catch (e) {
    throw tradutor.texto2;
  }
};
handler.help = ['setname <text>'];
handler.tags = ['group'];
handler.command = /^(setname)$/i;
handler.group = true;
handler.admin = true;
export default handler;
