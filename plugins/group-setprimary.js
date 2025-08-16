import ws from 'ws'

const handler = async (m, { conn, command }) => {
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])];

  if (!subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid);
  }

  const testi = (await m?.mentionedJid || [])[0];
  const who = testi ? testi : (m?.quoted ? await m?.quoted?.sender : false)
  const chat = global.db.data.chats[m.chat];

  if (command === 'setprimary') {
  if (!who) return conn.reply(m.chat, `❗ Por favor menciona un bot para modificar la configuración.`, m);

  if (!subBots.includes(who)) return conn.reply(m.chat, `❗ El usuario mencionado no es Sub-Bot.`, m);

    if (chat.setPrimaryBot === who) {
      return conn.reply(m.chat, `✅ @${who.split`@`[0]} ya es el Bot principal del Grupo.`, m, { mentions: [who] });
    }

    try {
      chat.setPrimaryBot = who;
      conn.reply(m.chat, `[❕] Se ha establecido a @${who.split`@`[0]} como bot primario de este grupo.`, m, { mentions: [who] });
    } catch (e) {
      await m.reply(`❗ Ocurrió un error al establecer el bot primario.`);
    }
  } else if (command === 'delprimary') {
    if (!chat.setPrimaryBot) {
      return conn.reply(m.chat, `❗ No hay un bot primario establecido en este grupo.`, m);
    }

    try {
      const previousBot = chat.setPrimaryBot;
      delete chat.setPrimaryBot
      conn.reply(m.chat, `▶️ @${previousBot.split`@`[0]} ha sido eliminado como bot primario del grupo.`, m, { mentions: [previousBot] });
    } catch (e) {
      await m.reply(`❗ Ocurrió un error al eliminar el bot primario.`);
    }
  }
};

handler.help = ['setprimary', 'delprimary'];
handler.tags = ['group'];
handler.command = ['setprimary', 'delprimary'];
handler.admin = true;

export default handler;
