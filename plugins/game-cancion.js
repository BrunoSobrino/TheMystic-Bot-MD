import fetch from 'node-fetch';
import axios from 'axios';

const timeout = 60000;
const poin = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_cancion

  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {};
  const id = m.chat;
  if (id in conn.tebaklagu) {
    conn.reply(m.chat, tradutor.texto1, conn.tebaklagu[id][0]);
    throw false;
  }
  
  const res = await fetchJson(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/tebaklagu.json`);
  const json = res[Math.floor(Math.random() * res.length)];
  
  const caption = `
${tradutor.texto4[0]}

${tradutor.texto4[1]} ${(timeout / 1000).toFixed(2)} ${tradutor.texto4[2]}
${tradutor.texto4[3]} *${usedPrefix}pista* ${tradutor.texto4[4]}
${tradutor.texto4[5]} ${poin} ${tradutor.texto4[6]}

${tradutor.texto4[7]}

${tradutor.texto4[8]}`.trim();

  conn.tebaklagu[id] = [
    await m.reply(caption),
    json, poin,
    setTimeout(() => {
      if (conn.tebaklagu[id]) conn.reply(m.chat, `${tradutor.texto5[0]}\n\n${tradutor.texto5[1]} *${json.jawaban}*`, conn.tebaklagu[id][0]);
      delete conn.tebaklagu[id];
    }, timeout),
  ];
  
  const aa = await conn.sendMessage(m.chat, {audio: {url: json.link_song}, fileName: `error.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
  if (!aa) return conn.sendFile(m.chat, json.link_song, 'coba-lagi.mp3', '', m);
};

handler.help = ['tebaklagu'];
handler.tags = ['game'];
handler.command = /^(cancion|canción)$/i;
export default handler;

async function fetchJson(url, options) {
  try {
    options ? options : {};
    const res = await axios({
      method: 'GET', 
      url: url, 
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'}, 
      ...options
    });
    return res.data;
  } catch (err) {
    return err;
  }
}
