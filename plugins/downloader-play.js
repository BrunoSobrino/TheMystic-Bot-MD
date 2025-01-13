import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';

let handler = async (m, { conn, text, usedPrefix, command }) => {    
const datas = global;
const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
const tradutor = _translate.plugins.descargas_play;

  let additionalText = '';
  if (['play', 'play1doc'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2', 'play2doc'].includes(command)) {
    additionalText = 'vídeo';
 }

    if (command === 'play') {
      if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
        try {
      const apisearch = await axios.get(`https://api-rin-tohsaka.vercel.app/search/ytsearch?text=${encodeURIComponent(text)}`)
      const responsev1 = apisearch.data.data[0];
            
      const body = `${tradutor.texto2[0]} ${responsev1.title}\n${tradutor.texto2[1]} ${responsev1.uploaded}\n${tradutor.texto2[2]} ${responsev1.duration}\n${tradutor.texto2[3]} ${responsev1.views}\n${tradutor.texto2[4]} ${responsev1.author.name}\n${tradutor.texto2[5]} ${responsev1.identifier}\n${tradutor.texto2[6]} ${responsev1.type}\n${tradutor.texto2[7]} ${responsev1.url}\n${tradutor.texto2[8]} ${responsev1.author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
      conn.sendMessage(m.chat, { image: { url: responsev1.thumbnail }, caption: body }, { quoted: m });

      const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${responsev1.url}`)
      const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { audio: { url: responsev2 }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `「 ✰ 」OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n> ${e}`, m);
        }
    }

    if (command === 'play2') {
      if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
        try {
       const apisearch = await axios.get(`https://api-rin-tohsaka.vercel.app/search/ytsearch?text=${encodeURIComponent(text)}`)
      const responsev1 = apisearch.data.data[0];
            
      const body = `${tradutor.texto2[0]} ${responsev1.title}\n${tradutor.texto2[1]} ${responsev1.uploaded}\n${tradutor.texto2[2]} ${responsev1.duration}\n${tradutor.texto2[3]} ${responsev1.views}\n${tradutor.texto2[4]} ${responsev1.author.name}\n${tradutor.texto2[5]} ${responsev1.identifier}\n${tradutor.texto2[6]} ${responsev1.type}\n${tradutor.texto2[7]} ${responsev1.url}\n${tradutor.texto2[8]} ${responsev1.author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
      conn.sendMessage(m.chat, { image: { url: responsev1.thumbnail }, caption: body }, { quoted: m });

      const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${responsev1.url}`)
      const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { video: { url: responsev2 }, mimetype: 'video/mp4' }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `「 ✰ 」OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n> ${e}`, m);
        }
    }
  
    if (command === 'play1doc') {
      if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
        try {
       const apisearch = await axios.get(`https://api-rin-tohsaka.vercel.app/search/ytsearch?text=${encodeURIComponent(text)}`)
     const responsev1 = apisearch.data.data[0];
            
     const body = `${tradutor.texto2[0]} ${responsev1.title}\n${tradutor.texto2[1]} ${responsev1.uploaded}\n${tradutor.texto2[2]} ${responsev1.duration}\n${tradutor.texto2[3]} ${responsev1.views}\n${tradutor.texto2[4]} ${responsev1.author.name}\n${tradutor.texto2[5]} ${responsev1.identifier}\n${tradutor.texto2[6]} ${responsev1.type}\n${tradutor.texto2[7]} ${responsev1.url}\n${tradutor.texto2[8]} ${responsev1.author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
     conn.sendMessage(m.chat, { image: { url: responsev1.thumbnail }, caption: body }, { quoted: m });

     const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${responsev1.url}`)
     const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { document: { url: responsev2 }, mimetype: 'audio/mpeg', fileName: `${responsev1.title}.mp3` }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `「 ✰ 」OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n> ${e}`, m);
        }
    }

    if (command === 'play2doc') {
      if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
        try {
       const apisearch = await axios.get(`https://api-rin-tohsaka.vercel.app/search/ytsearch?text=${encodeURIComponent(text)}`)
      const responsev1 = apisearch.data.data[0];
            
      const body = `${tradutor.texto2[0]} ${responsev1.title}\n${tradutor.texto2[1]} ${responsev1.uploaded}\n${tradutor.texto2[2]} ${responsev1.duration}\n${tradutor.texto2[3]} ${responsev1.views}\n${tradutor.texto2[4]} ${responsev1.author.name}\n${tradutor.texto2[5]} ${responsev1.identifier}\n${tradutor.texto2[6]} ${responsev1.type}\n${tradutor.texto2[7]} ${responsev1.url}\n${tradutor.texto2[8]} ${responsev1.author.url}\n\n> ${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
      conn.sendMessage(m.chat, { image: { url: responsev1.thumbnail }, caption: body }, { quoted: m });

      const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${responsev1.url}`)
      const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { document: { url: responsev2 }, mimetype: 'video/mp4', fileName: `${responsev1.title}.mp4` }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `「 ✰ 」OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n> ${e}`, m);
        }
    }
};

handler.command = ['play', 'play2', 'play1doc', 'play2doc'];

export default handler;
