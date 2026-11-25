// Busca al participante en los metadatos del grupo aceptando JID, LID o número.
const findParticipant = (participants, jid, conn) => {
  const resolved = conn?.resolveUser?.(jid) || {};
  const ids = [...new Set([jid, resolved.jid, resolved.lid, resolved.pn ? resolved.pn + '@s.whatsapp.net' : null].filter(Boolean))];
  return (participants || []).find((p) => ids.includes(p.id) || ids.includes(p.phoneNumber) || ids.includes(p.lid));
};

const handler = async (m, {conn, usedPrefix, text, participants}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_demote

  if (isNaN(text) && !text.match(/@/g)) {

  } else if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  if (!text && !m.quoted) return conn.reply(m.chat, `${tradutor.texto1[0]} ${usedPrefix}quitaradmin @tag*\n*┠≽ ${usedPrefix}quitaradmin ${tradutor.texto1[1]}`, m);
  if (number.length > 13 || (number.length < 11 && number.length > 0)) return conn.reply(m.chat, tradutor.texto2, m);

  try {
    const _mentioned = await m.mentionedJid;
    if (_mentioned.length > 0) {
      var user = _mentioned[0];
    } else if (text) {
      var user = number + '@s.whatsapp.net';
    } else if (await m?.quoted?.sender) {
      var user = await m?.quoted?.sender;
    }
    if (!user) return;
    // Si la persona no es admin, avisar y no intentar la degradación de nuevo.
    if (!findParticipant(participants, user, conn)?.admin) {
      const msg = tradutor.texto4.replace('@user', '@' + user.split('@')[0]);
      return m.reply(msg, m.chat, { mentions: [user] });
    }
    await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    conn.reply(m.chat, tradutor.texto3, m);
  } catch (e) {
  }
};
handler.help = ['demote'].map((v) => 'mention ' + v);
handler.tags = ['group'];
handler.command = /^(demote|quitarpoder|quitaradmin)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.fail = null;
export default handler;
