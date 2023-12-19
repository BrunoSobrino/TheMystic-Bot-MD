import {pinterest} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*يستخدم الأمر هكذا ${usedPrefix + command} صورة جميلة*`;
  const json = await pinterest(text);
  conn.sendFile(m.chat, json.getRandom(), 'mlawi.jpg', `
*النتيجة الأولى *
${text}
`.trim(), m);
};
handler.help = ['pinterest <keyword>'];
handler.tags = ['internet'];
handler.command = /^(pinterest)$/i;
export default handler;
