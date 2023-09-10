const handler = async (m, {conn, args, usedPrefix, command}) => {
  if (!args[0]) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙳𝙴 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} luisitocomunica*`;
  await m.reply(global.wait);
  const res = await fetch(`https://api.lolhuman.xyz/api/igstory/${args[0]}?apikey=${lolkeysapi}`);
  const anu = await res.json();
  const anuku = anu.result;
  if (anuku == '') return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*');
  for (const i of anuku) {
    const res = await axios.head(i);
    const mime = res.headers['content-type'];
    if (/image/.test(mime)) {
      await conn.sendFile(m.chat, i, 'error.jpg', null, m).catch(() => {
        return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*');
      });
    }
    if (/video/.test(mime)) {
      await conn.sendFile(m.chat, i, 'error.mp4', null, m).catch(() => {
        return m.reply('*[❗] 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙸𝙽𝚅𝙰𝙻𝙸𝙳𝙾 𝙾 𝚂𝙸𝙽 𝙷𝙸𝚂𝚃𝙾𝚁𝙸𝙰𝚂*');
      });
    }
  }
};
handler.help = ['igstory <username>'];
handler.tags = ['downloader'];
handler.command = ['igstory', 'ighistoria'];
export default handler;
