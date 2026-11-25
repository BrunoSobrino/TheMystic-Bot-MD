import axios from 'axios';
import fs from 'fs';
const handler = async (m, {conn, args, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.random_itzy
  const res = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/itzy.json`)).data;
  const mystic = await res[Math.floor(res.length * Math.random())];
  conn.sendFile(m.chat, mystic, 'error.jpg', `${tradutor.texto1[0]}${command}${tradutor.texto1[1]}`, m);
};
// conn.sendButton(m.chat, `_${command}_`, author, mystic, [['🔄 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 🔄', `/${command}`]], m)}
handler.help = ['itzy', 'kpopitzy'];
handler.tags = ['internet'];
handler.command = /^(itzy|kpopitzy)$/i;
export default handler;
