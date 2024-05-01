import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, command, usedPrefix, text }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.adult_xvideosdl

  if (!db.data.chats[m.chat].modohorny && m.isGroup) throw `${tradutor.texto1} #enable modohorny*`;
  if (!args[0]) throw `${tradutor.texto2} ${usedPrefix + command} https://www.xvideos.com/video70389849/pequena_zorra_follada_duro*`;
  try {
    conn.reply(m.chat, `${tradutor.texto3}`, m);
    const res = await xvideosdl(args[0]);
    conn.sendMessage(m.chat, { document: { url: res.result.url }, mimetype: 'video/mp4', fileName: res.result.title }, { quoted: m });
  } catch (e) {
    throw `${tradutor.texto4}\n*◉ https://www.xvideos.com/video70389849/pequena_zorra_follada_duro*`;
  }
};
handler.command = /^(xvideosdl)$/i;
export default handler;

async function xvideosdl(url) {
  return new Promise((resolve, reject) => {
    fetch(`${url}`, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        let $ = cheerio.load(res, { xmlMode: false });
        const title = $("meta[property='og:title']").attr("content")
        const keyword = $("meta[name='keywords']").attr("content")
        const views = $("div#video-tabs > div > div > div > div > strong.mobile-hide").text() + " views"
        const vote = $("div.rate-infos > span.rating-total-txt").text()
        const likes = $("span.rating-good-nbr").text()
        const deslikes = $("span.rating-bad-nbr").text()
        const thumb = $("meta[property='og:image']").attr("content")
        const url = $("#html5video > #html5video_base > div > a").attr("href")
        resolve({ status: 200, result: { title, url, keyword, views, vote, likes, deslikes, thumb } })
      })
  })
};

async function xvideosSearch(url) {
  return new Promise(async (resolve) => {
    await axios.request(`https://www.xvideos.com/?k=${url}&p=${Math.floor(Math.random() * 9) + 1}`, { method: "get" }).then(async result => {
      let $ = cheerio.load(result.data, { xmlMod3: false });
      let title = [];
      let duration = [];
      let quality = [];
      let url = [];
      let thumb = [];
      let hasil = [];

      $("div.mozaique > div > div.thumb-under > p.title").each(function (a, b) {
        title.push($(this).find("a").attr("title"));
        duration.push($(this).find("span.duration").text());
        url.push("https://www.xvideos.com" + $(this).find("a").attr("href"));
      });
      $("div.mozaique > div > div.thumb-under").each(function (a, b) {
        quality.push($(this).find("span.video-hd-mark").text());
      });
      $("div.mozaique > div > div > div.thumb > a").each(function (a, b) {
        thumb.push($(this).find("img").attr("data-src"));
      });
      for (let i = 0; i < title.length; i++) {
        hasil.push({
          title: title[i],
          duration: duration[i],
          quality: quality[i],
          thumb: thumb[i],
          url: url[i]
        });
      }
      resolve(hasil);
    });
  });
};
