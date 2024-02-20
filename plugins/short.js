import fetch from "node-fetch";

let handler = async (m, { command, usedPrefix, conn, args }) => {
  if (!args[0]) return m.reply("هذا الأمر خاص باختصار الروابط سوف اعطيك مثال \n.short https://youtu.be/LrsNYeLqRAU vgd");
  let url = args[0].startsWith("https://") ? args[0] : `https://${args[0]}`;
  if (!url.startsWith("https://"))
    return m.reply("Masukan Url Dengan Awalan *https://*");

  let urllist = [
    "tinyurl",
    "linkpoi",
    "bitly",
    "ouo",
    "1pt",
    "cleanuri",
    "gotiny",
    "isgd",
    "vgd",
    "tnyim",
    "kutt",
    "rebrandly",
    "multishort",
    "shrtco",
  ];

  if (!args[1])
    return m.reply(
      "*Example:*\n.short https://youtu.be/LrsNYeLqRAU 1pt\n\n*اختر واحدة من بين هذه الخيارات*\n" +
        urllist.map((v, index) => "  ○ " + v).join("\n")
    );

  if (!urllist.includes(args[1]))
    return m.reply(
      "نوع URL الذي تم إدخاله غير صحيح أو غير متوفر.\n*Example:*\n.short https://youtu.be/LrsNYeLqRAU 1pt\n\n*اختر واحدة من هذه الخيارت*\n\n" +
        urllist.map((v, index) => "  ○ " + v).join("\n")
    );

  let reslink = "🚀 *الرابط:*\n";
  let conver = "_*ᴄ ᴏ ɴ ᴠ ᴇ ʀ ᴛ ɪ ɴ ɢ . . .*_";

  try {
    if (args[1] == "tinyurl") {
      let tiny = await (
        await fetch(
          `https://hardianto.xyz/api/short/tinyurl?url=${args[0]}&apikey=hardianto`
        )
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${tiny.result}`, m);
    } else if (args[1] == "linkpoi") {
      let poi = await (
        await fetch(`https://linkpoi.ga/api.php?url=${args[0]}`)
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${poi.shorturl.replace("/", "/")}`, m);
    } else if (args[1] == "bitly") {
      let bit = await (
        await fetch(global.API("xteam", "/shorturl/bitly", { url: args[0] }, "apikey"))
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${bit.result.link}`, m);
    } else if (args[1] == "ouo") {
      let ouo = await (
        await fetch(
          `https://api.lolhuman.xyz/api/ouoshortlink?apikey=${lolkey}&url=${args[0]}`
        )
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${ouo.result}`, m);
    } else if (args[1] == "1pt") {
      let pt = await (
        await fetch(
          `https://csclub.uwaterloo.ca/~phthakka/1pt/addURL.php?url=${encodeURIComponent(
            args[0]
          )}`
        )
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}https://1pt.co/${pt.short}`, m);
    } else if (args[1] == "cleanuri") {
      let clu = await (
        await fetch("https://cleanuri.com/api/v1/shorten", {
          method: "POST",
          body: new URLSearchParams({
            url: args[0],
          }),
        })
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${clu.result_url}`, m);
    } else if (args[1] == "gotiny") {
      let gtn = await (
        await fetch("https://gotiny.cc/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: args[0],
          }),
        })
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}https://gotiny.cc/${gtn[0].code}`, m);
    } else if (args[1] == "isgd") {
      let igd = await (
        await fetch("https://is.gd/create.php?format=json&url=" + args[0])
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${igd.shorturl}`, m);
    } else if (args[1] == "vgd") {
      let vgd = await (
        await fetch("https://v.gd/create.php?format=json&url=" + args[0])
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${vgd.shorturl}`, m);
    } else if (args[1] == "tnyim") {
      let tny = await (
        await fetch("https://tny.im/yourls-api.php?format=json&action=shorturl&url=" + args[0])
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${tny.shorturl}`, m);
    } else if (args[1] == "kutt") {
      let config = {
        headers: {
          "X-API-KEY": "VcMiC4tZGdD1Lgu1KTiYfSNrs3Q_K3TMdVuSnStl",
          "Content-Type": "application/json",
        },
      };
      let jsonBody = {
        target: args[0],
      };
      let body = JSON.stringify(jsonBody);

      let ktt = await (
        await fetch("https://kutt.it/api/v2/links", {
          method: "POST",
          headers: config.headers,
          body: body,
        })
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${ktt.link}`, m);
    } else if (args[1] == "rebrandly") {
      let encoded = encodeURIComponent(args[0]);
      let reb = await (
        await fetch(
          `https://api.rebrandly.com/v1/links/new?destination=${encoded}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              apikey: "c95033066865402eb6d1dc40a4c4547f",
              Host: "api.rebrandly.com",
            },
          }
        )
      ).json();
      await conn.reply(m.chat, conver, m);
      await conn.reply(m.chat, `${reslink}${reb.shortUrl}`, m);
    } else if (args[1] == "multishort") {
      let sl = await (
        await fetch("https://short-link-api.vercel.app/?query=" + args[0])
      ).json();
      await conn.reply(m.chat, conver, m);
      let linkList = Object.entries(sl).map(([name, link]) => ({
        nama: name,
        link,
      }));
      let Liks = linkList.map((v, index) => "  ○ " + v.link).join("\n");
      await conn.reply(m.chat, `${reslink + "\n" + Liks}`, m);
    } else if (args[1] == "shrtco") {
      let shr = await (
        await fetch("https://api.shrtco.de/v2/shorten?url=" + args[0])
      ).json();
      await conn.reply(m.chat, conver, m);
      let linkArray = [];
      Object.values(shr.result).forEach((value) => {
        if (!value.startsWith("https")) {
          linkArray.push(value);
        }
      });
      let ShrArr = linkArray.map((v, index) => "  ○ " + v).join("\n");
      await conn.reply(m.chat, `${reslink + "\n" + ShrArr}`, m);
    }
  } catch (e) {
    console.log(e);
    await conn.reply(m.chat, "حدث خطأ أثناء تقصير URL.", m);
  }
};

handler.help = ["short"];
handler.tags = ["tools"];
handler.command = /^short?$/i;

export default handler;

async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`);
  return await res.text();
        }
