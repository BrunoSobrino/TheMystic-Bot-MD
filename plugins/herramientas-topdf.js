import uploadImage from '../lib/uploadImage.js';


const handler = async (m, {conn, text, usedPrefix, command, isOwner}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_topdf

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
