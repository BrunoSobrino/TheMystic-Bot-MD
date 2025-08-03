// MR. De la Comunidad para la Comunidad. Prohibida su Venta.
// El Software se proporciona bajo los términos de la Licencia MIT, excepto que usted no puede:
// 1. Vender, revender o arrendar el Software.
// 2. Cobrar a otros por el acceso, la distribución o cualquier otro uso comercial del Software.
// 3. Usar el Software como parte de un producto comercial o una oferta de servicio.

// Aquien sabe que tan eficiente sea agregar tantos... El que encuentre una manera de mejorarlo bienvenido. Buscar la palabra en el directorio creeria es aun peor.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nvGlobalPath = path.join(__dirname, '../plugins/nv-global.js');

const mediaDirPath = path.join(__dirname, '../src/assets/audio');

const moveQuotedMedia = async (m, palabra, mediaType) => {
  try {
    const mediaBuffer = await m.quoted.download(); 
    const fileExtension = mediaType === 'audio' ? 'mp3' : 'mp4'; 
    const mediaFilePath = path.join(mediaDirPath, `${palabra}.${fileExtension}`);

    if (!fs.existsSync(mediaDirPath)) {
      await fs.promises.mkdir(mediaDirPath, { recursive: true });
    }

    await fs.promises.writeFile(mediaFilePath, mediaBuffer);
    console.log(`✅ ${mediaType === 'audio' ? 'Audio' : 'Video'} guardado ${mediaFilePath}`);

    return mediaFilePath; 
  } catch (error) {
    console.error(`❌ Error mv ${mediaType}: ${error.message}`);
    throw new Error(`Error moviendo ${mediaType}.`);
  }
};

const addMediaHandler = async (keyword, mediaFilePath, mediaType) => {
  try {
    let fileContent = await fs.promises.readFile(nvGlobalPath, 'utf-8');

    const closingBlock = `
  return !0;
};
export default handler;
`;

    if (fileContent.includes(`m.text.match(/(${keyword})/gi)`)) {
      throw new Error(`Existe "${keyword}" `);
    }

    const closingRegex = new RegExp(/^  return !0;\s*};\s*export default handler;$/gm);
    fileContent = fileContent.replace(closingRegex, '').trim();

    const newIfBlock = `
  if (!chat.isBanned && m.text.match(/(${keyword})/gi)) { 
    if (!db.data.chats[m.chat].audios) return;
    if (!db.data.settings[this.user.jid].audios_bot && !m.isGroup) return;
    const vn = './src/assets/audio/${keyword}.${mediaType === 'audio' ? 'mp3' : 'mp4'}'; 
    mconn.conn.sendPresenceUpdate('recording', m.chat);
    mconn.conn.sendMessage(m.chat, {${mediaType === 'audio' ? 'audio' : 'video'}: {url: vn}, fileName: '${keyword}.${mediaType === 'audio' ? 'mp3' : 'mp4'}', mimetype: '${mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4'}', ${mediaType === 'audio' ? 'ptt: true' : 'ptv: true'}}, {quoted: m});
  }
`;

    const newFileContent = fileContent + '\n' + newIfBlock + '\n' + closingBlock;

    await fs.promises.writeFile(nvGlobalPath, newFileContent, 'utf-8');

    console.log(`Agregado "${keyword}" ${mediaType}  ${mediaFilePath}`);

  } catch (error) {
    console.error(`error guardando ${error.message}`);
  }
};

const handler = async (m, { text }) => {
  if (!text) {
    return m.reply('❌ Ej: .addaudio hola');
  }

  const keyword = text.trim();

  try {
    let mediaType;

    if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('audio')) {
      mediaType = 'audio';
    } else if (m.quoted && m.quoted.mimetype && m.quoted.mimetype.startsWith('video')) {
      mediaType = 'video';
    } else {
      throw new Error('❌ Audio/Video.');
    }

    const mediaFilePath = await moveQuotedMedia(m, keyword, mediaType);

    await addMediaHandler(keyword, mediaFilePath, mediaType);

    m.reply(`✅ ${mediaType === 'audio' ? 'Audio' : 'Video'} "${keyword}" `);
  } catch (error) {
    m.reply(`❌ Error: ${error.message}`);
  }
};

handler.command = /^add(media|audio)$/i;
handler.help = ['addaudio <palabra>'];
handler.tags = ['tools'];
handler.owner = true;

export default handler;
