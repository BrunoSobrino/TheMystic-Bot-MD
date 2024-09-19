import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import ytmp33 from '../src/libraries/ytmp33.js';

let enviando = false;

const handler = async (m, { conn, args }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_yta_2;
  const tradutorrr = _translate.plugins.downloader_yta;  

  if (!args[0]) return await conn.sendMessage(m.chat, { text: tradutor.texto1 }, { quoted: m });

  if (enviando) return;  
  enviando = true; 

  const { key } = await conn.sendMessage(m.chat, { text: tradutor.texto2 }, { quoted: m });

  const youtubeLink = args[0];

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
    const size = fileSizeInMB.toFixed(2);
    const title = resultados.titulo;
    const cap = `${tradutor.texto3[0]} ${title}\n${tradutor.texto3[1]}  ${size} MB`.trim();
    await conn.sendMessage(m.chat, { document: buff_aud, caption: cap, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
    await conn.sendMessage(m.chat, { text: tradutorrr.texto5[4], edit: key }, { quoted: m });
    enviando = false;
  } catch (error) {
    try {
      const yt_search = await yts(youtubeLink);
      const audioUrl = `${global.MyApiRestBaseUrl}/api/v1/ytmp3?url=${yt_search.all[0].url}&apikey=${global.MyApiRestApikey}`;
      const buff_aud = await getBuffer(audioUrl);
      const fileSizeInBytes = buff_aud.byteLength;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;
      const size = fileSizeInMB.toFixed(2);
      const title = yt_search.all[0].title;
      const cap = `${tradutor.texto3[0]} ${title}\n${tradutor.texto3[1]}  ${size} MB`.trim();
      await conn.sendMessage(m.chat, { document: buff_aud, caption: cap, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
      await conn.sendMessage(m.chat, { text: tradutorrr.texto5[4], edit: key }, { quoted: m });
      enviando = false;
    } catch (error) {
      try {
        const yt_search = await yts(youtubeLink);
        const audioUrl = `${global.MyApiRestBaseUrl}/api/v2/ytmp3?url=${yt_search.all[0].url}&apikey=${global.MyApiRestApikey}`;
        const buff_aud = await getBuffer(audioUrl);
        const fileSizeInBytes = buff_aud.byteLength;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        const size = fileSizeInMB.toFixed(2);
        const title = yt_search.all[0].title;
        const cap = `${tradutor.texto3[0]} ${title}\n${tradutor.texto3[1]}  ${size} MB`.trim();
        await conn.sendMessage(m.chat, { document: buff_aud, caption: cap, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
        await conn.sendMessage(m.chat, { text: tradutorrr.texto5[4], edit: key }, { quoted: m });
        enviando = false;
      } catch (error) {
        enviando = false; 
        await conn.sendMessage(m.chat, { text: tradutor.texto4, edit: key }, { quoted: m });
      }
    }
  } finally {
    enviando = false;  
  }
};

handler.command = /^(ytmp3doc|ytadoc|ytmp3.2|yta.2)$/i;
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
    throw e;  
  }
};
