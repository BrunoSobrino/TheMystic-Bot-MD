import {googleImage} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗ خطأ ❗] حط اسم ${usedPrefix + command} ناتسو*`;
  
  const res = await googleImage(text);
  const image = await res.getRandom();
  const link = image;
  conn.sendFile(m.chat, link, 'error.jpg', `*┌●━──━𓊆بحث𓊇━──━●*
*⌝🍁╎نـتـيـجـه الـبـحـث╎🍁⌞*
*♡↵》البحث 『  ${text} 🔍  』•*
*♡↵》المصدر『جوجل』•*
*└●━──𓊆⍣⃝𝑁𝐴𝑇𝑺𝑈𓊇──━●*`, m);
};
handler.help = ['gimage <query>', 'imagen <query>'];
handler.tags = ['internet', 'tools'];
handler.command = /^(صوره|صورة|ثورة)$/i;
export default handler;