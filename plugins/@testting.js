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
    // 1. Descargar la imagen
    const imgBuffer = await q.download();
    
    // 2. Crear FormData para la solicitud inicial
    const formData = new FormData();
    formData.append('image', imgBuffer, 'image.jpg');
    formData.append('prompt', text || "Añade algo creativo a la imagen");
    formData.append('output_format', 'png');

    // 3. Iniciar la generación
    const initResponse = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/edit',
      formData,
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          ...formData.getHeaders()
        }
      }
    );

    const generationId = initResponse.data.id;
    console.log('ID de generación:', generationId);

    // 4. Consultar el resultado (con reintentos)
    let resultResponse;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 5000; // 5 segundos entre intentos

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay));

      resultResponse = await axios.get(
        `https://api.stability.ai/v2beta/results/${generationId}`,
        {
          headers: { 
            Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
            Accept: 'image/*'
          },
          responseType: 'arraybuffer',
          validateStatus: (status) => status === 200 || status === 202
        }
      );

      if (resultResponse.status === 200) {
        break;
      } else if (resultResponse.status === 202) {
        console.log(`Generación en progreso (intento ${attempts})`);
      } else {
        throw new Error(`Estado inesperado: ${resultResponse.status}`);
      }
    }

    // 5. Verificar si se obtuvo el resultado
    if (resultResponse.status === 200) {
      await conn.sendMessage(
        m.chat, 
        { 
          image: resultResponse.data, 
          caption: '✅ Imagen editada con IA' 
        }, 
        { quoted: m }
      );
    } else {
      throw new Error('La generación tardó demasiado tiempo');
    }

  } catch (e) {
    console.error('Error completo:', e);
    let errorMessage = '❌ Error al procesar la imagen';
    
    if (e.response) {
      const errorData = e.response.data instanceof Buffer 
        ? JSON.parse(e.response.data.toString()) 
        : e.response.data;
      errorMessage += `\nCódigo: ${e.response.status}\nMensaje: ${errorData.message || 'Sin detalles'}`;
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
