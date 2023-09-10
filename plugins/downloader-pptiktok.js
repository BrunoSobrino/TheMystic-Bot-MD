import fetch from 'node-fetch';
const handler = async (m, {conn, args, text}) => {
  if (!text) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝚃𝙸𝙺𝚃𝙾𝙺*';
  const res = `https://api.lolhuman.xyz/api/pptiktok/${text}?apikey=${lolkeysapi}`;
  conn.sendFile(m.chat, res, 'error.jpg', `*[ ✔ ] 𝙰𝚀𝚄𝙸 𝙴𝚂𝚃𝙰 𝙻𝙰 𝙵𝙾𝚃𝙾 𝙳𝙴 𝙿𝙴𝚁𝙵𝙸𝙻 𝙳𝙴 ${text}*`, m, false);
};
handler.help = ['tiktokfoto'].map((v) => v + ' <username>');
handler.tags = ['downloader'];
handler.command = /^(tiktokfoto|pptiktok)$/i;
export default handler;
