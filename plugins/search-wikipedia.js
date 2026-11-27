import axios from 'axios';
import cheerio from 'cheerio';

async function wikipedia(query) {
  const link = await axios.get(`https://es.wikipedia.org/wiki/${query}`);
  const $ = cheerio.load(link.data);
  const judul = $('#firstHeading').text().trim();
  const thumb = $('#mw-content-text').find('div.mw-parser-output > div:nth-child(1) > table > tbody > tr:nth-child(2) > td > a > img').attr('src') || `//i.ibb.co/nzqPBpC/http-error-404-not-found.png`;
  const isi = [];
  $('#mw-content-text > div.mw-parser-output').each(function(rayy, Ra) {
    const penjelasan = $(Ra).find('p').text().trim();
    if (penjelasan) isi.push(penjelasan);
  });
  if (!isi.length) throw new Error('No se encontró información');
  return {
    status: link.status,
    result: {
      judul: judul,
      thumb: 'https:' + thumb,
      isi: isi[0]}};
}
const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.buscador_wikipedia
  if (!text) throw `*${tradutor.texto1[0]} *${usedPrefix + command} ${tradutor.texto1[1]} *${usedPrefix + command} Estrellas*`;
  try {
    const res = await wikipedia(`${text}`);
    m.reply(`*${tradutor.texto2}*\n\n` + res.result.isi);
  } catch (e) {
    m.reply(`*${tradutor.texto3}*`);
  }
};
handler.help = ['wikipedia'].map((v) => v + ' <apa>');
handler.tags = ['internet'];
handler.command = /^(wiki|wikipedia)$/i;
export default handler;
