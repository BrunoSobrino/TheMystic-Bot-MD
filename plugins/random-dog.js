import fetch from 'node-fetch';
import fs from 'fs';
const handler = async (m, {conn, text}) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.random_dog
  try {
    const res = await fetch('https://api.thedogapi.com/v1/images/search');
    const img = await res.json();
    const caption = tradutor.texto1;
    conn.sendFile(m.chat, img[0].url, 'dog.jpg', caption, m);
  } catch {
    throw tradutor.texto2;
  }
};
handler.help = ['dog'];
handler.tags = ['random'];
handler.command = /^dog$/i;
handler.fail = null;
export default handler;
