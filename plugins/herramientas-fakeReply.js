
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_fakereply
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) return m.reply(`${tradutor.texto1[0]}\n\n*${usedPrefix + command}* ${tradutor.texto1[1]} @${m.sender.split`@`[0]} a`, null, {mentions: [m.sender]});
  const cm = copy(m);
  let who;
  if (text.includes('@0')) who = '0@s.whatsapp.net';
  else if (m.isGroup) who = cm.participant = m.mentionedJid[0];
  else who = m.chat;
  if (!who) return m.reply(`${tradutor.texto1[0]}\n\n*${usedPrefix + command}* ${tradutor.texto1[1]} @${m.sender.split`@`[0]} a`, null, {mentions: [m.sender]});
  cm.key.fromMe = false;
  cm.message[m.mtype] = copy(m.msg);
  const sp = '@' + who.split`@`[0];
  const [fake, ...real] = text.split(sp);
  conn.fakeReply(m.chat, real.join(sp).trimStart(), who, fake.trimEnd(), m.isGroup ? m.chat : false, {
    contextInfo: {
      mentionedJid: conn.parseMention(real.join(sp).trim()),
    },
  });
};
handler.help = ['fake <text> @user <text2>'];
handler.tags = ['tools'];
handler.command = /^(fitnah|fakereply|fake)$/;

export default handler;

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
