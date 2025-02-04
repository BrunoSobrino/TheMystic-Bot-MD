

const xpperlimit = 350;
const handler = async (m, {conn, command, args}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.rpg_shop;

  let count = command.replace(/^buy/i, '');
  count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
  count = Math.max(1, count);
  if (global.db.data.users[m.sender].exp >= xpperlimit * count) {
    global.db.data.users[m.sender].exp -= xpperlimit * count;
    global.db.data.users[m.sender].limit += count;
    conn.reply(m.chat, `
${tradutor.texto1[0]}
${tradutor.texto1[1]} : + ${count}💎 
${tradutor.texto1[2]} -${xpperlimit * count} XP
${tradutor.texto1[3]}`, m);
  } else conn.reply(m.chat, `${tradutor.texto2} *${count}* ${tradutor.texto3}`, m);
};
handler.help = ['Buy', 'Buyall'];
handler.tags = ['xp'];
handler.command = ['buy', 'buyall'];

handler.disabled = false;

export default handler;
