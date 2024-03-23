import {webp2mp4} from '../lib/webp2mp4.js';
import {ffmpeg} from '../lib/converter.js';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.convertidor_tovideo
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.



const handler = async (m, {conn, usedPrefix, command}) => {
  if (!m.quoted) throw `*${tradutor.texto1} ${usedPrefix + command}*`;
  const mime = m.quoted.mimetype || '';
  if (!/webp/.test(mime)) throw `*${tradutor.texto2} ${usedPrefix + command}*`;
  const media = await m.quoted.download();
  let out = Buffer.alloc(0);
  if (/webp/.test(mime)) {
    out = await webp2mp4(media);
  } else if (/audio/.test(mime)) {
    out = await ffmpeg(media, [
      '-filter_complex', 'color',
      '-pix_fmt', 'yuv420p',
      '-crf', '51',
      '-c:a', 'copy',
      '-shortest',
    ], 'mp3', 'mp4');
  }
  await conn.sendFile(m.chat, out, 'error.mp4', '*DONE*', m, 0, {thumbnail: out});
};
handler.help = ['tovideo'];
handler.tags = ['sticker'];
handler.command = ['tovideo', 'tomp4', 'mp4', 'togif'];
export default handler;
