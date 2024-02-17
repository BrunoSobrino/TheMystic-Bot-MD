const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw `*[❗] منشن الشخص الي عايز تشيلوا من البريم*`;
  if (!user) throw `*[❗]هذا غير موجود في قائمة البوت*`;
  if (user.premiumTime = 0) throw '*[❗] ليس مميز بالفعل*';
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;

  user.premium = false;

  const textdelprem = `*[❗] @${who.split`@`[0]} حصل مشكله في إزالة البريم*`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['delprem <@user>'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)prem|معفن$/i;
handler.group = true;
handler.rowner = true;
export default handler;