
// TheMystic-Bot-MD@BrunoSobrino - _antitoxic

 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.


const toxicRegex = /\b(cp|cepe|pornoinfantil|childporn|child porn|porno infantil)\b/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
 
const chat = global.db.data.chats[m.chat];
 
 if (!chat.antiToxic) {
  return !1;
 }

  const datas = global
    const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins._antitoxic

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 15)) await m.reply('*[❗] ' + `${user.warn == 1 ? `Hola @${m.sender.split`@`[0]}` : `@${m.sender.split`@`[0]}`}, decir la palabra "${isToxic}" está prohibido en este grupo. Advertencia: ${user.warn}/15.` + '*', false, {mentions: [m.sender]});
  }

  if (user.warn >= 15) {
    user.warn = 0;
    await m.reply(`*[❗] Hola @${m.sender.split`@`[0]}, superaste las 15 advertencias por lo que serás eliminado de este grupo por tu comportamiento.*`, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    // await this.updateBlockStatus(m.sender, 'block')
  }
  return !1;
}
