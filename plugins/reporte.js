const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] أدخل تقريرا*\n\n*مثال:*\n*${usedPrefix + command} الأمر ${usedPrefix}اللعب لا يرسل أي شيء*`;
  if (text.length < 10) throw `*[❗معلومة❗] يجب أن يكون التقرير 10 أحرف على الأقل*`;
  if (text.length > 1000) throw `*[❗معلومة❗] يجب أن يكون التقرير 1000 أحرف على الأقل!*`;
  const teks = `*❒═════[التقرير]═════❒*\n*┬*\n*├❧ الرقم:* wa.me/${m.sender.split`@`[0]}\n*┴*\n*┬*\n*├❧ الرسالة:* ${text}\n*┴*`;
  conn.reply('212689707732@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
  conn.reply('212648753294@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
  m.reply(`*[ ✔️ ] تم إرسال التقرير بنجاح إلى صاحب البوت، سيتم الرد على بلاغك في أسرع وقت ممكن، إذا كان كاذبًا أو مزحة سيتم تجاهله فقط*`);
};
handler.help = ['reporte', 'request'].map((v) => v + ' <teks>');
handler.tags = ['info'];
handler.command = /^(report|request|reporte|bugs|bug|report-owner|reportes)$/i;
export default handler;
