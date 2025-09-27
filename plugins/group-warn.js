const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.gc_warn;

  // Si hay mención directa en el comando
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    if (args.length > 0) {
      m.mentionedJid = conn.parseMention(text);
    }
  }

  let who;
  if (m.isGroup) {
    if (m.mentionedJid.length > 0) {
      // Si usaron .warn @usuario
      who = m.mentionedJid[0];
    } else if (m.quoted) {
      // Si respondieron al mensaje
      who = m.quoted.sender;
    } else {
      // Si no hay mención ni mensaje respondido
      who = null;
    }
  } else {
    who = m.chat;
  }

  // Si no hay a quién advertir
  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`;
    return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) });
  }

  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const dReason = 'Sin motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+/g, ''); // quitar menciones del motivo

  // Evita advertir al bot
  if (who === conn.user.jid) return;

  user.warn = (user.warn || 0) + 1;
  await m.reply(
    `*@${who.split`@`[0]}* ${tradutor.texto2[0]} ${sdms}\n${tradutor.texto2[1]} ${user.warn}/6*`,
    null,
    { mentions: [who] }
  );

  if (user.warn >= 6) {
    if (!bot.restrict) {
      return m.reply(`${tradutor.texto3[0]} (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) ${tradutor.texto3[1]}`);
    }
    user.warn = 0;
    await m.reply(`${tradutor.texto4[0]}\n*@${who.split`@`[0]}* ${tradutor.texto4[1]}`, null, { mentions: [who] });
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
  }

  return !1;
};

handler.tags = ['group'];
handler.help = ['warn'];
handler.command = /^(advertir|advertencia|warn|warning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
