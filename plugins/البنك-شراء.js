const xpperlimit = 350;
const handler = async (m, {conn, command, args}) => {
  let count = command.replace(/^شراء/i, '');
  count = count ? /الكل/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
  count = Math.max(1, count);
  if (global.db.data.users[m.sender].exp >= xpperlimit * count) {
    global.db.data.users[m.sender].exp -= xpperlimit * count;
    global.db.data.users[m.sender].limit += count;
    conn.reply(m.chat, `
*┌●━──━𓊆شراء 𓊇━──━●*
╎S• 「الكمية💰」: + ${count}💰
╎S• 「الخبرة💵」 : -${xpperlimit * count} خبرة💵
*└●━──𓊆⍣⃝𝑁𝐴𝑇𝑺𝑈𓊇──━●*`, m);
  } else conn.reply(m.chat, ` ${count} `, m);
};
handler.help = ['𝑁 𝐴 𝑇 𝑺 𝑈'];
handler.tags = ['𝑁 𝐴 𝑇 𝑺 𝑈'];
handler.command = ['شراء', 'شراءالكل'];

handler.disabled = false;

export default handler;