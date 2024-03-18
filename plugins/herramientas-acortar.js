import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_acortar

const handler = async (m, {conn, args, text}) => {
  if (!text) throw tradutor.texto1;
  const shortUrl1 = await (await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`)).text();
  if (!shortUrl1) throw tradutor.texto2;
  const done = `${tradutor.texto3[0]}\n${text}\n${tradutor.texto3[1]}\n${shortUrl1}`.trim();
  m.reply(done);
};
handler.help = ['tinyurl', 'acortar'].map((v) => v + ' <link>');
handler.tags = ['tools'];
handler.command = /^(tinyurl|short|acortar|corto)$/i;
handler.fail = null;
export default handler;
