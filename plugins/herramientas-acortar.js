import fetch from 'node-fetch';
const handler = async (m, {conn, args, text}) => {
  if (!text) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝙴𝙽𝙻𝙰𝙲𝙴 / 𝚄𝚁𝙻 𝙴𝙻 𝙲𝚄𝙰𝙻 𝙳𝙴𝚂𝙴𝙰 𝙰𝙲𝙾𝚁𝚃𝙰𝚁*';
  const shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
  if (!shortUrl1) throw `*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝙲𝙾𝙼𝙿𝚁𝚄𝙴𝙱𝙴 𝚀𝚄𝙴 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝙸𝙽𝙶𝚁𝙴𝚂𝙰𝙳𝙾 𝚂𝙴𝙰 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾 𝙴 𝙸𝙽𝚃𝙴𝙽𝚃𝙴𝙻𝙾 𝙳𝙴 𝙽𝚄𝙴𝚅𝙾*`;
  const done = `*𝙻𝙸𝙽𝙺 𝙰𝙲𝙾𝚁𝚃𝙰𝙳𝙾 𝙲𝙾𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴!!*\n\n*𝙻𝙸𝙽𝙺 𝙰𝙽𝚃𝙴𝚁𝙸𝙾𝚁:*\n${text}\n*𝙻𝙸𝙽𝙺 𝙰𝙲𝙾𝚁𝚃𝙰𝙳𝙾:*\n${shortUrl1}`.trim();
  m.reply(done);
};
handler.help = ['tinyurl', 'acortar'].map((v) => v + ' <link>');
handler.tags = ['tools'];
handler.command = /^(tinyurl|short|acortar|corto)$/i;
handler.fail = null;
export default handler;
