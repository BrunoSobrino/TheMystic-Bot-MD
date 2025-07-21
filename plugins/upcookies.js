import fs from 'fs';
import path from 'path';

let handler = async (m, { text }) => {
  if (!m.quoted || !m.quoted.fileSha256) throw 'Citar el Archivo a Subir';
  
  try {
    let media = await m.quoted.download();
    const filePath = `src/tmp/YTDLP/cookies.txt`;
    
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await fs.writeFileSync(filePath, media);
    m.reply(`Ok ${filePath}`);
    
  } catch (error) {
    console.error('UPKOOKIES PLUGIN Error Sub Archivo:', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['upcookie'];
handler.tags = ['tools'];
handler.command = /^(up)$/i;
handler.owner = true;

export default handler;
