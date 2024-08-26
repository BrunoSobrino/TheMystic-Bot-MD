import fetch from 'node-fetch';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import fs from "fs";
import yts from 'yt-search';
import ytmp33 from '../lib/ytmp33.js';
import ytmp44 from '../lib/ytmp44.js';

let limit1 = 100;
let limit2 = 400;
let limit_a1 = 50;
let limit_a2 = 400;

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_play;

  if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;

  const yt_play = await search(args.join(' '));
  let additionalText = '';
  if (command === 'اغنيه') {
    additionalText = 'audio';
  } else if (command === 'فديو') {
    additionalText = 'vídeo';
  }

  const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${secondString(yt_play[0].duration.seconds)}\n${tradutor.texto2[3]} ${MilesNumber(yt_play[0].views)}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}. ${tradutor.texto2[10]}`.trim();

  conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

  if (command === 'اغنيه') {
    try {
      const { status, resultados, error } = await ytmp33(yt_play[0].url);
      if (!status) throw new Error(error);

      const ttl = resultados.titulo;
      const buff_aud = await getBuffer(resultados.descargar);
      const fileSizeInBytes = buff_aud.byteLength;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;
      const size = fileSizeInMB.toFixed(2);

      if (size >= limit_a2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto3} _${resultados.descargar}_` }, { quoted: m });
        return;
      }
      if (size >= limit_a1 && size <= limit_a2) {
        await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
        return;
      } else {
        await conn.sendMessage(m.chat, { audio: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
        return;
      }
    } catch (error) {
      console.log('Fallo el 1: ' + error)
      try {
        const audio = `${global.MyApiRestBaseUrl}/api/v1/ytmp3?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
        const ttl = await yt_play[0].title;
        const buff_aud = await getBuffer(audio);
        const fileSizeInBytes = buff_aud.byteLength;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        const size = fileSizeInMB.toFixed(2);

        if (size >= limit_a2) {
          await conn.sendMessage(m.chat, { text: `${tradutor.texto3} _${audio}_` }, { quoted: m });
          return;
        }
        if (size >= limit_a1 && size <= limit_a2) {
          await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
          return;
        } else {
          await conn.sendMessage(m.chat, { audio: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
          return;
        }
      } catch {
        throw tradutor.texto4;
      }
    }
  }

  if (command === 'فديو') {
    try {
      const { status, resultados, error } = await ytmp44(yt_play[0].url);
      if (!status) throw new Error(error);

      const ttl2 = resultados.titulo;
      const buff_vid = await getBuffer(resultados.descargar);
      const fileSizeInBytes2 = buff_vid.byteLength;
      const fileSizeInKB2 = fileSizeInBytes2 / 1024;
      const fileSizeInMB2 = fileSizeInKB2 / 1024;
      const size2 = fileSizeInMB2.toFixed(2);

      if (size2 >= limit2) {
        await conn.sendMessage(m.chat, { text: `${tradutor.texto5} _${resultados.descargar}_` }, { quoted: m });
        return;
      }
      if (size2 >= limit1 && size2 <= limit2) {
        await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
        return;
      } else {
        await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
        return;
      }
    } catch (error) {
      console.log('Fallo el 1: ' + error);
      try {
        const video = `${global.MyApiRestBaseUrl}/api/v1/ytmp4?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
        const ttl2 = await yt_play[0].title;
        const buff_vid = await getBuffer(video);
        const fileSizeInBytes2 = buff_vid.byteLength;
        const fileSizeInKB2 = fileSizeInBytes2 / 1024;
        const fileSizeInMB2 = fileSizeInKB2 / 1024;
        const size2 = fileSizeInMB2.toFixed(2);

        if (size2 >= limit2) {
          await conn.sendMessage(m.chat, { text: `${tradutor.texto5} _${video}_` }, { quoted: m });
          return;
        }
        if (size2 >= limit1 && size2 <= limit2) {
          await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
          return;
        } else {
          await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
          return;
        }
      } catch {
        throw tradutor.texto6;
      }
    }
  }
};

handler.command = /^(اغنيه|فديو)$/i;
export default handler;



/*import fetch from 'node-fetch';
import axios from 'axios';
import {youtubedl, youtubedlv2} from '@bochilteam/scraper';
import fs from "fs";
import yts from 'yt-search';

let limit1 = 100;
let limit2 = 400;
let limit_a1 = 50;
let limit_a2 = 400;
const handler = async (m, {conn, command, args, text, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.descargas_play

  if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
    const yt_play = await search(args.join(' '));
    let additionalText = '';
    if (command === 'اغنيه') {
      additionalText = 'audio';
    } else if (command === 'فديو') {
      additionalText = 'vídeo';
    }
    const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${secondString(yt_play[0].duration.seconds)}\n${tradutor.texto2[3]} ${`${MilesNumber(yt_play[0].views)}`}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}. ${tradutor.texto2[10]}`.trim();
    conn.sendMessage(m.chat, {image: {url: yt_play[0].thumbnail}, caption: texto1}, {quoted: m});
    if (command == 'اغنيه') {
    try {   
    const audio = `${global.MyApiRestBaseUrl}/api/v1/ytmp3?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
    const ttl = await yt_play[0].title
    const buff_aud = await getBuffer(audio);
    const fileSizeInBytes = buff_aud.byteLength;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    const size = fileSizeInMB.toFixed(2);       
    if (size >= limit_a2) {  
    await conn.sendMessage(m.chat, {text: `${tradutor.texto3} _${audio}_`}, {quoted: m});
    return;    
    }     
    if (size >= limit_a1 && size <= limit_a2) {  
    await conn.sendMessage(m.chat, {document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3`}, {quoted: m});   
    return;
    } else {
    await conn.sendMessage(m.chat, {audio: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3`}, {quoted: m});   
    return;    
    }} catch {
    throw tradutor.texto4;    
    }}
    if (command == 'فديو') {
    try {   
    const video = `${global.MyApiRestBaseUrl}/api/v1/ytmp4?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
    const ttl2 = await yt_play[0].title
    const buff_vid = await getBuffer(video);
    const fileSizeInBytes2 = buff_vid.byteLength;
    const fileSizeInKB2 = fileSizeInBytes2 / 1024;
    const fileSizeInMB2 = fileSizeInKB2 / 1024;
    const size2 = fileSizeInMB2.toFixed(2);       
    if (size2 >= limit2) {  
    await conn.sendMessage(m.chat, {text: `${tradutor.texto5} _${video}_`}, {quoted: m});
    return;    
    }     
    if (size2 >= limit1 && size2 <= limit2) {  
    await conn.sendMessage(m.chat, {document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4`}, {quoted: m});   
    return;
    } else {
    await conn.sendMessage(m.chat, {video: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4`}, {quoted: m});   
    return;    
    }} catch {
    throw tradutor.texto6;    
    }
  }
};
handler.command = /^(اغنيه|فديو)$/i;
export default handler;*/

async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? 'd ' : 'd ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? 'h ' : 'h ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? 'm ' : 'm ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? 's' : 's') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
  });
}

const getBuffer = async (url, options) => {
    options ? options : {};
    const res = await axios({method: 'get', url, headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1,}, ...options, responseType: 'arraybuffer'});
    return res.data;
};
