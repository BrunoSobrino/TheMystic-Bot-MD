import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

// Dimensiones exactas permitidas por la API
const ALLOWED_DIMENSIONS = [
  [1024, 1024], [1152, 896], [1216, 832], [1344, 768], [1536, 640],
  [640, 1536], [768, 1344], [832, 1216], [896, 1152]
];

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen válida (JPEG/PNG/WEBP)*');
  }

  try {
    // 1. Descargar la imagen y obtener metadata
    const imgBuffer = await q.download();
    const metadata = await sharp(imgBuffer).metadata();
    
    // 2. Encontrar la dimensión compatible más cercana
    const findClosestDimensions = (width, height) => {
      let closest = ALLOWED_DIMENSIONS[0];
      let minDiff = Infinity;
      
      for (const [w, h] of ALLOWED_DIMENSIONS) {
        const ratioDiff = Math.abs((width/height) - (w/h));
        if (ratioDiff < minDiff) {
          minDiff = ratioDiff;
          closest = [w, h];
        }
      }
      
      return closest;
    };
    
    const [targetWidth, targetHeight] = findClosestDimensions(metadata.width, metadata.height);
    console.log(`Redimensionando de ${metadata.width}x${metadata.height} a ${targetWidth}x${targetHeight}`);

    // 3. Redimensionar manteniendo relación de aspecto
    const resizedBuffer = await sharp(imgBuffer)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'cover', // Asegura que cubra completamente el área
        position: 'centre',
        withoutEnlargement: false // Permite aumentar tamaño si es necesario
      })
      .toFormat('png')
      .toBuffer();

    // 4. Crear FormData
    const formData = new FormData();
    formData.append('init_image', resizedBuffer, 'input.png');
    formData.append('text_prompts[0][text]', text || "Mejora esta imagen");
    formData.append('text_prompts[0][weight]', '1');
    formData.append('image_strength', '0.35');
    
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

    // 6. Enviar resultado
    await conn.sendMessage(
      m.chat, 
      { 
        image: response.data,
        caption: `🎨 Imagen editada (${targetWidth}x${targetHeight})`
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
