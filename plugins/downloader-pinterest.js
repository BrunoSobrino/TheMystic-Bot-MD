import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {

  if (!text) return conn.reply(m.chat, `[ ❗ ] Ingresa un término de búsqueda.`, m);

  const pinterestAPI = `https://api.stellarwa.xyz/search/pinterest?query=${text}`;

  try {
    const res = await fetch(pinterestAPI);
    if (!res.ok) {
      throw new Error(`La API devolvió un código de error: ${res.status}`);
    }

    const jsons = await res.json();
    const json = jsons.data

    if (!json || json.length === 0) 
      return conn.reply(m.chat, `[ ❕ ] No se encontraron resultados para "${text}".`, m);

    const result = json[Math.floor(Math.random() * json.length)];

    await conn.sendMessage(m.chat, { image: { url: result.hd } }, { quoted: m });

  } catch (e) {
    await m.reply(`[ ❌ ] Error, intenta nuevamente.`);
    console.error(e);
  }
};

handler.help = ['pinterest', 'pin'];
handler.tags = ['download'];
handler.command = ['pinterest', 'pin'];

export default handler;