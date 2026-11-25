import fs from 'fs';
import ws from 'ws'

const handler = async (m, { conn, command }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.group_setprimary
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])];

  if (!subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid);
  }

  const testi = (await m?.mentionedJid || [])[0];
  const who = testi ? testi : (m?.quoted ? await m?.quoted?.sender : false)
  const chat = global.db.data.chats[m.chat];

  if (command === 'setprimary') {
  if (!who) return conn.reply(m.chat, tradutor.texto1, m);

  if (!subBots.includes(who)) return conn.reply(m.chat, tradutor.texto2, m);

    if (chat.setPrimaryBot === who) {
      return conn.reply(m.chat, `${tradutor.texto3}${who.split`@`[0]}${tradutor.texto3_1}`, m, { mentions: [who] });
    }

    try {
      chat.setPrimaryBot = who;
      conn.reply(m.chat, `${tradutor.texto4}${who.split`@`[0]}${tradutor.texto4_1}`, m, { mentions: [who] });
    } catch (e) {
      await m.reply(tradutor.texto5);
    }
  } else if (command === 'delprimary') {
    if (!chat.setPrimaryBot) {
      return conn.reply(m.chat, tradutor.texto6, m);
    }

    try {
      const previousBot = chat.setPrimaryBot;
      delete chat.setPrimaryBot
      conn.reply(m.chat, `${tradutor.texto7}${previousBot.split`@`[0]}${tradutor.texto7_1}`, m, { mentions: [previousBot] });
    } catch (e) {
      await m.reply(tradutor.texto8);
    }
  }
};

handler.help = ['setprimary', 'delprimary'];
handler.tags = ['group'];
handler.command = ['setprimary', 'delprimary'];
handler.admin = true;

export default handler;
