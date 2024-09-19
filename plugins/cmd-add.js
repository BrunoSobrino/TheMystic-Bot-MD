

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.cmd_add

  global.db.data.sticker = global.db.data.sticker || {};
  if (!m.quoted) throw `*${tradutor.texto1}*`;
  if (!m.quoted.fileSha256) throw `*${tradutor.texto2}*`;
  if (!text) throw `*${tradutor.texto3[0]}*\n*—◉ ${usedPrefix + command} ${tradutor.texto3[1]}*\n\n*${tradutor.texto3[2]}*\n*—◉ ${usedPrefix + command} <#menu> ${tradutor.texto3[3]}*`;
  const sticker = global.db.data.sticker;
  const hash = m.quoted.fileSha256.toString('base64');
  if (sticker[hash] && sticker[hash].locked) throw `*${tradutor.texto4}*`;
  sticker[hash] = {text, mentionedJid: m.mentionedJid, creator: m.sender, at: + new Date, locked: false};
  m.reply(`*${tradutor.texto5}*`);
};
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.rowner = true;
export default handler;
