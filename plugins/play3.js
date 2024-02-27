import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import {youtubedl, youtubedlv2} from '@bochilteam/scraper';
const handler = async (m, {conn, command, args, text, usedPrefix}) => {
let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
if (!text) throw `*ما الذي تبحث عنه؟ الرجاء إدخال اسم؟*\n\n*على سبيل مثال:*\n*${usedPrefix + command} سورة يس*`
try {
const yt_play = await search(args.join(' '))
let additionalText = ''
if (command === 'play3' || command == 'playaudiodoc') {
additionalText = '𝘼𝙪𝙙𝙞𝙤'
} else if (command === 'play4' || command == 'playvideodoc') {
additionalText = '𝙑𝙞𝙙𝙚𝙤'
}
const texto1 = `•━━『 𝐏𝐋𝐀𝐘𝐃𝐎𝐂 』━━•

📌 *العنوان:* ${yt_play[0].title}
📆 *تاريخ النشر:* ${yt_play[0].ago}
⌚ *الوقت:* ${secondString(yt_play[0].duration.seconds)}
👀 *المشاهدات:* ${MilesNumber(yt_play[0].views)}
👤 *المؤلف:* ${yt_play[0].author.name}
📇 *الوصف:* ${description}
🔗 *رابط:* ${yt_play[0].url}

•━━『 𝐏𝐋𝐀𝐘𝐃𝐎𝐂 』━━•

> إرسال ${additionalText},*انتظر لحظة....*`.trim()
await conn.sendMessage(m.chat, {
text: texto1,
contextInfo: {
externalAdReply: {
title: yt_play[0].title,
body: wm,
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })
if (command == 'play3' || command == 'playaudiodoc') {
try {
const q = '128kbps';
const v = yt_play[0].url;
const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
const dl_url = await yt.audio[q].download();
const ttl = await yt.title;
const size = await yt.audio[q].fileSizeH;
let cap = `*📥هنا الصوت في المستندات*\n\n❏ *العنوان:* ${ttl}\n❏ *الوزن:* ${size}`.trim()
await conn.sendMessage(m.chat, {document: {url: dl_url}, caption: cap, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3`}, {quoted: m});
/*await conn.sendMessage(m.chat, { document: { url: dl_url }, caption: cap, mimetype: 'audio/mpeg', contextInfo: {
externalAdReply: {
title: ttl,
body: "",
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })*/
} catch {
try {
const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${yt_play[0].url}`);
const lolh = await lolhuman.json();
const n = lolh.result.title || 'error';
await conn.sendMessage(m.chat, {document: {url: lolh.result.link}, caption: `*『 📥هنا الصوت في المستندات📥  』*\n\n❏ *العنوان:*${n}\n❏ *الوزن:*${n2}`, fileName: `${n}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
/*await conn.sendMessage(m.chat, { document: { url: lolh.result.link }, caption: `╭━❰  ${wm}  ❱━⬣\n┃📥 YOUTUBE DL 📥\n┃ও *TÍTULO | TITLE:* \n┃» ${n}\n╰━━━━━❰ *𓃠 ${vs}* ❱━━━━⬣`, fileName: `${n}.mp3`, mimetype: 'audio/mpeg', contextInfo: {
externalAdReply: {
title: n, 
body: "",
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })   */
} catch {
try {
const searchh = await yts(yt_play[0].url);
const __res = searchh.all.map((v) => v).filter((v) => v.type == 'video');
const infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId);
const ress = await ytdl.chooseFormat(infoo.formats, {filter: 'audioonly'});
/*await conn.sendMessage(m.chat, { document: { url: ress.url }, fileName: __res[0].title + '.mp3', mimetype: 'audio/mpeg', contextInfo: {
externalAdReply: {
title: __res[0].title,
body: "",
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })   */
await conn.sendMessage(m.chat, {document: {url: ress.url}, caption: `${wm}`, fileName: __res[0].title + '.mp3', mimetype: 'audio/mp4'}, {quoted: m});
} catch {
}}}}
if (command == 'play4' || command == 'playvideodoc') {
try {
const qu = '360';
const q = qu + 'p';
const v = yt_play[0].url;
const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
const dl_url = await yt.video[q].download();
const ttl = await yt.title;
const size = await yt.video[q].fileSizeH;
/*await conn.sendMessage(m.chat, { document: { url: dl_url }, caption: `╭━❰  ${wm}  ❱━⬣\n┃📥 YOUTUBE DL 📥\n┃ও *TÍTULO | TITLE:* \n┃» ${ttl}\n┃﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘\n┃ও *PESO | SIZE:*\n┃» ${size}\n╰━━━━━❰ *𓃠 ${vs}* ❱━━━━⬣`, fileName: `${ttl}.mp3`, mimetype: 'audio/mpeg', contextInfo: {
externalAdReply: {
title: ttl,
body: "",
thumbnailUrl: yt_play[0].thumbnail, 
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}}} , { quoted: m })   */
await conn.sendMessage(m.chat, {document: {url: dl_url}, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `*📥هنا الصوت في المستندات📥*\n\n❏ *العنوان:* ${ttl}\n❏ *الوزن:* ${size}`, thumbnail: await fetch(yt.thumbnail)}, {quoted: m});
} catch {
try {
const mediaa = await ytMp4(yt_play[0].url);
await await conn.sendMessage(m.chat, {document: {url: dl_url}, caption: cap, mimetype: 'video/mp4', fileName: ttl + `.mp4`}, {quoted: m});
} catch {
try {
const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytvideo2?apikey=${lolkeysapi}&url=${yt_play[0].url}`);
const lolh = await lolhuman.json();
const n = lolh.result.title || 'error';
const n2 = lolh.result.link;
const n3 = lolh.result.size;
const n4 = lolh.result.thumbnail;
await conn.sendMessage(m.chat, {document: {url: n2}, fileName: `${n}.mp4`, mimetype: 'video/mp4', caption: `*『 📥هنا الصوت في المستندات📥  』*\n❏ *العنوان:* ${n}\n❏ *الوزن:* ${n3}`, thumbnail: await fetch(n4)}, {quoted: m});
} catch {
}}}}
} catch {
  await conn.reply(m.chat, `${lenguajeGB['smsAvisoFG']()}خطأ، لم يكن من الممكن تنزيل الفيديو/الصوت، حاول مرة أخرى`, fkontak, m) 
handler.limit = 0
}}
handler.help = ['play3', 'play4'].map((v) => v + ' < busqueda >');
handler.tags = ['downloader'];
handler.command = /^(playaudiodoc|playdoc|playdoc2|play3|play4|playvideodoc)$/i;
handler.limit = 4
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
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
if (bytes === 0) return 'n/a';
const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
if (i === 0) resolve(`${bytes} ${sizes[i]}`);
resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
})}

