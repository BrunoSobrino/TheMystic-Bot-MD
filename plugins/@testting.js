import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen*');
  }

  try {
    const imgBuffer = await q.download();
    const imgBase64 = imgBuffer.toString('base64');
    const payload = {
      prompt: text || "Añade algo creativo a la imagen", 
      image: imgBase64, 
      output_format: 'png'
    };

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/edit',
      payload,
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: 'image/*'
        },
        responseType: 'arraybuffer'
      }
    );

    if (response.status === 200) {
      await conn.sendMessage(m.chat, { image: response.data, caption: '✅ Imagen editada con IA' }, { quoted: m });
    } else {
      throw new Error(`API Error: ${response.status}`);
    }

  } catch (e) {
    console.error(e);
    m.reply('*❌ Error al procesar la imagen*');
  }
};

handler.help = ['editai <texto>'];
handler.tags = ['ai'];
handler.command = /^editai|editarimagen|iaedit$/i;
export default handler;
