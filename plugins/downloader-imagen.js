const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_imagen;

  if (!text) {
    return m.reply(`${tradutor.texto1} ${usedPrefix + command} Minecraft*`);
  }

  // /search/gimage de Delirius devuelve 500 en su servidor; se usa /search/bingimage
  const api = await axios.get(`${global.BASE_API_DELIRIUS}/search/bingimage?query=${encodeURIComponent(text)}`);
  const data = api.data.data || [];
  const filteredData = data.filter(image => {
    const url = (image.direct || image.thumbnail || '').toLowerCase().split('?')[0];
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png');
  });
  const lista = filteredData.length ? filteredData : data.filter(i => i.direct || i.thumbnail);

  const random = Math.floor(Math.random() * lista.length);
  const image = lista[random];

  conn.sendFile(m.chat, image.direct || image.thumbnail, 'error.jpg', `${tradutor.texto2[0]} ${text}\n${tradutor.texto2[1]} ${image.source || ''}\n${tradutor.texto2[2]}`, m);
};

handler.help = ['image'];
handler.tags = ['internet', 'tools'];
handler.command = ['imagen', 'gimage', 'image'];

export default handler;