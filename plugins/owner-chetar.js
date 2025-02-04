

const handler = async (m, {conn}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.owner_chetar;

  const user = global.db.data.users[m.sender];
  conn.sendMessage(m.chat, {text: `*[❗] @${m.sender.split('@')[0]} ${tradutor.texto1}`, mentions: [m.sender]}, {quoted: m});
  global.db.data.users[m.sender].money = Infinity;
  global.db.data.users[m.sender].limit = Infinity;
  global.db.data.users[m.sender].level = Infinity;
  global.db.data.users[m.sender].exp = Infinity;
};
handler.help = ['cheat'];
handler.tags = ['owner'];
handler.command = /^(ilimitado|infiniy|chetar)$/i;
handler.rowner = true;
handler.fail = null;
export default handler;
