import fs from 'fs';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_saveimage
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

let handler = async (m, { text }) => {
  if (!text) throw tradutor.texto1;
  if (!m.quoted || !m.quoted.fileSha256) throw tradutor.texto2;
  let media = await m.quoted.download();
  /*o donde quieras guardar las imágenes*/
  const path = `src/${text}`;
  await fs.writeFileSync(path, media);
  m.reply(`Imagen guardada como ${path}`);
};

handler.help = ['saveimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(saveimage|sp)$/i;
handler.owner = true;

export default handler;
