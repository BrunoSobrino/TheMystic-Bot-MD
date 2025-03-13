import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import { ogmp3 } from '../src/libraries/youtubedl.js'; 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl");

let handler = async (m, { conn, text, usedPrefix, command }) => {    
const datas = global;
const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
const tradutor = _translate.plugins.descargas_play;
if (!text) throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
      
  let additionalText = '';
  if (['play', 'play1doc'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2', 'play2doc'].includes(command)) {
    additionalText = 'vídeo';
 }

const yt_play = await search(args.join(' '));
const ytplay2 = await yts(text);
const texto1 = `
${tradutor.texto2[0]} 
${yt_play[0].title}

PUBLICADO:
${yt_play[0].ago}

duración:
${secondString(yt_play[0].duration.seconds)}

vistas:
${MilesNumber(yt_play[0].views)}

autor:
${yt_play[0].author.name}

link:
${yt_play[0].url.replace(/^https?:\/\//, '')}
`.trim();

conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

if (command === 'play') {
try {
const audiodlp = await ytmp3(yt_play[0].url);
conn.sendMessage(m.chat, { audio: audiodlp, mimetype: "audio/mpeg" }, { quoted: m });
} catch {   
try {                   
const [input, quality = '320'] = text.split(' '); 
const validQualities = ['64', '96', '128', '192', '256', '320'];
const selectedQuality = validQualities.includes(quality) ? quality : '320';
const res = await ogmp3.download(yt_play[0].url, selectedQuality, 'audio');
await conn.sendMessage(m.chat, { audio: { url: res.result.download }, mimetype: 'audio/mpeg', fileName: `audio.mp3` }, { quoted: m });
} catch {   
try {
const res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${yt_play[0].url}`);
let { data } = await res.json();
await conn.sendMessage(m.chat, { audio: { url: data.dl }, mimetype: 'audio/mpeg' }, { quoted: m});
} catch {
try {  
const res = await fetch(`https://api.agatz.xyz/api/ytmp3?url=${yt_play[0].url}`)
let data = await res.json();
await conn.sendMessage(m.chat, { audio: { url: data.data.downloadUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
} catch {
try {
      const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${yt_play[0].url}`)
      const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { audio: { url: responsev2 }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `[ ❌️ ] OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n${e}`, m);
        }
    }}}}}

    if (command === 'play2') {
        try {
const video = await ytmp4(yt_play[0].url);
await conn.sendMessage(m.chat, { video: { url: video }, fileName: `video.mp4`, mimetype: 'video/mp4', caption: `${yt_play[0].title}`}, { quoted: m })
} catch {
try {   
const res = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${yt_play[0].url}`);
let { data } = await res.json();
await conn.sendMessage(m.chat, { video: { url: data.dl }, fileName: `video.mp4`, mimetype: 'video/mp4', caption: `${yt_play[0].title}`}, { quoted: m })
} catch {
try {  
const res = await fetch(`https://api.agatz.xyz/api/ytmp4?url=${yt_play[0].url}`)
let data = await res.json();
await conn.sendMessage(m.chat, { video: { url: data.data.downloadUrl }, fileName: `video.mp4`, caption: `${yt_play[0].title}` }, { quoted: m }) 
} catch {
try {
const res = await fetch(`https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${yt_play[0].url}`)
let { result } = await res.json()
await conn.sendMessage(m.chat, { video: { url: result.download.url }, fileName: `video.mp4`, caption: `${yt_play[0].title}` }, { quoted: m }) 
} catch {
try {
const axeelApi = `https://axeel.my.id/api/download/video?url=${yt_play[0].url}`;
const axeelRes = await fetch(axeelApi);
const axeelJson = await axeelRes.json();
if (axeelJson && axeelJson.downloads?.url) {
const videoUrl = axeelJson.downloads.url;
await conn.sendMessage(m.chat, { video: { url: videoUrl }, fileName: `${yt_play[0].title}.mp4`, caption: `${yt_play[0].title}` }, { quoted: m }) 
}} catch {
try {              
const apidownload = await axios.get(`https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${yt_play[0].url}`)
      const responsev2 = await apidownload.data.data.download;
            
      await conn.sendMessage(m.chat, { video: { url: responsev2 }, mimetype: 'video/mp4' }, { quoted: m });
        } catch (e) {
        conn.reply(m.chat, `[ ❌️ ] OCURRIO UN FALLO AL PROCESAR SU SOLICITUD\n\n${e}`, m);
        }
    }}}}}}
  
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
