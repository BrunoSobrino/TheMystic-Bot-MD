import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

const ALLOWED_DIMENSIONS = [
  [1024, 1024], [1152, 896], [1216, 832], [1344, 768], [1536, 640],
  [640, 1536], [768, 1344], [832, 1216], [896, 1152]
];

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
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

    // 2. Configurar máscara
    let maskBuffer;
    const maskPosition = text.match(/zona=(\d+),(\d+),(\d+),(\d+)/);
    
    if (maskPosition) {
      const [_, x, y, width, height] = maskPosition;
      text = text.replace(/zona=\d+,\d+,\d+,\d+/, '').trim();
      
      maskBuffer = await createMask(targetWidth, targetHeight, x, y, width, height);
    } else {
      // Máscara automática para el tercio superior
      maskBuffer = await createMask(targetWidth, targetHeight, 0, 0, targetWidth, Math.floor(targetHeight/3));
    }

    // 3. Configurar parámetros para la API
    const formData = new FormData();
    formData.append('init_image', resizedImage, 'image.png');
    formData.append('mask_image', maskBuffer, 'mask.png');
    formData.append('text_prompts[0][text]', `${text}, alta calidad, detallado`);
    formData.append('text_prompts[0][weight]', '1.3');
    
    // Parámetros optimizados para edición precisa
    const apiParams = {
      image_strength: 0.18,
      cfg_scale: 7,
      steps: 35,
      seed: Math.floor(Math.random() * 1000000),
      sampler: 'K_DPM_2_ANCESTRAL' // Mejor para detalles
    };

    Object.entries(apiParams).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // 4. Enviar a la API
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
        caption: `🎨 ${text}` 
      }, 
      { quoted: m }
    );

  } catch (e) {
    console.error('Error:', e);
    m.reply('*❌ Error al procesar. Intenta con otra descripción o imagen más clara.*');
  }
};

// Función auxiliar para crear máscaras
async function createMask(width, height, x, y, maskWidth, maskHeight) {
  return await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: Buffer.from(`<svg><rect x="${x}" y="${y}" width="${maskWidth}" height="${maskHeight}" fill="white"/></svg>`),
    top: 0,
    left: 0
  }])
  .png()
  .toBuffer();
}

// Función para dimensiones compatibles
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

handler.help = ['editai <descripción>', 'editai zona=x,y,ancho,alto <descripción>'];
handler.tags = ['ai'];
handler.command = /^editai|editar|iaedit$/i;
export default handler;
