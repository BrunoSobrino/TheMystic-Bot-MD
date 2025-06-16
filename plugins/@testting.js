import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

// Dimensiones exactas permitidas por la API
const ALLOWED_DIMENSIONS = [
  [1024, 1024], [1152, 896], [1216, 832], [1344, 768], [1536, 640],
  [640, 1536], [768, 1344], [832, 1216], [896, 1152]
];

// Función para encontrar dimensiones compatibles más cercanas
function findClosestDimensions(width, height) {
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
}

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  // Validar entrada
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Responde a una imagen (JPEG/PNG/WEBP)*');
  }

  if (!text) {
    return m.reply('*✏️ Ejemplo:* .editai "dragón en el cielo" o .editai zona=20,30,300,400 "sol"');
  }

  try {
    // 1. Procesar imagen base
    const imgBuffer = await q.download();
    const metadata = await sharp(imgBuffer).metadata();
    const [targetWidth, targetHeight] = findClosestDimensions(metadata.width, metadata.height);
    
    const resizedImage = await sharp(imgBuffer)
      .resize(targetWidth, targetHeight)
      .toFormat('png')
      .toBuffer();

    // 2. Configurar máscara (área a editar)
    let maskBuffer;
    const maskPosition = text.match(/zona=(\d+),(\d+),(\d+),(\d+)/);
    
    if (maskPosition) {
      // Máscara personalizada con coordenadas
      const [_, x, y, width, height] = maskPosition;
      text = text.replace(/zona=\d+,\d+,\d+,\d+/, '').trim();
      
      maskBuffer = await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([{
        input: Buffer.from(`<svg><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="white"/></svg>`),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();
    } else {
      // Máscara automática (cielo superior)
      maskBuffer = await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([{
        input: Buffer.from(`<svg><rect x="0" y="0" width="${targetWidth}" height="${Math.floor(targetHeight/3)}" fill="white"/></svg>`),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();
    }

    // 3. Configurar petición a la API
    const formData = new FormData();
    formData.append('init_image', resizedImage, 'image.png');
    formData.append('mask_image', maskBuffer, 'mask.png');
    formData.append('text_prompts[0][text]', `${text}, alta calidad, detallado, profesional`);
    formData.append('text_prompts[0][weight]', '1.5');
    formData.append('negative_prompt', 'borroso, distorsionado, malformado, baja calidad');
    formData.append('image_strength', '0.15');
    formData.append('cfg_scale', '10');
    formData.append('steps', '45');
    formData.append('seed', Math.floor(Math.random() * 1000000));

    // 4. Enviar a la API de Stability AI
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking',
      formData,
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: 'image/png',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 90000
      }
    );

    // 5. Enviar resultado
    await conn.sendMessage(
      m.chat, 
      { 
        image: response.data,
        caption: `🖌️ ${text}` 
      }, 
      { quoted: m }
    );

  } catch (e) {
    console.error('Error:', e);
    let errorMsg = '❌ Error al editar la imagen';
    
    if (e.response?.data) {
      try {
        const errorData = JSON.parse(Buffer.from(e.response.data).toString());
        errorMsg += `\n🔧 ${errorData.message || 'Detalles no disponibles'}`;
      } catch {
        errorMsg += `\n📛 Código: ${e.response.status}`;
      }
    } else {
      errorMsg += `\n⚠️ ${e.message}`;
    }
    
    m.reply(errorMsg);
  }
};

handler.help = ['editai <descripción>', 'editai zona=x,y,ancho,alto <descripción>'];
handler.tags = ['ai'];
handler.command = /^editai|editar|iaedit$/i;
export default handler;
