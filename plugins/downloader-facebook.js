import axios from 'axios';
import fs from 'fs';
import request from 'request';
let enviando = false;

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_facebook;

  if (!args[0]) {
    throw `_*${tradutor.texto1[0]}*_\n\n*${tradutor.texto1[1]}*\n\n*${tradutor.texto1[2]}* _${usedPrefix + command} https://fb.watch/fOTpgn6UFQ/_`;
  }

  if (!enviando) enviando = true;
  try {
    const videoUrl = await getFacebookVideoUrl(args[0]);
    const videoBuffer = await getBuffer(videoUrl);
    await conn.sendMessage(m.chat, { video: videoBuffer, filename: 'video.mp4', caption: `_*${tradutor.texto4}*_` }, { quoted: m });
    enviando = false;
  } catch (error) {
    console.error('Error occurred:', error);
    enviando = false;
    throw `_*${tradutor.texto5}*_`;
  }
};

handler.command = /^(facebook|fb|facebookdl|fbdl|facebook2|fb2|facebookdl2|fbdl2|facebook3|fb3|facebookdl3|fbdl3|facebook4|fb4|facebookdl4|fbdl4|facebook5|fb5|facebookdl5|fbdl5)$/i;
export default handler;

const getBuffer = async (url, options = {}) => {
  const res = await axios({
    method: 'get',
    url,
    headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
    ...options,
    responseType: 'arraybuffer'
  });
  return res.data;
};

const getFacebookVideoUrl = async (url) => {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'POST',
      url: 'https://www.getfvid.com/downloader',
      formData: { url: url }
    };
    request(options, function (error, response) {
      if (error) return reject(new Error(error));
      let isPrivate = response.body.match(/Uh-Oh! This video might be private and not publi/g);
      if (isPrivate) {
        return reject(new Error('This Video Is Private'));
      }
      const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g;
      let arr = [...response.body.matchAll(rgx)];
      if (arr.length > 0) {
        resolve(arr[0][1].replace(/amp;/gi, ''));
      } else {
        reject(new Error('Invalid Video URL'));
      }
    });
  });
};
