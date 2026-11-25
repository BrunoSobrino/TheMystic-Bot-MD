import fs from 'fs';
import { img2img } from '../src/libraries/nanobanana.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.ia_nanobanana
  
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) throw tradutor.texto1;
  if (!text) throw tradutor.texto2;

  const data = await q.download?.();

  try {
    const resultBuffer = await img2img(data, text);

    console.log(resultBuffer)

    await conn.sendMessage(m.chat, { image: resultBuffer, caption: tradutor.texto3 }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw tradutor.texto4;
  }
};

handler.help = ['nanobanana <prompt>'];
handler.tags = ['ai', 'converter'];
handler.command = ['nanobanana'];
export default handler;
