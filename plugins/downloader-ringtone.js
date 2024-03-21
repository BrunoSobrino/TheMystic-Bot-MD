import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_ringtone
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, groupMetadata, usedPrefix, text, args, command}) => {
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Hola*`;
  const anu = await ringtone(text);
  const result = anu[Math.floor(Math.random() * anu.length)];
  conn.sendMessage(m.chat, {audio: {url: result.audio}, fileName: result.title+'.mp3', mimetype: 'audio/mpeg'}, {quoted: m});
};
handler.command = ['ringtone'];
export default handler;
async function ringtone(title) {
  return new Promise((resolve, reject) => {
    axios.get('https://meloboom.com/es/search/'+title).then((get) => {
      const $ = cheerio.load(get.data);
      const hasil = [];
      $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function(a, b) {
        hasil.push({title: $(b).find('h4').text(), source: 'https://meloboom.com/'+$(b).find('a').attr('href'), audio: $(b).find('audio').attr('src')});
      });
      resolve(hasil);
    });
  });
}
