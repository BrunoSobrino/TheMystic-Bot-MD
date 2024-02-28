const handler = async (m, {conn, args, usedPrefix, command}) => {
  if (!args[0]) throw `*أڪتب إســم الـمستـخدم الإنسـتغـࢪام*\n\n*على سبيل المثال:*\n*${usedPrefix + command} f.b.i_ys._ess._ui_.di_man_6000*`;
  await m.reply(global.wait);
  const res = await fetch(`https://api.lolhuman.xyz/api/igstory/${args[0]}?apikey=${lolkeysapi}`);
  const anu = await res.json();
  const anuku = anu.result;
  if (anuku == '') return m.reply('*مستخدم غير صالح أو لا يوجد سجل*');
  for (const i of anuku) {
    const res = await axios.head(i);
    const mime = res.headers['content-type'];
    if (/image/.test(mime)) {
      await conn.sendFile(m.chat, i, 'error.jpg', null, m).catch(() => {
        return m.reply('*مستخدم غير صالح أو لا يوجد سجل*');
      });
    }
    if (/video/.test(mime)) {
      await conn.sendFile(m.chat, i, 'error.mp4', null, m).catch(() => {
        return m.reply('*مستخدم غير صالح أو لا يوجد سجل*');
      });
    }
  }
};
handler.help = ['igstory <username>'];
handler.tags = ['downloader'];
handler.command = ['igstory', 'ighistoria'];
export default handler;
