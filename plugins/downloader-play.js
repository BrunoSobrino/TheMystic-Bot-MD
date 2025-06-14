import fetch from 'node-fetch';
import axios from 'axios';
import yts from 'yt-search';
import tools from '@takanashi-soft/tools';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
const datas = global;
const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
const tradutor = _translate.plugins.descargas_play

if (!text) throw `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`;      
let additionalText = '';
if (['play'].includes(command)) {
 additionalText = 'audio';
} else if (['play2'].includes(command)) {
 additionalText = 'vídeo';
}

const yt_play = await search(args.join(' '));
const texto1 = `${tradutor.texto2[0]} ${yt_play[0].title}\n${tradutor.texto2[1]} ${yt_play[0].ago}\n${tradutor.texto2[2]} ${yt_play[0].duration.timestamp}\n${tradutor.texto2[3]} ${yt_play[0].views}\n${tradutor.texto2[4]} ${yt_play[0].author.name}\n${tradutor.texto2[5]} ${yt_play[0].videoId}\n${tradutor.texto2[6]} ${yt_play[0].type}\n${tradutor.texto2[7]} ${yt_play[0].url}\n${tradutor.texto2[8]} ${yt_play[0].author.url}\n\n${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
conn.sendMessage(m.chat, { image: { url: yt_play[0].thumbnail }, caption: texto1 }, { quoted: m });

if (command === 'play') {
try {
const audiodlp = await tools.downloader.ytmp3(yt_play[0].url);
const downloader = audiodlp.download;
conn.sendMessage(m.chat, { audio: { url: downloader }, mimetype: "audio/mpeg" }, { quoted: m });
} catch (error) {
 console.log(error);
 conn.reply(m.chat, tradutor.texto6, m);
 }
}

if (command === 'play2') {
try {
const videodlp = await tools.downloader.ytmp4(yt_play[0].url);
const downloader = videodlp.download;
conn.sendMessage(m.chat, { video: { url: downloader }, mimetype: "video/mp4" }, { quoted: m });
} catch (error) {
 console.log(error);
 conn.reply(m.chat, tradutor.texto6, m);
  }
 }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
handler.command = ['play', 'play2'];

export default handler;

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
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
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
