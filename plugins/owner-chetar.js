const handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
        conn.sendMessage(m.chat, {text: `*[❗] ${m.sender.split('@')[0]} ahora tus recursos son ilimitados.*`, mentions: [m.sender]}, {quoted: m});
      global.db.data.users[m.sender].money = '∞';
    global.db.data.users[m.sender].limit = '∞';
  global.db.data.users[m.sender].level = '∞';
 global.db.data.users[m.sender].exp = '∞';
};
handler.help = ['cheat'];
handler.tags = ['owner'];
handler.command = /^(ilimitado|infiniy|chetar)$/i;
handler.rowner = true;
handler.fail = null;
export default handler;
