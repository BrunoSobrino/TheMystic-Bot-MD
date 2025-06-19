/* Creado por Bruno Sobrino (https://github.com/BrunoSobrino) */
import fetch from 'node-fetch';
import axios from 'axios';

const handler = async (m, {text, usedPrefix, command, conn}) => {
 try {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.buscador_peliculas
  if (!text) throw `*${tradutor.texto1}*`;
  let aaaa;
  let img;
    aaaa = await searchC(text);
    const randomIndex = Math.floor(Math.random() * aaaa.length);
    try {
        img = 'https://wwv.cuevana8.com' + aaaa[randomIndex].image;
    } catch {
        img = 'https://www.poresto.net/u/fotografias/m/2023/7/5/f1280x720-305066_436741_5050.png';
    }    
  if (aaaa == '') throw `*${tradutor.texto2}*`;                                        /* https://wwv.cuevana8.com */
  const res = await aaaa.map((v) => `*${tradutor.texto3[0]}* ${v.title}\n*${tradutor.texto3[1]}* ${v.link}`).join`\n\n─────────────────\n\n`;
  const ads = `*${tradutor.texto3[2]}* ${tradutor.texto3[3]}\n*${tradutor.texto3[4]}* https://block-this.com/block-this-latest.apk\n\n≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣≣\n\n`;
  conn.sendMessage(m.chat, {image: {url: img}, caption: ads + res}, {quoted: m});
 } catch {
   return conn.sendMessage(m.chat, {text: '*[❗] Error, no se obtuvieron resultados.'}, {quoted: m});   
 }    
};   
handler.command = ['cuevana', 'pelisplus'];
export default handler;

async function searchC(query) {
  const response = await axios.get(`https://wwv.cuevana8.com/search?q=${query}`);
  const $ = cheerio.load(response.data);
  const resultSearch = [];
  $('.MovieList .TPostMv').each((_, e) => {
    const element = $(e);
    const title = element.find('.TPostMv .Title').first().text();  
    const link = element.find('a').attr('href');
    const image = element.find('img').attr('src');
    resultSearch.push({ title, link, image });
  });
  return resultSearch;
}
