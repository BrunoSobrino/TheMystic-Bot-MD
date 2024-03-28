


let handler = async (m, { text }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.owner_viewimage
  s
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
