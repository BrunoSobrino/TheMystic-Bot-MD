import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import ytmp44 from '../src/libraries/ytmp44.js'; 

let limit = 100;
let enviando = false;

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_ytv;

  if (!args[0]) throw tradutor.texto1;

  if (enviando) return;
  enviando = true;

  let youtubeLink = '';
  if (args[0].includes('you')) {
    youtubeLink = args[0];
  } else {
    const index = parseInt(args[0]) - 1;
    if (index >= 0) {
      if (Array.isArray(global.videoList) && global.videoList.length > 0) {
        const matchingItem = global.videoList.find((item) => item.from === m.sender);
        if (matchingItem) {
          if (index < matchingItem.urls.length) {
            youtubeLink = matchingItem.urls[index];
          } else {
            enviando = false;
            throw `${tradutor.texto2} ${matchingItem.urls.length}*`;
          }
        } else {
          enviando = false;
          throw `${tradutor.texto3[0]} (${usedPrefix + command} ${tradutor.texto3[1]} ${usedPrefix}playlist <texto>*`;
        }
      } else {
        enviando = false;
        throw `${tradutor.texto4[0]} (${usedPrefix + command} ${tradutor.texto4[1]} ${usedPrefix}playlist <texto>*`;
      }
    }
  }

  const { key } = await conn.sendMessage(m.chat, { text: tradutor.texto5 }, { quoted: m });

  try {
    const yt_play = await yts(youtubeLink);
    const { status, resultados, error } = await ytmp44(yt_play.all[0].url);  
    if (!status) {
      enviando = false;
      throw new Error(error);
    }
    const buff_vid = await getBuffer(resultados.descargar);
    const fileSizeInBytes = buff_vid.byteLength;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
    const title = resultados.titulo;

    if (fileSizeInMB > limit) {
      enviando = false;
      await conn.sendMessage(m.chat, { document: buff_vid, caption: `${tradutor.texto6[0]} ${title}\n${tradutor.texto6[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
      await conn.sendMessage(m.chat, { text: `${tradutor.texto6[2]} ${roundedFileSizeInMB} ${tradutor.texto6[3]} ${title}`, edit: key }, { quoted: m });
    } else {
      enviando = false;
      await conn.sendMessage(m.chat, { video: buff_vid, caption: `${tradutor.texto7[0]} ${title}\n${tradutor.texto7[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
      await conn.sendMessage(m.chat, { text: `${tradutor.texto7[2]}`, edit: key }, { quoted: m });
    }
  } catch (error) {
    try {
      const yt_play = await yts(youtubeLink);
      const videoUrl = `${global.MyApiRestBaseUrl}/api/v1/ytmp4?url=${yt_play.all[0].url}&apikey=${global.MyApiRestApikey}`;
      const buff_vid = await getBuffer(videoUrl);
      const fileSizeInBytes = buff_vid.byteLength;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;
      const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
      const title = yt_play.all[0].title;

      if (fileSizeInMB > limit) {
        enviando = false;
        await conn.sendMessage(m.chat, { document: buff_vid, caption: `${tradutor.texto6[0]} ${title}\n${tradutor.texto6[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
        await conn.sendMessage(m.chat, { text: `${tradutor.texto6[2]} ${roundedFileSizeInMB} ${tradutor.texto6[3]} ${title}`, edit: key }, { quoted: m });
      } else {
        enviando = false;
        await conn.sendMessage(m.chat, { video: buff_vid, caption: `${tradutor.texto7[0]} ${title}\n${tradutor.texto7[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
        await conn.sendMessage(m.chat, { text: `${tradutor.texto7[2]}`, edit: key }, { quoted: m });
      }
    } catch (error) {
      try {
        const yt_play = await yts(youtubeLink);
        const videoUrl = `${global.MyApiRestBaseUrl}/api/v2/ytmp4?url=${yt_play.all[0].url}&apikey=${global.MyApiRestApikey}`;
        const buff_vid = await getBuffer(videoUrl);
        const fileSizeInBytes = buff_vid.byteLength;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
        const title = yt_play.all[0].title;

        if (fileSizeInMB > limit) {
          enviando = false;
          await conn.sendMessage(m.chat, { document: buff_vid, caption: `${tradutor.texto6[0]} ${title}\n${tradutor.texto6[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
          await conn.sendMessage(m.chat, { text: `${tradutor.texto6[2]} ${roundedFileSizeInMB} ${tradutor.texto6[3]} ${title}`, edit: key }, { quoted: m });
        } else {
          enviando = false;
          await conn.sendMessage(m.chat, { video: buff_vid, caption: `${tradutor.texto7[0]} ${title}\n${tradutor.texto7[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp4', mimetype: 'video/mp4' }, { quoted: m });
          await conn.sendMessage(m.chat, { text: `${tradutor.texto7[2]}`, edit: key }, { quoted: m });
        }
      } catch (error) {
        enviando = false;
        await conn.sendMessage(m.chat, { text: tradutor.texto8, edit: key }, { quoted: m });
        throw tradutor.texto9;
      }
    }
  } finally {
    enviando = false;
  }
};

handler.command = /^(video|fgmp4|dlmp4|getvid|yt(v|mp4)?)$/i;
export default handler;

const getBuffer = async (url, options) => {
  try {
    options ? options : {};
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1,
      },
      ...options,
      responseType: 'arraybuffer',
    });
    return res.data;
  } catch (e) {
    console.log(`Error : ${e}`);
  }
};
