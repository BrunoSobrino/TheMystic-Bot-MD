import MessageType from '@whiskeysockets/baileys';

const pajak = 0;
const handler = async (m, {conn, text}) => {

  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.onwer_anadirlimit

  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw tradutor.texto1;
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  if (!txt) throw tradutor.texto2;
  if (isNaN(txt)) throw tradutor.texto3;
  const dmt = parseInt(txt);
  let limit = dmt;
  const pjk = Math.ceil(dmt * pajak);
  limit += pjk;
  if (limit < 1) throw tradutor.texto4;
  const users = global.db.data.users;
  users[who].limit += dmt;
  m.reply(`≡ ${tradutor.texto5[0]}
┌──────────────
▢ ${tradutor.texto5[1]} ${dmt}
└──────────────`);
};
handler.command = ['añadirdiamantes', 'addd', 'dard', 'dardiamantes'];
handler.rowner = true;
export default handler;
