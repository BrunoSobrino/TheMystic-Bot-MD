import cheerio from 'cheerio';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const querys = text.split(' ');
    if (!querys[0]) {
      const listData = await getList();
      const pesan = listData.map((item, index) => `*${index + 1}.* ${item.title} - ${item.link}`).join('\n');
      await m.reply(pesan);
    } else if (querys[0]) {
      const linkIndex = parseInt(querys[0]);
      const listData = await getList();

      if (linkIndex >= 1 && linkIndex <= listData.length) {
        const link = listData[linkIndex - 1].link;

        if (querys[1]) {
          const categoryIndex = parseInt(querys[1]);
          const categories = await getCategory(link);

          if (categoryIndex >= 1 && categoryIndex <= categories.length) {
            const categorydLinks = await getDownload(categories[categoryIndex - 1].link);
            const pesan = categorydLinks.map((item, index) => `*${index + 1}.* ${item}`).join('\n');
            await m.reply(pesan);
          } else {
            await m.reply('Invalid category index.');
          }
        } else {
          const categories = await getCategory(link);
          const pesan = categories.map((item, index) => `*${index + 1}.* ${item.title} - ${item.link}`).join('\n');
          await m.reply(pesan);
        }
      } else {
        await m.reply('Invalid index.');
      }
    }
};
handler.help = ["bookslib"];
handler.tags = ["pdf"];
handler.command = /^(bookslib)$/i;
export default handler;

async function getList() {
  try {
    const response = await fetch('https://books-library.net/sitemap');
    const html = await response.text();
    const $ = cheerio.load(html);

    const downloadRegex = /\/[^/]*-download$/;

    return $('li')
      .get()
      .map((element) => {
        const link = $(element).find('h4 a').attr('href');
        if (downloadRegex.test(link)) {
          return {
            number: $(element).find('h4 small').text().trim().split(' ')[0],
            link,
            title: $(element).find('h4 a').text(),
            description: $(element).find('h6 small.muted').text().trim(),
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error('An error occurred:', error);
    return [];
  }
}

async function getCategory(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const data = $('.col-xl-3 .smlbooks.book a.oneBook')
      .map((index, element) => {
        const link = 'https://books-library.net/' + $(element).attr('href');
        const title = $(element).attr('title');
        return { link, title };
      })
      .get();

    return data;
  } catch (error) {
    console.error('An error occurred:', error);
    return [];
  }
}

async function getDownload(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const downloadLinks = $('.col-12.col-sm-12.col-md-6 a[href*="books-library.net/files"]')
      .map((index, element) => {
        const link = $(element).attr('href');
        return link;
      })
      .get();

    return downloadLinks;
  } catch (error) {
    console.error('An error occurred:', error);
    return [];
  }
}
