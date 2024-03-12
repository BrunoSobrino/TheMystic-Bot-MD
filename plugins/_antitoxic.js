// TheMystic-Bot-MD@BrunoSobrino - _antitoxic.js
import _translate from "./_translate.js"; // Modulo Tradutor
const tradutor = _translate.plugins._antitoxic // Opção de Tradução do arquivo


const toxicRegex = /puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 5)) await m.reply(`${tradutor.texto1}` + `${user.warn == 1 ? `@${m.sender.split`@`[0]}` : `@${m.sender.split`@`[0]}`}, ${tradutor.texto1_1}"${isToxic}" ${tradutor.texto1_2} ${user.warn}/5` + '*', false, {mentions: [m.sender]});
  }

  if (user.warn >= 5) {
    user.warn = 0;
    await m.reply(`${tradutor.texto2} @${m.sender.split('@')[0]}, ${tradutor.texto2_1}`, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    // await this.updateBlockStatus(m.sender, 'block')
  }
  return !1;
}
