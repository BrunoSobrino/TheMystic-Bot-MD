import axios from 'axios';
import uploadImage from '../src/libraries/uploadImage.js';

const handler = async (m, {conn, text}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime.match(/image\/(jpe?g|png|webp)/i)) {
    return m.reply('*⚠️ Por favor, responde o envía una imagen válida (JPEG/PNG/WEBP)*');
  }

  try {
    // 1. Descargar la imagen
    const imgBuffer = await q.download();
    
    // 2. Convertir a base64
    const imgBase64 = imgBuffer.toString('base64');
    
    // 3. Editar con Stability AI
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/edit',
      {
        image: imgBase64,
        prompt: text || "Mejora esta imagen", // Prompt por defecto
        output_format: 'png'
      },
      {
        headers: { 
          Authorization: 'Bearer sk-E7i5FjEOysKtRgXy3yljzchSmaqJnVW4q2grQS4PAUB4clGv',
          Accept: 'application/json' // Aceptamos JSON para manejar errores
        },
        responseType: 'arraybuffer'
      }
    );

    // 4. Verificar si la respuesta es una imagen o un error
    if (response.headers['content-type'].startsWith('image/')) {
      await conn.sendMessage(
        m.chat, 
        { 
          image: response.data,
          caption: '🎨 Imagen editada con IA'
        }, 
        { quoted: m }
      );
    } else {
      // Intentar parsear el error
      const errorData = JSON.parse(response.data.toString());
      console.error('Error de API:', errorData);
      m.reply(`*❌ Error en Stability AI:* ${errorData.message || 'Error desconocido'}`);
    }

  } catch (e) {
    console.error('Error completo:', e);
    
    // Manejo especial para errores de Axios
    if (e.response) {
      const errorData = e.response.data instanceof Buffer 
        ? JSON.parse(e.response.data.toString()) 
        : e.response.data;
      
      let errorMessage = errorData.message || 'Error desconocido de la API';
      
      // Errores comunes específicos
      if (e.response.status === 402) {
        errorMessage = 'Créditos insuficientes en tu cuenta de Stability AI';
      } else if (e.response.status === 404) {
        errorMessage = 'Endpoint no encontrado. ¿La API ha cambiado?';
      }
      
      m.reply(`*❌ Error ${e.response.status}:* ${errorMessage}`);
    } else {
      m.reply('*⚠️ Ocurrió un error al procesar la imagen*');
    }
  }
};

handler.help = ['editai <texto>'];
handler.tags = ['ai'];
handler.command = /^editai|editarimagen|iaedit$/i;
export default handler;
