const handler = async (m, {usedPrefix}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  else who = m.sender;
  const name = conn.getName(who);
  m.reply(`
┓━━⊰ _🪙قائمه عملاتك🪙_ ⊱━━⊰
┣⊱⧪⟫ الاسـم : ${name}
┣⊱⧪⟫ عـمـلاتـك : ${global.db.data.users[who].limit}
┛━━━━━━⊰🪙🪙🪙⊱━━━━━⊰ـ
لتعرف المزيد عن معلومات البوت اطلب 
❏ *.المتجر*
❏ *.البنك*`);
};
handler.help = ['ami'];
handler.tags = ['xp'];
handler.command = ['عملاتي'];
export default handler;
