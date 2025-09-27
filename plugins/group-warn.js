const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.gc_warn;

  // Aseguramos que m.mentionedJid sea siempre un array
  let mentions = Array.isArray(m.mentionedJid) ? m.mentionedJid : [];
  if (mentions.length === 0 && text) mentions = conn.parseMention(text);

  // Evitamos advertir al bot
  if (mentions.includes(conn.user.jid)) return;

  let who;
  if (m.isGroup) {
    if (mentions.length > 0) {
      who = mentions[0]; // Si hay mención, primera persona
    } else if (m.quoted) {
      who = m.quoted.sender; // Si hay respuesta a mensaje
    } else {
      who = text?.replace(/@\d+/g, '').trim(); // Si hay texto sin mención
    }
  } else {
    who = m.chat;
  }

  // Si no hay objetivo
  if (!who) {
    const warntext = `${tradutor.texto1}\n*${usedPrefix + command} @${global.suittag}*`;
    return m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) });
  }

  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const dReason = 'Sin motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+-?\d* /g, '');

  // Suma advertencia
  user.warn = (user.warn || 0) + 1;

  await m.reply(
    `*@${who.split`@`[0]}* ${tradutor.texto2[0]} ${sdms}\n${tradutor.texto2[1]} ${user.warn}/6*`,
    null,
    { mentions: [who] }
  );

  // Si llega a 6 advertencias
  if (user.warn >= 6) {
    if (!bot.restrict) {
      return m.reply(`${tradutor.texto3[0]} (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) ${tradutor.texto3[1]}`);
    }

    user.warn = 0;
    await m.reply(
      `${tradutor.texto4[0]}\n*@${who.split`@`[0]}* ${tradutor.texto4[1]}`,
      null,
      { mentions: [who] }
    );
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
