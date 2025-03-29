const handler = async (m, {conn, text, command, usedPrefix}) => {
  if (m.mentionedJid.includes(conn.user.jid)) return;
  const pp = './src/warn.jpg';
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ?
      m.mentionedJid[0] :
      m.quoted ?
      m.quoted.sender :
      text;
  } else who = m.chat;
  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const dReason = 'Sin motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+-?\d* /g, '');
  const warntext = `*[❗] 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 𝙿𝙰𝚁𝙰 𝙱𝙰𝙽𝙴𝙰𝚁 𝙰𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${
    usedPrefix + command
  } @${global.suittag}*`;
  if (!who) {
    throw m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)});
  }
  user.warn += 1;
  await m.reply(
      `${
      user.warn == 1 ? `*@${who.split`@`[0]}*` : `*@${who.split`@`[0]}*`
      } 𝚂𝙴𝚁𝙰𝚂 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 𝙳𝙴 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾!\n
Motivo: ${sdms}`,
      null,
      {mentions: [who]},
  );
  if (user.warn >= 1) {
    if (!bot.restrict) {
      return m.reply(
          '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙿𝚁𝙾𝙿𝙸𝙴𝚃𝙰𝙳𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙰𝙳𝙾 𝙻𝙰𝚂 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝙲𝙸𝙾𝙽𝙴𝚂 (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) 𝙲𝙾𝙽𝚃𝙰𝙲𝚃𝙴 𝙲𝙾𝙽 𝙴𝙻 𝙿𝙰𝚁𝙰 𝚀𝚄𝙴 𝙻𝙾 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙴*',
      );
    }
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
  }
  return !1;
};

handler.command = /^(ban|kick|banear|eliminar)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
