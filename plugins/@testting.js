import axios from 'axios';
import uploadImage from '../src/libraries/uploadImage.js';

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen*');
  }

  try {
    const imgBuffer = await q.download();
    const imgBase64 = imgBuffer.toString('base64');
    
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-image/edit', 
      {
        image: imgBase64,
        prompt: text || "Añade algo creativo",
        model: "stable-diffusion-xl-1024-v1-0", 
        output_format: "png"
      },
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: "image/*"
        },
        responseType: 'arraybuffer'
      }
    );

    await conn.sendMessage(m.chat, { image: response.data,  caption: '🖌️ Imagen editada con IA' }, { quoted: m });

  } catch (e) {
    console.error('Error en Stability AI:', e.response?.data || e.message);
    m.reply('*❌ Error al procesar la imagen. Verifica el prompt o intenta con otra imagen*');
  }
};

handler.help = ['editai <texto>'];
handler.tags = ['ai'];
handler.command = /^editai|editarimagen|iaedit$/i;
export default handler;
