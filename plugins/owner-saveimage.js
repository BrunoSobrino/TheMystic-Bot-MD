import fs from 'fs';

let handler = async (m, { text }) => {
  if (!text) throw `Ingrese un nombre para su archivo de imagen y la extensión deseada (por ejemplo, nombre.png, nombre.jpg, etc.)`;
  if (!m.quoted || !m.quoted.fileSha256) throw `Responde a la imagen que deseas guardar..`;
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
