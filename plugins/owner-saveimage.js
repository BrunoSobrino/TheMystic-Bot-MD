import fs from 'fs';


const handler = async (m, {text}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.owner_saveimage;

  if (!text) throw tradutor.texto1;
  if (!m.quoted || !m.quoted.fileSha256) throw tradutor.texto2;
  const media = await m.quoted.download();
  /* o donde quieras guardar las imágenes*/
  const path = `src/${text}`;
  await fs.writeFileSync(path, media);
  m.reply(`Imagen guardada como ${path}`);
};

handler.help = ['saveimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(saveimage|sp)$/i;
handler.owner = true;

export default handler;
