import fetch from "node-fetch";
let handler = async (m, {text, usedPrefix, command}) => {
  if (!db.data.chats[m.chat].modohorny && m.isGroup) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙻𝙾𝚂 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 +𝟷𝟾 𝙴𝚂𝚃𝙰𝙽 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾𝚂 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾, 𝚂𝙸 𝙴𝚂 𝙰𝙳𝙼𝙸𝙽 𝚈 𝙳𝙴𝚂𝙴𝙰 𝙰𝙲𝚃𝙸𝚅𝙰𝚁𝙻𝙾𝚂 𝚄𝚂𝙴 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #enable modohorny*'
  
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙹𝙴𝙼𝙿𝙻𝙾 𝙳𝙴 𝚄𝚂𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command} Con mi prima*`
    try {
    let res = await xnxxsearch(text);
    let json = res.result;
    let cap = `Resultados de busqueda de ${text}\n`;
    for (let v of json) {
      cap += `• *Titulo :* ${v.title}
• *Info :* ${v.info}
• *Link :* ${v.link}
`;
      cap += "\n" + "••••••••••••••••••••••••" + "\n";
    }
    m.reply(cap);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
handler.help = ["xnxxsearch"].map((v) => v + " <query>");
handler.tags = ["downloader", "premium"];
handler.command = /^xnxxsearch|xnxxs$/i;

handler.register = false;
handler.premium = true;

export default handler;

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = "https://www.xnxx.com";
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {method: "get"})
      .then((res) => res.text())
      .then((res) => {
        let $ = cheerio.load(res, {xmlMode: false});
        let title = [];
        let url = [];
        let desc = [];
        let results = [];
        $("div.mozaique").each(function (a, b) {
          $(b)
            .find("div.thumb")
            .each(function (c, d) {
              url.push(baseurl + $(d).find("a").attr("href").replace("/THUMBNUM/", "/"));
            });
        });
        $("div.mozaique").each(function (a, b) {
          $(b)
            .find("div.thumb-under")
            .each(function (c, d) {
              desc.push($(d).find("p.metadata").text());
              $(d)
                .find("a")
                .each(function (e, f) {
                  title.push($(f).attr("title"));
                });
            });
        });
        for (let i = 0; i < title.length; i++) {
          results.push({title: title[i], info: desc[i], link: url[i]});
        }
        resolve({code: 200, status: true, result: results});
      })
      .catch((err) => reject({code: 503, status: false, result: err}));
  });
                                                                     }


