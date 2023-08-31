
let handler = async (m, { text }) => {
  if (!text) throw `Ingrese el nombre y la carpeta de la imagen que desea ver.`;
  let ext = text.split('.').pop();
  let path = `${text}`;
  if (!fs.existsSync(path)) throw `La imagen no existe en la carpeta raíz.`;
  let media = await fs.readFileSync(path);
  let mimeType = `image/${ext}`;
  m.reply(media, null, { thumbnail: await (await fetch(`data:${mimeType};base64,${media.toString('base64')}`)).buffer() });
};

handler.help = ['viewimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(viewimage|vi)$/i;
handler.owner = true;

export default handler;
