import axios from 'axios';
import FormData from 'form-data';

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen válida (JPEG/PNG/WEBP)*');
  }

  try {
    // 1. Descargar la imagen
    const imgBuffer = await q.download();
    
    // 2. Crear FormData para la API
    const formData = new FormData();
    formData.append('init_image', imgBuffer, 'input.png');
    formData.append('image_strength', '0.35');
    formData.append('prompt', text || "Mejora esta imagen");
    formData.append('output_format', 'png');
    
    // 3. Enviar a la API de Stability AI
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
        timeout: 60000
      }
    );

    // 4. Enviar la imagen resultante
    await conn.sendMessage(
      m.chat, 
      { 
        image: response.data,
        caption: '🎨 Imagen editada con IA'
      }, 
      { quoted: m }
    );

  } catch (e) {
    console.error('Error:', e);
    
    let errorMessage = '❌ Error al procesar la imagen';
    if (e.response && e.response.data) {
      try {
        // CORRECCIÓN: Paréntesis correctamente cerrados
        const errorData = JSON.parse(Buffer.from(e.response.data).toString()).message;
        errorMessage += `\nCódigo: ${e.response.status}\nMensaje: ${errorData || 'Sin detalles'}`;
      } catch (parseError) {
        errorMessage += `\nCódigo: ${e.response.status}\nRespuesta no JSON: ${Buffer.from(e.response.data).toString('utf8').substring(0, 100)}`;
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
