import uploadImage from '../lib/uploadImage.js';
import {sticker} from '../lib/sticker.js';
import MessageType from '@whiskeysockets/baileys';

const effects = ['jail', 'gay', 'glass', 'wasted', 'triggered', 'lolice', 'simpcard', 'horny'];

const handler = async (m, {conn, usedPrefix, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.sticker_stickermarker

  const effect = text.trim().toLowerCase();
  if (!effects.includes(effect)) {
    throw `
${tradutor.texto1[0]}
${tradutor.texto1[1]} ${usedPrefix}stickermaker ${tradutor.texto1[2]} 
${tradutor.texto1[3]}
${tradutor.texto1[4]} ${usedPrefix}stickermaker jail
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
handler.help = ['stickmaker (caption|reply media)'];
handler.tags = ['General'];
handler.command = /^(stickmaker|stickermaker|stickermarker|cs)$/i;
export default handler;
