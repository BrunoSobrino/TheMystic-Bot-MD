let handler = async (m, { conn, args }) => {
  try {
    let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat;

    const uniqueOnline = Object.values(conn.chats[id]?.messages || {}).map(item => item.key.participant).filter((value, index, self) => self.indexOf(value) === index);

    const sortedOnline = uniqueOnline.sort((a, b) => a.split('@')[0].localeCompare(b.split('@')[0]));

    const onlineList = sortedOnline.map((k, i) => `*${i + 1}.* @${k.split('@')[0]}`).join('\n') || 'لا يوجد مستخدمين على الانترنت في هذا الوقت.';

    await conn.reply(m.chat, `*🌐 قائمة المتصلين بالانترنيت الآن:*\n${onlineList}`, m, {
      contextInfo: { mentionedJid: sortedOnline }
    });
  } catch (e) {
    console.error(e);
  }
};

handler.help = ['listonline'];
handler.tags = ['owner'];
handler.command = /^(listonline)/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = true;
handler.private = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;

export default handler;
