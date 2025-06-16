import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen válida (JPEG/PNG/WEBP)*');
  }

  try {
    // 1. Descargar la imagen
    const imgBuffer = await q.download();
    
    // 2. Crear FormData para la nueva API v1
    const formData = new FormData();
    formData.append('init_image', imgBuffer, 'input_image.png');
    formData.append('image_strength', '0.35'); // Controla cuánto se modifica la imagen original (0-1)
    formData.append('prompt', text || "Añade algo creativo a la imagen");
    formData.append('output_format', 'png');
    
    // 3. Enviar a la API v1
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      formData,
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: 'image/*',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000 // 60 segundos de timeout
      }
    );

    // 4. Enviar la imagen resultante
    if (response.status === 200) {
      await conn.sendMessage(
        m.chat, 
        { 
          image: response.data,
          caption: '🎨 Imagen editada con IA'
        }, 
        { quoted: m }
      );
    } else {
      throw new Error(`Estado inesperado: ${response.status}`);
    }

  } catch (e) {
    console.error('Error completo:', e);
    
    let errorMessage = '❌ Error al procesar la imagen';
    if (e.response) {
      try {
        const errorData = JSON.parse(Buffer.from(e.response.data).message;
        errorMessage += `\nCódigo: ${e.response.status}\nMensaje: ${errorData || 'Sin detalles'}`;
      } catch {
        errorMessage += `\nCódigo: ${e.response.status}`;
      }
    } else {
      errorMessage += `\n${e.message}`;
    }
    
    m.reply(errorMessage);
  }
};

handler.help = ['editai <texto>'];
handler.tags = ['ai'];
handler.command = /^editai|editarimagen|iaedit$/i;
export default handler;
