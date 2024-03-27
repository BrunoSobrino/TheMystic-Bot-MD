const toxicRegex = /puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 15)) await m.reply('*[❗] ' + `${user.warn == 1 ? `Hola @${m.sender.split`@`[0]}` : `@${m.sender.split`@`[0]}`}, decir la palabra "${isToxic}" está prohibido en este grupo. Advertencia: ${user.warn}/15.` + '*', false, {mentions: [m.sender]});
  }

  if (user.warn >= 15) {
    user.warn = 0;
    await m.reply(`*[❗] Hola @${m.sender.split`@`[0]}, superaste las 15 advertencias por lo que serás eliminado de este grupo por tu comportamiento.*`, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    // await this.updateBlockStatus(m.sender, 'block')
  }
  return !1;
}
