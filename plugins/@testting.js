import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp'; // Para redimensionar imágenes

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen válida (JPEG/PNG/WEBP)*');
  }

  try {
    // 1. Descargar la imagen
    const imgBuffer = await q.download();
    
    // 2. Redimensionar la imagen a dimensiones compatibles
    const resizedBuffer = await sharp(imgBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside', // Mantiene la relación de aspecto
        withoutEnlargement: true // No agranda imágenes pequeñas
      })
      .toBuffer();
    
    // 3. Verificar dimensiones finales
    const metadata = await sharp(resizedBuffer).metadata();
    console.log(`Imagen redimensionada a: ${metadata.width}x${metadata.height}`);

    // 4. Crear FormData con parámetros correctos
    const formData = new FormData();
    formData.append('init_image', resizedBuffer, 'input.png');
    formData.append('text_prompts[0][text]', text || "Mejora esta imagen");
    formData.append('text_prompts[0][weight]', '1');
    formData.append('image_strength', '0.35');
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('steps', '30');
    
    // 5. Enviar a la API
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      formData,
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: 'image/png',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    // 6. Enviar la imagen resultante
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
    if (e.response) {
      try {
        const errorData = JSON.parse(Buffer.from(e.response.data).toString());
        errorMessage += `\nCódigo: ${e.response.status}\nMensaje: ${errorData.message || errorData.name || 'Error de API'}`;
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
