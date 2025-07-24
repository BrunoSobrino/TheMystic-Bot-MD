

const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.maker_lolice

  const who = m.quoted ? await m?.quoted?.sender : await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/lolice', {
    avatar: await conn.profilePictureUrl(who, 'image').catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png'),
  }), 'error.png', tradutor.texto1, m);
};
handler.help = ['lolice'];
handler.tags = ['maker'];
handler.command = /^(lolice)$/i;
export default handler;
