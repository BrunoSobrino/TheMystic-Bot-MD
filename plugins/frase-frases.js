import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { conn, command }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.frase_frases

  global.frasesromanticas = tradutor.texto3;

  global.consejos = tradutor.texto4;

  if (command === 'consejo') {
    const consejo = consejos[Math.floor(Math.random() * consejos.length)];
    const mensaje = `╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀🌟 ${tradutor.texto1} 🌟\n\n❥ ${consejo}\n\n╰─◆────◈⚘◈─────◆─╯`;
    await m.reply(mensaje);
  }

  if (command === 'fraseromantica') {
    const frase_romantica = frasesromanticas[Math.floor(Math.random() * frasesromanticas.length)];
    const mensaje = `╭─◆────◈⚘◈─────◆─╮\n\n⠀⠀💖 ${tradutor.texto2} 💖\n\n❥ ${frase_romantica}\n\n╰─◆────◈⚘◈─────◆─╯`;
    await m.reply(mensaje);
  }

  if (command == 'historiaromantica') {
    try {
      const cerpe = await cerpen(`cinta romantis`);
      const storytime = await translate(cerpe.cerita, { to: 'es', autoCorrect: true }).catch((_) => null);
      const titletime = await translate(cerpe.title, { to: 'es', autoCorrect: true }).catch((_) => null);
      conn.reply(m.chat, `᭥🫐᭢ Título: ${titletime.text}
᭥🍃᭢ Autor: ${cerpe.author}
────────────────
${storytime.text}`, m);
    } catch {
      const err = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=${lolkeysapi}&text=Elabora%20una%20historia%20romantica%20que%20use%20el%20siguiente%20formato:%20%E1%AD%A5%F0%9F%AB%90%E1%AD%A2%20T%C3%ADtulo:%20%E1%AD%A5%F0%9F%8D%83%E1%AD%A2%20Autor:%20%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%20hsitoria...%20adalah&user=user-unique-id`);
      const json = await err.json();
      const fraseChat = json.result;
      conn.reply(m.chat, fraseChat, m);
    }
  }
};
handler.tags = ['frases'];
handler.command = handler.help = ['consejo', 'fraseromantica', 'historiaromantica'];
export default handler;

async function cerpen(category) {
  return new Promise((resolve, reject) => {
    const title = category.toLowerCase().replace(/[()*]/g, '');
    const judul = title.replace(/\s/g, '-');
    const page = Math.floor(Math.random() * 5);
    axios.get('http://cerpenmu.com/category/cerpen-' + judul + '/page/' + page)
      .then((get) => {
        const $ = cheerio.load(get.data);
        const link = [];
        $('article.post').each(function (a, b) {
          link.push($(b).find('a').attr('href'));
        });
        const random = link[Math.floor(Math.random() * link.length)];
        axios.get(random).then((res) => {
          const $$ = cheerio.load(res.data);
          const hasil = {
            title: $$('#content > article > h1').text(),
            author: $$('#content > article').text().split('Cerpen Karangan: ')[1].split('Kategori: ')[0],
            kategori: $$('#content > article').text().split('Kategori: ')[1].split('\n')[0],
            lolos: $$('#content > article').text().split('Lolos moderasi pada: ')[1].split('\n')[0],
            cerita: $$('#content > article > p').text(),
          };
          resolve(hasil);
        });
      });
  });
}


