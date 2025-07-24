import fetch from 'node-fetch';

const handler = async (m, {conn, groupMetadata, usedPrefix, text, args, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_ringtone


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
