import axios from 'axios'
import fetch from 'node-fetch'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import search from 'yt-search'
async function spotifyxv(query) {
let token = await tokens();
let response = await axios({
method: 'get',
url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track',
headers: {
Authorization: 'Bearer ' + token,
},
})
const tracks = response.data.tracks.items
const results = tracks.map((track) => ({
name: track.name,
artista: track.artists.map((artist) => artist.name),
album: track.album.name,
duracion: timestamp(track.duration_ms),
url: track.external_urls.spotify,
imagen: track.album.images.length ? track.album.images[0].url : '',
}))
return results
}
async function tokens() {
const response = await axios({
method: 'post',
url:
'https://accounts.spotify.com/api/token',
headers: {
'Content-Type': 'application/x-www-form-urlencoded',
Authorization: 'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64'),
},
data: 'grant_type=client_credentials',
})
return response.data.access_token
}
function timestamp(time) {
const minutes = Math.floor(time / 60000);
const seconds = Math.floor((time % 60000) / 1000);
return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
async function getBuffer(url, options) {
try {
options = options || {};
const res = await axios({
method: 'get',
url,
headers: {
DNT: 1,
'Upgrade-Insecure-Request': 1,
},
...options,
responseType: 'arraybuffer',
});
return res.data;
} catch (err) {
return err;
}}
async function getTinyURL(text) {
try {
let response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
return response.data;
} catch (error) {
return text;
}}
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `*DEBE DE USAR EL COMANDO COMO EN ESTE EJEMPLO:*\n${usedPrefix + command} *tu foto*`
try {
conn.reply(m.chat, '🍟  *Enviando su música de Spotify*', m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
title: packname,
body: wm,
previewType: 0, thumbnail: imagen1,
sourceUrl: channel }}})
//m.react(rwait)
let songInfo = await spotifyxv(text)
if (!songInfo.length) throw `*No se encontró la canción*`
let res = songInfo[0]
let fileSizeInMB = (await getBuffer(res.url)).length / (1024 * 1024)
let shortURL = await getTinyURL(res.url)
let spotifyi = ` _${tradutor.texto2[0]}_\n\n`
        spotifyi += ` ${tradutor.texto2[1]} ${spty.title}\n`
        spotifyi += ` ${tradutor.texto2[2]} ${spty.artist}\n`
        spotifyi += ` ${tradutor.texto2[3]} ${spty.album}\n`                 
        spotifyi += ` ${tradutor.texto2[4]} ${spty.year}\n\n`   
        spotifyi += `> ${tradutor.texto2[5]}`

let resImg = await fetch(res.imagen)
let thumbb = await resImg.buffer()
let { videos } = await search(res.name)
let q = '128kbps'
let v = videos[0].url
let yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v))
let dl_url = await yt.audio[q].download()
let ttl = await yt.title
let size = await yt.audio[q].fileSizeH
let img = await getBuffer(res.imagen)
conn.sendMessage(m.chat, { audio: { url: dl_url }, fileName: `${ttl}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m })
await conn.sendMessage(m.chat, {text: spotifyi, contextInfo: {forwardingScore: 9999999, isForwarded: true, "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.wm, "containsAutoReply": true, "mediaType": 1, "thumbnail": img, "thumbnailUrl": img, "mediaUrl": shortURL, "sourceUrl": shortURL}}}, {quoted: m});
//m.react(done)
} catch (error) {
}}
handler.tags = ['descargas']
handler.help = ['spotify']
handler.command = /^(spotify|music)$/i
export default handler

//***Código antiguo/obsoleto.

/*import fetch from 'node-fetch';
import Spotify from 'spotifydl-x';
import fs from 'fs';
import NodeID3 from 'node-id3';
import axios from 'axios';
import {find_lyrics} from '@brandond/findthelyrics';

const credentials = {
  clientId: 'acc6302297e040aeb6e4ac1fbdfd62c3',
  clientSecret: '0e8439a1280a43aba9a5bc0a16f3f009',
};
const spotify = new Spotify.default(credentials);

const handler = async (m, { conn, text }) => {
 if (!text) throw `*[❗] Ingrese el nombre de alguna canción de spotify.*`;
  try {
    const resDL = await fetch(`https://api.lolhuman.xyz/api/spotifysearch?apikey=${lolkeysapi}&query=${text}`);
    const jsonDL = await resDL.json();
    const linkDL = jsonDL.result[0].link;
    const spty = await spotifydl(linkDL);
    const getRandom = (ext) => {
      return `${Math.floor(Math.random() * 10000)}${ext}`;
    };
    const randomName = getRandom('.mp3');
    const filePath = `./tmp/${randomName}`;
    const artist = spty.data.artists.join(', ') || '-';
    const img = await (await fetch(`${spty.data.cover_url}`)).buffer()  
    const letra_s = await find_lyrics(spty.data.name ? spty.data.name : '');
    let letra;
    letra = `${letra_s ? letra_s + '\n\n🤴🏻 Descarga por BrunoSobrino & TheMystic-Bot-MD 🤖' : '🤴🏻 Descarga por BrunoSobrino & TheMystic-Bot-MD 🤖'}`  
    const tags = {
      title: spty.data.name || '-',
      artist: artist,
      album: spty.data.album_name || '-',
      year: spty.data.release_date || '-',
      genre: 'Música',
      comment: {
        language: 'spa',
        text: letra,
      },
      unsynchronisedLyrics: {
        language: 'spa',
        text: letra,
      },
      image: {
        mime: 'image/jpeg',
        type: {
          id: 3,
          name: 'front cover',
        },
        description: 'Spotify Thumbnail',
        imageBuffer: await axios.get(spty.data.cover_url, {responseType: "arraybuffer"}).then((response) => Buffer.from(response.data, "binary")),
      },
      mimetype: 'image/jpeg',
      copyright: 'Copyright Darlyn ©2023',
    };
    await fs.promises.writeFile(filePath, spty.audio);
    await NodeID3.write(tags, filePath);
    let spotifyi = `*• 💽 Spotify Download •*\n\n`
         spotifyi += `	◦  *Título:* ${spty.data.name}\n`
         spotifyi += `	◦  *Artista:* ${spty.data.artists}\n`
         spotifyi += `	◦  *Album:* ${spty.data.album_name}\n`                 
         spotifyi += `	◦  *Publicado:* ${spty.data.release_date}\n\n`   
         spotifyi += `El audio se esta enviando, espere un momento..`
    await conn.sendMessage(m.chat, {text: spotifyi.trim(), contextInfo: {forwardingScore: 9999999, isForwarded: true, "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.titulowm2, "containsAutoReply": true, "mediaType": 1, "thumbnail": img, "thumbnailUrl": img, "mediaUrl": linkDL, "sourceUrl": linkDL}}}, {quoted: m});
    await conn.sendMessage(m.chat, {audio: fs.readFileSync(`./tmp/${randomName}`), fileName: `${spty.data.name}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
  } catch (error) {
    console.error(error);
    throw '*[❗] Error, no se encontraron resultados.*';
  }
};
handler.command = /^(spotify|music)$/i;
export default handler;

async function spotifydl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await spotify.getTrack(url);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tiempo de espera agotado'));
        }, 300000);
      });
      const audioPromise = spotify.downloadTrack(url);
      const audio = await Promise.race([audioPromise, timeoutPromise]);
      resolve({ data: res, audio });
    } catch (error) {
      reject(error);
    }
  });
}*/
