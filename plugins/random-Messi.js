import axios from 'axios';
import fs from 'fs';
const handler = async (m, {conn, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.random_messi
  const res = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/Messi.json`)).data;
  const url = await res[Math.floor(res.length * Math.random())];
  conn.sendFile(m.chat, url, 'error.jpg', tradutor.texto1, m);
};
// conn.sendButton(m.chat, "*Messi*", author, url, [['⚽ SIGUIENTE ⚽', `${usedPrefix + command}`]], m)}
handler.help = ['messi'];
handler.tags = ['internet'];
handler.command = /^(messi)$/i;
export default handler;
