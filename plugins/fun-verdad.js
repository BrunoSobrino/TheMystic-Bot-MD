

const handler = async (m, {conn}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.fun_verdad;

  global.verdad = tradutor.texto3;

  conn.reply(m.chat, `*┌────「 𝚅𝙴𝚁𝙳𝙰𝙳 」─*\n*“${pickRandom(global.verdad)}”*\n*└────「 𝙼𝚈𝚂𝚃𝙸𝙲 」─*`, m);
};
handler.help = ['verdad'];
handler.tags = ['fun'];
handler.command = /^verdad/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}


