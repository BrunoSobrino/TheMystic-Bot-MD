import uploadImage from '../src/libraries/uploadImage.js';
import {sticker} from '../src/libraries/sticker.js';
import MessageType from "baileys";


const effects = ['greyscale', 'invert', 'brightness', 'threshold', 'sepia', 'red', 'green', 'blue', 'blurple', 'pixelate', 'blur'];

const handler = async (m, {conn, usedPrefix, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.sticker_stickerfilter

  const effect = text.trim().toLowerCase();
  if (!effects.includes(effect)) {
    throw `
${tradutor.texto1[0]}
${tradutor.texto1[1]} ${usedPrefix}stickerfilter ${tradutor.texto1[2]} 
${tradutor.texto1[3]}
${tradutor.texto1[4]} ${usedPrefix}stickerfilter greyscale
${tradutor.texto1[5]}
${effects.map((effect) => `_> ${effect}_`).join('\n')}
`.trim();
  }
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw tradutor.texto2;
  if (!/image\/(jpe?g|png)/.test(mime)) throw tradutor.texto3;
  const img = await q.download();
  const url = await uploadImage(img);
  const apiUrl = global.API('https://some-random-api.com/canvas/', encodeURIComponent(effect), {
    avatar: url,
  });
  try {
    const stiker = await sticker(null, apiUrl, global.packname, global.author);
    conn.sendFile(m.chat, stiker, null, {asSticker: true});
  } catch (e) {
    m.reply(tradutor.texto4);
    await conn.sendFile(m.chat, apiUrl, 'image.png', null, m);
  }
};
handler.help = ['stickfilter (caption|reply media)'];
handler.tags = ['General'];
handler.command = /^(stickerfilter|stikerfilter|cs2)$/i;
export default handler;
