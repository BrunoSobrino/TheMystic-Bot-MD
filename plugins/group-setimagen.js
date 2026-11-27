import fs from 'fs';
import { Jimp, JimpMime } from 'jimp';

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.group_setimagen
  try {
    const quoted = m.quoted ? m.quoted : m;
    if (!m.quoted || !quoted.mimetype?.includes('image')) throw tradutor.texto1;

    const mime = (quoted.msg || quoted).mimetype || '';
    const imageBuffer = await quoted.download();

    if (!m.isGroup) throw tradutor.texto2;

    const image = await Jimp.fromBuffer(imageBuffer);
    const resized = image.width > image.height ? image.resize({ w: 720 }) : image.resize({ h: 720 });
    const jpegBuffer = await resized.getBuffer(JimpMime.jpeg);

    await conn.updateProfilePicture(m.chat, jpegBuffer);

    await m.reply(tradutor.texto3);
  } catch (err) {
    console.error('❌ Error en setppgroup:', err);
    await m.reply(typeof err === 'string' ? err : tradutor.texto4);
  }
};

handler.command = /^(setimagen|setpp(gc|grup|group))$/i;
handler.help = ['setppgroup'];
handler.tags = ['group'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
export default handler;
