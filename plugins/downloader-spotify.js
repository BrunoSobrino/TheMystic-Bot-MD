import axios from 'axios';
import fs from 'fs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_spotify;

  if (!text) return m.reply(`${tradutor.texto1} _${usedPrefix + command} Good Feeling - Flo Rida_`);

  try {
    let songInfo = await spotifyxv(text);
    if (!songInfo.length) return m.reply(tradutor.texto2);
    let song = songInfo[0];

    const res = await axios.get(`${global.APIs.stellar}/dow/spotify?url=${song.url}&apikey=${global.APIKeys[global.APIs.stellar]}`, { responseType: 'json' });
    const data = res.data?.data;

    if (!data?.download) return m.reply(tradutor.texto3);

    let spotifyi = ` _${tradutor.texto2[0]}_\n\n`;
    spotifyi += ` ${tradutor.texto2[1]} ${data.title}\n`;
    spotifyi += ` ${tradutor.texto2[2]} ${data.artist}\n`; 
    spotifyi += ` ${tradutor.texto2[3]} ${song.album}\n`;
    spotifyi += ` ${tradutor.texto2[4]} ${data.duration}\n\n`;
    spotifyi += `> ${tradutor.texto2[5]}`;

    await conn.sendMessage(m.chat, {
      text: spotifyi.trim(),
      contextInfo: {
        forwardingScore: 9999999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          containsAutoReply: true,
          renderLargerThumbnail: true,
          title: global.titulowm2,
          mediaType: 1,
          thumbnailUrl: data.image,
          mediaUrl: data.download,
          sourceUrl: data.download
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: data.download },
      fileName: `${data.title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m });

  } catch (e) {
    m.reply(`${tradutor.texto3}`);
  }
};

handler.help = ['spotify <text>'];
handler.tags = ['downloader'];
handler.command = ['spotify', 'music'];
export default handler;

async function spotifyxv(query) {
  const res = await axios.get(`${global.APIs.stellar}/search/spotify?query=${query}&apikey=${global.APIKeys[global.APIs.stellar]}`, { responseType: 'json' });
  if (!res.data?.status || !res.data?.data?.length) return [];

  const firstTrack = res.data.data[0];

  return [{
    name: firstTrack.title,
    artista: [firstTrack.artist],
    album: firstTrack.album,
    duracion: firstTrack.duration,
    url: firstTrack.url,
    imagen: firstTrack.image || ''
  }];
}

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
    const filePath = `./src/tmp/${randomName}`;
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
         spotifyi += `        ◦  *Título:* ${spty.data.name}\n`
         spotifyi += `        ◦  *Artista:* ${spty.data.artists}\n`
         spotifyi += `        ◦  *Album:* ${spty.data.album_name}\n`                 
         spotifyi += `        ◦  *Publicado:* ${spty.data.release_date}\n\n`   
         spotifyi += `El audio se esta enviando, espere un momento..`
    await conn.sendMessage(m.chat, {text: spotifyi.trim(), contextInfo: {forwardingScore: 9999999, isForwarded: true, "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.titulowm2, "containsAutoReply": true, "mediaType": 1, "thumbnail": img, "thumbnailUrl": img, "mediaUrl": linkDL, "sourceUrl": linkDL}}}, {quoted: m});
    await conn.sendMessage(m.chat, {audio: fs.readFileSync(`./src/tmp/${randomName}`), fileName: `${spty.data.name}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
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
