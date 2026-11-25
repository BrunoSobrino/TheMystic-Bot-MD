const handler = async (m, { conn }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.owner_banchat;

  const normalizeJid = (jid) => jid.split('@')[0];
  const thisBot = conn.user.id;

  const testi = await await m.mentionedJid
  if (testi && testi.length > 0) {
    const mentionedBot = testi[0];
    console.log(m)
    console.log(mentionedBot)
    
    if (normalizeJid(mentionedBot) !== normalizeJid(thisBot)) return;

    if (global.db.data.chats[m.chat].isBanned) {
      m.reply(tradutor.texto2);
      return;
    }

    global.db.data.chats[m.chat].isBanned = true;
    m.reply(`${tradutor.texto3[0]}${conn.user.name || 'actual'}${tradutor.texto3[1]}`);
    return;
  }

  if (global.db.data.chats[m.chat].isBanned) {
    m.reply(tradutor.texto2);
    return;
  }

  global.db.data.chats[m.chat].isBanned = true;
  m.reply(tradutor.texto1);
};

handler.help = ['banchat', 'banchat @bot'];
handler.tags = ['owner'];
handler.command = /^banchat$/i;
handler.rowner = true;
export default handler;

