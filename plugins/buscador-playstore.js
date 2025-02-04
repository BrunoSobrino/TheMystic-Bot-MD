import gplay from 'google-play-scraper';

const handler = async (m, {conn, text}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.buscador_playstore;

  if (!text) throw `*${tradutor.texto1}*`;
  let res = await gplay.search({term: text});
  if (!res.length) throw `*${tradutor.texto2}*`;
  const opt = {
    contextInfo: {
      externalAdReply: {
        title: res[0].title,
        body: res[0].summary,
        thumbnail: (await conn.getFile(res[0].icon)).data,
        sourceUrl: res[0].url,
      },
    },
  };
  await console.log(res);
  res = res.map(
      (v) =>
        `${tradutor.texto3[0]} ${v.title}
      ${tradutor.texto3[1]} ${v.developer}
      ${tradutor.texto3[2]} ${v.priceText}
      ${tradutor.texto3[3]} ${v.scoreText}
      ${tradutor.texto3[4]}${v.url}`,
  ).join`\n\n`;
  m.reply(res, null, opt);
};
handler.help = ['playstore <aplicacion>'];
handler.tags = ['internet'];
handler.command = /^(playstore)$/i;
export default handler;
