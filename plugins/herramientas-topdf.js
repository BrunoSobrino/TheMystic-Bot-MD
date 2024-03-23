import uploadImage from '../lib/uploadImage.js';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_topdf
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, usedPrefix, command, isOwner}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw tradutor.texto1;
  const img = await q.download?.();
  const url = await uploadImage(img);
  const docname = text ? text : m.pushName || 'documento';
  conn.sendFile(m.chat, `http://api.lolhuman.xyz/api/convert/imgtopdf?apikey=${lolkeysapi}&img=${url}`, docname + '.pdf', '', m, false, {asDocument: true});
};
handler.command = /^topdf$/i;
export default handler;
