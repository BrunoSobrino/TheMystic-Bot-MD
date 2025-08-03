import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import ytmp33 from '../src/libraries/ytmp33.js';

let limit = 50;
let enviando = false;

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_yta;

  if (!args[0]) throw tradutor.texto8;

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
            throw `${tradutor.texto1} ${matchingItem.urls.length}*`;
          }
        } else {
          enviando = false;
          throw `${tradutor.texto2[0]} (${usedPrefix + command} ${tradutor.texto2[1]} ${usedPrefix}playlist <texto>*`;
        }
      } else {
        enviando = false;
        throw `${tradutor.texto3[0]} (${usedPrefix + command} ${tradutor.texto3[1]} ${usedPrefix}playlist <texto>*`;
      }
    }
  }

  const { key } = await conn.sendMessage(m.chat, { text: tradutor.texto4 }, { quoted: m });

  try {
    const { status, resultados, error } = await ytmp33(youtubeLink);
    if (!status) {
      enviando = false;
      throw new Error(error);
    }
    const buff_aud = await getBuffer(resultados.descargar);
    const fileSizeInBytes = buff_aud.byteLength;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
    const title = resultados.titulo;

    if (fileSizeInMB > limit) {
      enviando = false;
      await conn.sendMessage(m.chat, { document: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
    } else {
      enviando = false;
      await conn.sendMessage(m.chat, { audio: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
    }
    await conn.sendMessage(m.chat, { text: `${tradutor.texto5[4]}`, edit: key }, { quoted: m });
    enviando = false;

  } catch (error) {
    try {
      const yt_play = await yts(youtubeLink);
      const audioUrl = `${global.MyApiRestBaseUrl}/api/v1/ytmp3?url=${yt_play.all[0].url}&apikey=${global.MyApiRestApikey}`;
      const buff_aud = await getBuffer(audioUrl);
      const fileSizeInBytes = buff_aud.byteLength;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;
      const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
      const title = yt_play.all[0].title;

      if (fileSizeInMB > limit) {
        enviando = false;
        await conn.sendMessage(m.chat, { document: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
      } else {
        enviando = false;
        await conn.sendMessage(m.chat, { audio: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
      }
      await conn.sendMessage(m.chat, { text: `${tradutor.texto5[4]}`, edit: key }, { quoted: m });
      enviando = false;
    } catch (error) {  
      try {
        const yt_play = await yts(youtubeLink);
        const audioUrl = `${global.MyApiRestBaseUrl}/api/v2/ytmp3?url=${yt_play.all[0].url}&apikey=${global.MyApiRestApikey}`;
        const buff_aud = await getBuffer(audioUrl);
        const fileSizeInBytes = buff_aud.byteLength;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
        const title = yt_play.all[0].title;

        if (fileSizeInMB > limit) {
          enviando = false;
          await conn.sendMessage(m.chat, { document: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
        } else {
          enviando = false;
          await conn.sendMessage(m.chat, { audio: buff_aud, caption: `${tradutor.texto5[0]} ${title}\n${tradutor.texto5[1]} ${roundedFileSizeInMB} MB`, fileName: title + '.mp3', mimetype: 'audio/mpeg' }, { quoted: m });
        }
        await conn.sendMessage(m.chat, { text: `${tradutor.texto5[4]}`, edit: key }, { quoted: m });
        enviando = false;
      } catch (error) {
        enviando = false;
        await conn.sendMessage(m.chat, { text: tradutor.texto6, edit: key }, { quoted: m });
        throw tradutor.texto7;
      } 
    }
  } finally {
    enviando = false;
  }
};

handler.command = /^(audio|fgmp3|dlmp3|getaud|yt(a|mp3))$/i;
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
