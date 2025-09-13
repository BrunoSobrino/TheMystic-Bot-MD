import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener ruta absoluta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importación con ruta absoluta
const { nanoBanana } = await import(path.join(__dirname, '../src/libraries/nanobanana.js'));

const handler = async (m, { conn, text }) => {
  try {
    console.log('🚀 Comando nanobanana ejecutado');
    console.log('📝 Texto recibido:', text);
    
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/image/g.test(mime)) throw '❌ Debes responder a una imagen';
    if (!text) throw '⚠️ Escribe un prompt/descripción para la edición';

    m.reply('⏳ Procesando tu imagen, espera un momento...');

    const buffer = await q.download?.();
    if (!buffer) throw '❌ No se pudo descargar la imagen.';

    // Crear directorio tmp si no existe
    const tmpDir = path.join(__dirname, '../src/tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpPath = path.join(tmpDir, `${Date.now()}.jpg`);
    fs.writeFileSync(tmpPath, buffer);

    console.log('📁 Imagen guardada en:', tmpPath);

    await nanoBanana.initSession();
    const { uploadUrl, publicUrl, file } = await nanoBanana.getUploadUrl(tmpPath, path.basename(tmpPath));
    await nanoBanana.uploadFile(uploadUrl, file);

    const task = await nanoBanana.generateImage(text, 'realistic', publicUrl);
    const result = await nanoBanana.waitForResult(task.taskId);

    if (!result.images?.[0]?.url) throw '⚠️ No se encontró la URL de la imagen generada';

    await conn.sendMessage(m.chat, { 
      image: { url: result.images[0].url }, 
      caption: 'Aquí tienes tu imagen 🖼️' 
    }, { quoted: m });

    console.log('✅ Imagen generada exitosamente');

  } catch (e) {
    console.error('❌ Error en nanobanana handler:', e);
    throw typeof e === 'string' ? e : '❌ Error al generar la imagen con NanoBanana';
  } finally {
    // Limpiar archivo temporal si existe
    const tmpPath = path.join(__dirname, '../src/tmp', `${Date.now()}.jpg`);
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  }
};

handler.help = ['nanobanana <prompt>'];
handler.tags = ['ai', 'converter'];
handler.command = ['nanobanana'];

export default handler;
