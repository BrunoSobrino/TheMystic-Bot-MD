const handler = async (m, {conn, isOwner}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.gc_listwarn;

  // Filtrar usuarios con warns
  const adv = Object.entries(global.db.data.users).filter(([jid, user]) => user.warn && user.warn > 0);

  const caption = `${tradutor.texto1}\n 
*╔═══════════════════·•*
║ ${tradutor.texto2[0]} ${adv.length} ${tradutor.texto2[1]} 
${adv.map(([jid, user], i) => {
  i++;
  return `║
║ ${i}.- @${jid.split('@')[0]} *(${user.warn}/6)* 
║ - - - - - - - - -`;
}).join('\n')}
*╚══════════════════·•*`;
  await conn.sendMessage(m.chat, {text: caption, mentions: await conn.parseMention(caption)}, {quoted: m});
};

handler.help = ['listwarn'];
handler.tags = ['group'];
handler.command = /^(listwarn)$/i;
handler.group = true;
handler.admin = true;
export default handler;
