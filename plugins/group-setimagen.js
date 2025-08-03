import Jimp from 'jimp';

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    if (!m.quoted || !quoted.mimetype?.includes('image')) throw '*⚠️️ Responde a una imagen para establecerla como foto del grupo.*';

    const mime = (quoted.msg || quoted).mimetype || '';
    const imageBuffer = await quoted.download();

    if (!m.isGroup) throw '*❗ Este comando solo puede usarse en grupos.*';

    const image = await Jimp.read(imageBuffer);
    const resized = image.getWidth() > image.getHeight() ? image.resize(720, Jimp.AUTO) : image.resize(Jimp.AUTO, 720);
    const jpegBuffer = await resized.getBufferAsync(Jimp.MIME_JPEG);

    await conn.updateProfilePicture(m.chat, jpegBuffer);

    await m.reply('✅ *Imagen de grupo actualizada con éxito.*');
  } catch (err) {
    console.error('❌ Error en setppgroup:', err);
    await m.reply(typeof err === 'string' ? err : '*❗ Ocurrió un error al cambiar la foto del grupo.*');
  }
};

handler.command = /^setimagen|setpp(gc|grup|group)$/i;
handler.help = ['setppgroup'];
handler.tags = ['group'];
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
export default handler;
