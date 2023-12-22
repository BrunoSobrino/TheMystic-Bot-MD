import fetch from 'node-fetch';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*الأمر التالي لإحضاؤ الصور من الذكاء الصناعي* ${usedPrefix + command}  ${usedPrefix + command} انتظر *`;
    await conn.sendMessage(m.chat, {text: '*إنتظر قليلا الصورة قيد الإنشاء.*'}, {quoted: m});
  try {
    const tiores1 = await fetch(`https://vihangayt.me/tools/imagine?q=${text}`);
    const json1 = await tiores1.json();
    await conn.sendMessage(m.chat, {image: {url: json1.data}}, {quoted: m});
  } catch {  
      console.log('[❗] Error en la api numero 1 de dall-e.');  
  try {
    const tiores2 = await conn.getFile(`https://vihangayt.me/tools/midjourney?q=${text}`);
    await conn.sendMessage(m.chat, {image: {url: tiores2.data}}, {quoted: m});
  } catch {
      console.log('[❗] Error en la api numero 2 de dall-e.');
  try {
    const tiores3 = await fetch(`https://vihangayt.me/tools/lexicaart?q=${text}`);
    const json3 = await tiores3.json();
    await conn.sendMessage(m.chat, {image: {url: json3.data[0].images[0].url}}, {quoted: m});
  } catch {
      console.log('[❗] Error en la api numero 3 de dall-e.');
  try {
    const tiores4 = await conn.getFile(`https://api.lolhuman.xyz/api/dall-e?apikey=${lolkeysapi}&text=${text}`);
    await conn.sendMessage(m.chat, {image: {url: tiores4.data}}, {quoted: m});
  } catch {
    console.log('[❗] Error, ninguna api funcional.');
    throw `*[❗] Error, no se obtuvierón resultados.*`;
  }}
 }}
};
handler.command = ['dall-e', 'dalle', 'ia2', 'cimg', 'openai3', 'a-img', 'aimg', 'imagine'];
export default handler;
