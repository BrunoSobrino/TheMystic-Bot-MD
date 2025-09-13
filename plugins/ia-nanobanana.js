import fs from 'fs';
import path from 'path';
import { nanoBanana } from '../src/libraries/nanobanana.js';

const handler = async (m, { conn, text }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';

  if (!/image/g.test(mime)) throw '❌ Debes responder a una imagen';
  if (!text) throw '⚠️ Escribe un prompt/descripción para la edición';

  m.reply('⏳ Procesando tu imagen, espera un momento...');

  const buffer = await q.download?.();
  if (!buffer) throw '❌ No se pudo descargar la imagen.';

  const tmpPath = path.join('../src/tmp', `${Date.now()}.jpg`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    await nanoBanana.initSession();
    const { uploadUrl, publicUrl, file } = await nanoBanana.getUploadUrl(tmpPath, path.basename(tmpPath));
    await nanoBanana.uploadFile(uploadUrl, file);

    const task = await nanoBanana.generateImage(text, 'realistic', publicUrl);
    const result = await nanoBanana.waitForResult(task.taskId);

    if (!result.images?.[0]?.url) throw '⚠️ No se encontró la URL de la imagen generada';

    await conn.sendMessage(m.chat, { image: { url: result.images[0].url }, caption: 'Aquí tienes tu imagen 🖼️' }, { quoted: m });
  } catch (e) {
    console.error(e);
    throw '❌ Error al generar la imagen con NanoBanana';
  } finally {
    fs.unlinkSync(tmpPath);
  }
};

handler.help = ['nanobanana <prompt>'];
handler.tags = ['ai', 'converter'];
handler.command = ['nanobanana'];

export default handler;
