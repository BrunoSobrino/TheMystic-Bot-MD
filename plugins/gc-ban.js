const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (m.mentionedJid.includes(conn.user.jid)) return;

  const pp = './src/warn.jpg';
  let who;

  if (m.isGroup) {
    who = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;
  } else {
    who = m.chat;
  }

  const warntext = `*[❗] 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾 𝙿𝙰𝚁𝙰 𝙱𝙰𝙽𝙴𝙰𝚁 𝙰𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} @${global.suittag}*`;

  if (!who || typeof who !== 'string' || !who.includes('@s.whatsapp.net')) {
    throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) });
  }

  // Inicializar usuario si no existe
  let user = global.db.data.users[who];
  if (!user) {
    user = global.db.data.users[who] = { warn: 0 };
  }

  // Inicializar configuración del bot si no existe
  if (!global.db.data.settings[conn.user.jid]) {
    global.db.data.settings[conn.user.jid] = { restrict: false };
  }
  const bot = global.db.data.settings[conn.user.jid];

  // Extraer motivo (eliminar menciones)
  let msgtext = text || '';
  let mentioned = conn.parseMention(msgtext);
  let sdms = msgtext;
  for (let tag of mentioned) {
    sdms = sdms.replace('@' + tag.split('@')[0], '').trim();
  }
  if (!sdms) sdms = 'Sin motivo';

  // Aumentar advertencia
  user.warn += 1;

  await m.reply(
    `*@${who.split`@`[0]}* 𝚂𝙴𝚁𝙰𝚂 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾 𝙳𝙴 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾!\nMotivo: ${sdms}`,
    null,
    { mentions: [who] }
  );

  if (user.warn >= 1) {
    if (!bot.restrict) {
      return m.reply(
        '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙿𝚁𝙾𝙿𝙸𝙴𝚃𝙰𝙳𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙰𝙳𝙾 𝙻𝙰𝚂 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝙲𝙸𝙾𝙽𝙴𝚂 (#enable restrict) 𝙲𝙾𝙽𝚃𝙰𝙲𝚃𝙴 𝙲𝙾𝙽 𝙴𝙻 𝙿𝙰𝚁𝙰 𝚀𝚄𝙴 𝙻𝙾 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙴*'
      );
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
    } catch (e) {
      console.error(e);
      m.reply('❌ No se pudo eliminar al usuario. ¿El bot tiene permisos de admin?');
    }
  }

  return !1;
};

handler.command = /^(ban|kick|banear|eliminar)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
