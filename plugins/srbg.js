import uploadImage from '../lib/uploadImage.js';
import {sticker} from '../lib/sticker.js';
const handler = async (m, {conn, text}) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const img = await q.download();
    const url = await uploadImage(img);
    const sremovebg = global.API(`https://api.lolhuman.xyz/api/removebg?apikey=Gatadios&img=${url}`);
    const stickerr = await sticker(false, sremovebg, global.packname, global.author);
    conn.sendFile(m.chat, stickerr, 'sticker.webp', '', m, {asSticker: true});
  } catch (e) {
    m.reply('هذا الامر خاص بحذف خلفية اي صورة وجعلها ملصق شفاف \nقم بالاشارة لصورة ما ثم اكتب هكذا \n\n*.srbg*');
  }
};
handler.help = ["srbg"]
handler.tags = ["sticker"]
handler.command = /^(srbg)$/i
export default handler;
