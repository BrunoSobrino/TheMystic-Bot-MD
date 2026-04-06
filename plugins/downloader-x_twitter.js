import axios from 'axios';
import fs from 'fs';

let enviando = false;
const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_x_twitter;

  // Mensaje más sutil y dinámico sin el link de AuronPlay
  if (!text) throw `*${tradutor.texto1}*\n\n*${usedPrefix + command}* https://x.com/username/status/123456789`;
  
  if (enviando) return;
  enviando = true;

  try {
    await conn.sendMessage(m.chat, {text: global.wait}, {quoted: m}); 
    const res = await TwitterDL(text, tradutor);

    if (res?.result.type == 'video') {
      const caption = res?.result.caption ? res.result.caption : tradutor.texto2;
      for (let i = 0; i < res.result.media.length; i++) {
        await conn.sendMessage(m.chat, {video: {url: res.result.media[i].result[0].url}, caption: caption}, {quoted: m});
      }
      enviando = false;
      return;
    } else if (res?.result.type == 'photo') {
      const caption = res?.result.caption ? res.result.caption : tradutor.texto2;
      for (let i = 0; i < res.result.media.length; i++) {
        await conn.sendMessage(m.chat, {image: {url: res.result.media[i].url}, caption: caption}, {quoted: m});
      }
      enviando = false;
      return;
    }
  } catch (e) {
    enviando = false;
    throw tradutor.texto3;
  }
};

handler.command = /^(x|twitter|xdl|dlx|twdl|twt|twitterdl)$/i;
export default handler;

const _twitterapi = (id) => `https://info.tweeload.site/status/${id}.json`;

const getAuthorization = async () => {
  const { data } = await axios.get("https://pastebin.com/raw/SnCfd4ru");
  return data;
};

const TwitterDL = async (url, tradutor) => {
  return new Promise(async (resolve, reject) => {
    const id = url.match(/\/([\d]+)/);
    if (!id)
      return resolve({
        status: "error",
        message: tradutor.texto4,
      });

    try {
      const response = await axios.get(_twitterapi(id[1]), {
        method: "GET",
        headers: {
          Authorization: await getAuthorization(),
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
        },
      });

      if (response.data.code !== 200) {
        return resolve({
          status: "error",
          message: tradutor.texto5,
        });
      }

      const author = {
        id: response.data.tweet.author.id,
        name: response.data.tweet.author.name,
        username: response.data.tweet.author.screen_name,
        avatar_url: response.data.tweet.author.avatar_url,
      };

      let media = [];
      let type;

      if (response.data.tweet?.media?.videos) {
        type = "video";
        response.data.tweet.media.videos.forEach((v) => {
          const resultVideo = [];
          v.video_urls.forEach((z) => {
            const resMatch = z.url.match(/([\d ]{2,5}[x][\d ]{2,5})/);
            resultVideo.push({
              bitrate: z.bitrate,
              url: z.url,
              resolution: resMatch ? resMatch[0] : "HD"
            });
          });
          if (resultVideo.length !== 0) {
            media.push({
              type: v.type,
              result: v.type === "video" ? resultVideo : v.url,
            });
          }
        });
      } else {
        type = "photo";
        response.data.tweet.media.photos.forEach((v) => {
          media.push(v);
        });
      }

      resolve({
        status: "success",
        result: {
          caption: response.data.tweet.text,
          author,
          type,
          media: media.length !== 0 ? media : null,
        },
      });
    } catch (err) {
      reject(err);
    }
  });
};
          
