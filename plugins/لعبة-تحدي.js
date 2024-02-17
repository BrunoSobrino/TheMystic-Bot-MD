const timeout = 60000;
const poin = 500;
const poin_lose = -100;
const poin_bot = 200;
const handler = async (m, {conn, usedPrefix, text}) => {
  conn.suit = conn.suit ? conn.suit : {};
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) throw '*[❗] 𝚃𝙴𝚁𝙼𝙸𝙽𝙰 𝚃𝚄 𝙿𝙰𝚁𝚃𝙸𝙳𝙰 𝙰𝙽𝚃𝙴𝚂 𝙳𝙴 𝙸𝙽𝙲𝙸𝙰𝚁 𝙾𝚃𝚁𝙰*';
  const textquien = `*قم بمنشن الاعب الذي تريد ان تتحداه*\n\n*—◉ *بهذه الطريقه*\n${usedPrefix}تحدي @${global.suittag}`;
  if (!m.mentionedJid[0]) return m.reply(textquien, m.chat, {mentions: conn.parseMention(textquien)});
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.mentionedJid[0]))) throw `*[❗] 𝙻𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝙰 𝙻𝙰 𝚀𝚄𝙴 𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝙳𝙴𝚂𝙰𝙵𝙸𝙰𝚁 𝙰𝚄𝙽 𝙴𝚂𝚃𝙰 𝙹𝚄𝙶𝙰𝙽𝙳𝙾 𝙾𝚃𝚁𝙰 𝙿𝙰𝚁𝚃𝙸𝙳𝙰, 𝙴𝚂𝙿𝙴𝚁𝙰 𝙰 𝚀𝚄𝙴 𝚃𝙴𝚁𝙼𝙸𝙽𝙴 𝙳𝙴 𝙹𝚄𝙶𝙰𝚁`;
  const id = 'suit_' + new Date() * 1;
  const caption = `🎮 *لعبة حجر ورقه مقص* 🎮\n\n—◉ @${m.sender.split`@`[0]} لقد تحداك هذا الشخص في لعبه @${m.mentionedJid[0].split`@`[0]} هل تقبل التحدي\n◉ اكتب "نعم" للموافقه\n◉ اكتب "لا" للرفض\n`;
  const imgplaygame = `https://www.merca2.es/wp-content/uploads/2020/05/Piedra-papel-o-tijera-0003318_1584-825x259.jpeg`;
  conn.suit[id] = {
    chat: await conn.sendMessage(m.chat, {text: caption}, {mentions: await conn.parseMention(caption)}),
    id: id,
    p: m.sender,
    p2: m.mentionedJid[0],
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, `[ ⏳ ] لقد تأخر الاعب الاخر اعد المحاوله عندما يكون متاحا`, m);

      delete conn.suit[id];
    }, timeout), poin, poin_lose, poin_bot, timeout,
  };
};
handler.command = /^تحدي|suit(pvp)?$/i;
handler.group = true;
handler.game = true;
export default handler;