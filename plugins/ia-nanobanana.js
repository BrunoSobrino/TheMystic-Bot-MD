import fs from 'fs';
import { img2img } from '../src/libraries/nanobanana.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) throw `*Debes responder a una imagen*`;
  if (!text) throw `*Escribe un prompt/descripción para la edición*`;

  const data = await q.download?.();

  try {
    const resultBuffer = await img2img(data, text);

    console.log(resultBuffer)

    await conn.sendMessage(m.chat, { image: resultBuffer, caption: 'Aquí tienes tu imagen 🖼️' }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw `*Error al procesar la imagen con NanoBanana*`;
  }
};

handler.help = ['nanobanana <prompt>'];
handler.tags = ['ai', 'converter'];
handler.command = ['nanobanana'];
export default handler;