async function ytMp3(url) {
return new Promise((resolve, reject) => {
ytdl.getInfo(url).then(async (getUrl) => {
const result = [];
for (let i = 0; i < getUrl.formats.length; i++) {
const item = getUrl.formats[i];
if (item.mimeType == 'audio/webm; codecs=\"opus\"') {
const {contentLength} = item;
const bytes = await bytesToSize(contentLength);
result[i] = {audio: item.url, size: bytes};
}}
const resultFix = result.filter((x) => x.audio != undefined && x.size != undefined);
const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
const tinyUrl = tiny.data;
const title = getUrl.videoDetails.title;
const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
resolve({title, result: tinyUrl, result2: resultFix, thumb});
}).catch(reject);
})}

async function ytMp4(url) {
return new Promise(async (resolve, reject) => {
ytdl.getInfo(url).then(async (getUrl) => {
const result = [];
for (let i = 0; i < getUrl.formats.length; i++) {
const item = getUrl.formats[i];
if (item.container == 'mp4' && item.hasVideo == true && item.hasAudio == true) {
const {qualityLabel, contentLength} = item;
const bytes = await bytesToSize(contentLength);
result[i] = {video: item.url, quality: qualityLabel, size: bytes};
}}
const resultFix = result.filter((x) => x.video != undefined && x.size != undefined && x.quality != undefined);
const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
const tinyUrl = tiny.data;
const title = getUrl.videoDetails.title;
const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
resolve({title, result: tinyUrl, rersult2: resultFix[0].video, thumb});
}).catch(reject);
})}

async function ytPlay(query) {
return new Promise((resolve, reject) => {
yts(query).then(async (getData) => {
const result = getData.videos.slice( 0, 5 );
const url = [];
for (let i = 0; i < result.length; i++) {
url.push(result[i].url);
}
const random = url[0];
const getAudio = await ytMp3(random);
resolve(getAudio);
}).catch(reject);
})}

async function ytPlayVid(query) {
return new Promise((resolve, reject) => {
yts(query).then(async (getData) => {
const result = getData.videos.slice( 0, 5 );
const url = [];
for (let i = 0; i < result.length; i++) {
url.push(result[i].url);
}
const random = url[0];
const getVideo = await ytMp4(random);
resolve(getVideo);
}).catch(reject);
})}
