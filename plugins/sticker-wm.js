import {addExif} from '../src/libraries/sticker.js';

const handler = async (m, {conn, text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.sticker_wm;

  if (!m.quoted) throw tradutor.texto1;
  
  // Debug completo del objeto quoted
  console.log('=== DEBUG STICKER ===');
  console.log('m.quoted keys:', Object.keys(m.quoted));
  console.log('mtype:', m.quoted.mtype);
  console.log('mimetype:', m.quoted.mimetype);
  console.log('mediaType:', m.quoted.mediaType);
  console.log('hasDownload:', typeof m.quoted.download === 'function');
  console.log('message keys:', m.quoted.message ? Object.keys(m.quoted.message) : 'no message');
  console.log('====================');
  
  let stiker = false;
  try {
    let [packname, ...author] = text.split('|');
    author = (author || []).join('|');
    
    // Verificación más exhaustiva
    const isSticker = m.quoted.mtype === 'stickerMessage' || 
                     (m.quoted.mimetype && m.quoted.mimetype === 'image/webp') ||
                     m.quoted.mediaType === 'sticker' ||
                     (m.quoted.message && m.quoted.message.stickerMessage) ||
                     m.quoted.key?.remoteJid?.endsWith('@s.whatsapp.net');
    
    console.log('isSticker:', isSticker);
    
    if (!isSticker) {
      throw tradutor.texto2;
    }
    
    // Verificar si el mensaje tiene los datos necesarios para descargar
    if (!m.quoted.download) {
      throw tradutor.texto3;
    }
    
    console.log('Descargando sticker...', {
      mimetype: m.quoted.mimetype,
      mediaType: m.quoted.mediaType,
      mtype: m.quoted.mtype
    });
    
    const img = await m.quoted.download();
    if (!img) throw tradutor.texto3;
    
    // Verificar que el buffer descargado sea válido
    if (!Buffer.isBuffer(img) || img.length === 0) {
      throw tradutor.texto3;
    }
    
    console.log('Buffer descargado correctamente, tamaño:', img.length);
    
    // Intentar crear el sticker con manejo de error específico para packId
    try {
      stiker = await addExif(img, packname || global.packname, author || global.author);
    } catch (exifError) {
      console.log('Error en addExif:', exifError.message);
      // Si el error es por packId, intentar con un objeto de metadatos más completo
      if (exifError.message.includes('packId') || exifError.message.includes('Cannot read properties')) {
        console.log('Intentando con metadatos alternativos...');
        const metadata = {
          packname: packname || global.packname || 'Bot',
          author: author || global.author || 'TheMystic',
          packId: '',
          packPublisher: '',
          packEmail: '',
          packWebsite: '',
          androidPlayStoreLink: '',
          iOSAppStoreLink: ''
        };
        
        // Intentar importar la función addExif con diferentes parámetros
        stiker = await addExif(img, metadata.packname, metadata.author, metadata);
      } else {
        throw exifError;
      }
    }
    
  } catch (e) {
    console.error('Error en sticker-wm:', e);
    if (Buffer.isBuffer(e)) stiker = e;
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, {asSticker: true});
    } else {
      throw tradutor.texto3;
    }
  }
};

handler.help = ['wm <packname>|<author>'];
handler.tags = ['sticker'];
handler.command = /^take|robar|wm$/i;
export default handler;
