import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_viewimage
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


let handler = async (m, { text }) => {
  if (!text) throw tradutor.texto1;
  let ext = text.split('.').pop();
  let path = `${text}`;
  if (!fs.existsSync(path)) throw tradutor.texto2;
  let media = await fs.readFileSync(path);
  let mimeType = `image/${ext}`;
  m.reply(media, null, { thumbnail: await (await fetch(`data:${mimeType};base64,${media.toString('base64')}`)).buffer() });
};

handler.help = ['viewimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(viewimage|vi)$/i;
handler.owner = true;

export default handler;
