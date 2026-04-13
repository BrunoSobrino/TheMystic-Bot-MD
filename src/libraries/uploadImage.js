import { fileTypeFromBuffer } from 'file-type';

// ❌ Eliminamos las importaciones de 'node-fetch', 'form-data' o 'formdata-node'
// ✅ Usaremos el fetch y FormData nativos de Node.js 18+ que funcionan perfecto en Termux

/**
 * Upload file to Catbox (Primary) or Qu.ax (Fallback)
 * 100% Nativo para Termux / Node 18+
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
export default async (buffer) => {
  try {
    const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'jpg', mime: 'image/jpeg' };
    
    // Convertimos el Buffer a un Blob nativo (Evita que el archivo se corrompa en Termux)
    const blob = new Blob([buffer], { type: mime });

    // 1️⃣ PRIMER INTENTO: Catbox.moe
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', blob, `tmp.${ext}`);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
      // Con el FormData nativo NO necesitas inyectar los headers manualmente
    });
    
    if (!res.ok) throw new Error(`Catbox HTTP Error: ${res.status}`);
    
    const url = await res.text(); 
    if (url.startsWith('http')) return url.trim();
    
    throw new Error('Catbox no devolvió un enlace válido');

  } catch (error) {
    console.log('⚠️ [uploadImage] Catbox falló:', error.message);
    
    // 2️⃣ SEGUNDO INTENTO: Qu.ax (Muy amigable con Termux y estable)
    try {
      const form2 = new FormData();
      form2.append('files[]', blob, `tmp.${ext}`); 

      const res2 = await fetch('https://qu.ax/upload.php', {
        method: 'POST',
        body: form2,
      });
      
      const json2 = await res2.json();
      
      if (json2 && json2.success && json2.files && json2.files[0].url) {
        return json2.files[0].url;
      }
      
      throw new Error('Qu.ax no devolvió una respuesta exitosa');

    } catch (err2) {
      // Este log extra nos dirá en tu consola de Termux exactamente qué falló
      console.error('❌ [uploadImage] Error fatal en ambos servidores:', err2.message);
      throw 'Fallo general al subir la imagen a la nube.'; 
    }
  }
};

