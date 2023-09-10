const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const textpremERROR = `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 @𝚝𝚊𝚐 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙾 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝙰𝙻𝙶𝚄𝙽 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙳𝙴 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁 𝙰 𝙻𝙾𝚂 𝚄𝚂𝚄𝙰𝚁𝙸𝙾𝚂 𝙿𝚁𝙴𝙼𝙸𝚄𝙼*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*◉ ${usedPrefix + command} @${m.sender.split`@`[0]} 1*\n*◉ ${usedPrefix + command} 1 <responder a mensaje>*`;
  if (!who) return m.reply(textpremERROR, null, {mentions: conn.parseMention(textpremERROR)});

  const user = global.db.data.users[who];
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  // let name = await conn.getName(who)
  const name = await '@' + who.split`@`[0];

  const ERROR = `*[❗] 𝙴𝙻 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 ${'@' + who.split`@`[0]} 𝙽𝙾 𝚂𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰 𝙴𝙽 𝙼𝙸 𝙱𝙰𝚂𝙴 𝙳𝙴 𝙳𝙰𝚃𝙾𝚂*`;
  if (!user) return m.reply(ERROR, null, {mentions: conn.parseMention(ERROR)});

  const segundos10 = 10 * 1000; // 10 segundos en milisegundos
  const hora1 = 60 * 60 * 1000 * txt; // 1 hora
  const dia1 = 24 * hora1 * txt; // 1 día
  const semana1 = 7 * dia1 * txt; // 1 semana
  const mes1 = 30 * dia1 * txt; // 1 mes
  const now = Date.now();

  if (command == 'addprem' || command == 'userpremium') {
    if (now < user.premiumTime) user.premiumTime += hora1;
    else user.premiumTime = now + hora1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000; // tiempo restante en segundos
    const textprem1 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} hora(s)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeLeft} segundos*`;
    m.reply(textprem1, null, {mentions: conn.parseMention(textprem1)});
  }

  if (command == 'addprem2' || command == 'userpremium2') {
    if (now < user.premiumTime) user.premiumTime += dia1;
    else user.premiumTime = now + dia1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000 / 60 / 60; // tiempo restante en horas
    const textprem2 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} día(s)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeLeft} horas*`;
    m.reply(textprem2, null, {mentions: conn.parseMention(textprem2)});
  }

  if (command == 'addprem3' || command == 'userpremium3') {
    if (now < user.premiumTime) user.premiumTime += semana1;
    else user.premiumTime = now + semana1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem3 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} semana(s)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeleft}*`;
      m.reply(textprem3, null, {mentions: conn.parseMention(textprem3)});
    });
  }

  if (command == 'addprem4' || command == 'userpremium4') {
    if (now < user.premiumTime) user.premiumTime += mes1;
    else user.premiumTime = now + mes1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem4 = `*🎟️ 𝙽𝚄𝙴𝚅𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝚁𝙴𝙼𝙸𝚄𝙼!!!*\n\n*✨ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾: ${name}*\n*🕐 𝚃𝙸𝙴𝙼𝙿𝙾: ${txt} mes(es)*\n*📉 𝚁𝙴𝚂𝚃𝙰𝙽𝚃𝙴: ${timeleft}*`;
      m.reply(textprem4, null, {mentions: conn.parseMention(textprem4)});
    });
  }
};
handler.help = ['addprem [@user] <days>'];
handler.tags = ['owner'];
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'];
handler.group = true;
handler.rowner = true;
export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) {
    timeString += `${days} día${days > 1 ? 's' : ''} `;
  }
  if (hours) {
    timeString += `${hours} hora${hours > 1 ? 's' : ''} `;
  }
  if (minutes) {
    timeString += `${minutes} minuto${minutes > 1 ? 's' : ''} `;
  }
  if (seconds) {
    timeString += `${seconds} segundo${seconds > 1 ? 's' : ''} `;
  }
  return timeString.trim();
}
