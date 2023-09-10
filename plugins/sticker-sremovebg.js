import uploadImage from '../lib/uploadImage.js';
import {sticker} from '../lib/sticker.js';
const handler = async (m, {conn, text}) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const img = await q.download();
    const url = await uploadImage(img);
    const sremovebg = global.API(`https://api.lolhuman.xyz/api/removebg?apikey=${lolkeysapi}&img=${url}`);
    const stickerr = await sticker(false, sremovebg, global.packname, global.author);
    conn.sendFile(m.chat, stickerr, 'sticker.webp', '', m, {asSticker: true});
  } catch (e) {
    m.reply('*[❗𝐈𝐍𝐅𝐎❗] 𝙻𝙾 𝚂𝙸𝙴𝙽𝚃𝙾, 𝙾𝙲𝚄𝚁𝚁𝙸𝙾 𝚄𝙽 𝙴𝚁𝚁𝙾𝚁, 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝚁𝙽𝚃𝙰𝚁𝙻𝙾, 𝙽𝙾 𝙾𝙻𝚅𝙸𝙳𝙴 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴𝚁 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝙻𝙰 𝙲𝚄𝙰𝙻 𝚂𝙴 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝚁𝙰 𝙴𝙽 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚂𝙸𝙽 𝙵𝙾𝙽𝙳𝙾*');
  }
};
handler.command = /^sremovebg|removebg$/i;
export default handler;
