import gplay from "google-play-scraper";
import _translate from "./_translate.js"
const tradutor = _translate.plugins.buscador_playstore
 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

  

let handler = async (m, { conn, text }) => {
  if (!text) throw `*${tradutor.texto1}*`;
  let res = await gplay.search({ term: text });
  if (!res.length) throw `*${tradutor.texto2}*`;
  let opt = {
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
      ${tradutor.texto3[4]}${v.url}`
  ).join`\n\n`;
  m.reply(res, null, opt);
};
handler.help = ['playstore <aplicacion>'];
handler.tags = ['internet'];
handler.command = /^(playstore)$/i;
export default handler;
