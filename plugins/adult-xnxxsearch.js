import fetch from 'node-fetch';
const handler = async (m, {text, usedPrefix, command}) => {
if (!db.data.chats[m.chat].modohorny && m.isGroup) throw `*[❗] Los comandos +18 están desactivados en este grupo, si es admin y desea activarlos use ${usedPrefix}enable modohorny*`;   
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 𝙳𝙴 𝚄𝚂𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command} Con mi prima*`;
  try {
    const vids_ = {
      from: m.sender,
      urls: [],
    };
    if (!global.videoListXXX) {
      global.videoListXXX = [];
    }
    if (global.videoListXXX[0]?.from == m.sender) {
      global.videoListXXX.splice(0, global.videoListXXX.length);
    }
    const res = await xnxxsearch(text);
    const json = res.result;
    let cap = `*🔍 RESULTADOS DE LA BUSQUEDA:* ${text.toUpperCase()}\n\n`;
    let count = 1;
    for (const v of json) {
      const linkXXX = v.link;
      vids_.urls.push(linkXXX);
      cap += `*[${count}]*\n• *🎬 Titulo:* ${v.title}\n• *🔗 Link:* ${v.link}\n• *❗ Info:* ${v.info}`;
      cap += '\n\n' + '••••••••••••••••••••••••••••••••' + '\n\n';
      count++;
    }
    m.reply(cap);
    global.videoListXXX.push(vids_);
  } catch {
    throw e;
  }
};
handler.help = ['xnxxsearch'].map((v) => v + ' <query>');
handler.tags = ['downloader', 'premium'];
handler.command = /^xnxxsearch|xnxxs$/i;
export default handler;

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com';
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {method: 'get'}).then((res) => res.text()).then((res) => {
      const $ = cheerio.load(res, {xmlMode: false});
      const title = [];
      const url = [];
      const desc = [];
      const results = [];
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb').each(function(c, d) {
          url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
        });
      });
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb-under').each(function(c, d) {
          desc.push($(d).find('p.metadata').text());
          $(d).find('a').each(function(e, f) {
            title.push($(f).attr('title'));
          });
        });
      });
      for (let i = 0; i < title.length; i++) {
        results.push({title: title[i], info: desc[i], link: url[i]});
      }
      resolve({code: 200, status: true, result: results});
    }).catch((err) => reject({code: 503, status: false, result: err}));
  });
}


