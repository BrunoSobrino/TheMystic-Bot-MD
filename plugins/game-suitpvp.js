const timeout = 60000;
const poin = 500;
const poin_lose = -100;
const poin_bot = 200;


const handler = async (m, { conn, usedPrefix, text }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_suitpvp

  conn.suit = conn.suit ? conn.suit : {};
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) throw tradutor.texto1;
  const textquien = `${tradutor.texto2}\n${usedPrefix}suit @${global.suittag}`;
  if (!m.mentionedJid[0]) return m.reply(textquien, m.chat, { mentions: conn.parseMention(textquien) });
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.mentionedJid[0]))) throw tradutor.texto4;
  const id = 'suit_' + new Date() * 1;
  const caption = `${tradutor.texto3[0]} @${m.sender.split`@`[0]} ${tradutor.texto3[1]} @${m.mentionedJid[0].split`@`[0]} ${tradutor.texto3[1]}`;
  const imgplaygame = `https://www.merca2.es/wp-content/uploads/2020/05/Piedra-papel-o-tijera-0003318_1584-825x259.jpeg`;
  conn.suit[id] = {
    chat: await conn.sendMessage(m.chat, { text: caption }, { mentions: await conn.parseMention(caption) }),
    id: id,
    p: m.sender,
    p2: m.mentionedJid[0],
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, tradutor.texto5, m);

      delete conn.suit[id];
    }, timeout), poin, poin_lose, poin_bot, timeout,
  };
};
handler.command = /^pvp|suit(pvp)?$/i;
handler.group = true;
handler.game = true;
export default handler;
