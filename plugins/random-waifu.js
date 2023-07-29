import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, command}) => {
  const res = await fetch('https://api.waifu.pics/sfw/waifu');
  if (!res.ok) throw await res.text();
  const json = await res.json();
  if (!json.url) throw 'Error!';
  conn.sendFile(m.chat, json.url, 'error.jpg', `𝙰-𝙰𝚁𝙰 𝙰𝚁𝙰 𝚂𝙴𝙼𝙿𝙰𝙸~~`, m);
// conn.sendButton(m.chat, `𝙰-𝙰𝚁𝙰 𝙰𝚁𝙰 𝚂𝙴𝙼𝙿𝙰𝙸~~`, author, json.url, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)
};
handler.help = ['waifu'];
handler.tags = ['anime'];
handler.command = /^(waifu)$/i;
export default handler;
