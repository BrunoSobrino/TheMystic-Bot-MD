import {pinterest} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `استخدم الأمر لتحميل الصور ${usedPrefix + command} صور محجبات*`;
  const json = await pinterest(text);
  conn.sendFile(m.chat, json.getRandom(), 'error.jpg', `
*النتيجة الأولى ابب 😘*
${text}
`.trim(), m);
};
handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest)$/i;
export default handler;
