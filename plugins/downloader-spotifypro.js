// TheMystic-Bot-MD@BrunoSobrino - descargas-spotifypro.js
// Creditos de los tags a @darlyn1234 y diseño a @ALBERTO9883
// Este plugins descarga por texto, album, track o playlist de spotify.
//
// Nota: antes usaba 'sanzy-spotifydl', paquete que el autor dio de baja de npm
// (2026-09-11, sin versiones disponibles) y rompía `npm install` con ENOVERSIONS.
// Ahora los metadatos vienen de la API oficial de Spotify (client credentials)
// y el audio se descarga con la API Stellar, la misma que ya usa el comando .spotify.
import axios from 'axios';
import fs from 'fs';

// Credenciales de Spotify (las mismas que ya usaba este plugin para la API de Spotify).
const SPOTIFY_CLIENT_ID = '7fb26a02133d463da465671222b9f19b';
const SPOTIFY_CLIENT_SECRET = 'd4e6f8668f414bb6a668cc5c94079ca1';

let spotifyToken = null;
let spotifyTokenExpires = 0;

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < spotifyTokenExpires) return spotifyToken;
  const res = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
    }
  });
  spotifyToken = res.data.access_token;
  spotifyTokenExpires = Date.now() + (res.data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function spotifyGet(path, params = {}) {
  const token = await getSpotifyToken();
  const res = await axios.get(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return res.data;
}

// Descarga el audio con la API Stellar (la misma que usa el comando .spotify).
async function stellarDownload(spotifyUrl) {
  const url = global.API('stellar', '/dow/spotify', { url: spotifyUrl }, 'apikey');
  const res = await axios.get(url, { responseType: 'json' });
  return res.data?.data;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function spotifyId(url) {
  return url.split('/').pop().split('?')[0];
}

function artistNames(artists) {
  return (artists || []).map((a) => a.name).join(', ');
}

function coverImage(images) {
  return images?.[0]?.url || '';
}

function infoReply(conn, m, text, image, url) {
  return conn.sendMessage(m.chat, {
    text: text.trim(),
    contextInfo: {
      forwardingScore: 9999999,
      isForwarded: true,
      externalAdReply: {
        showAdAttribution: true,
        containsAutoReply: true,
        renderLargerThumbnail: true,
        title: global.titulowm2,
        mediaType: 1,
        thumbnailUrl: image,
        mediaUrl: url,
        sourceUrl: url
      }
    }
  }, { quoted: m });
}

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_spotifypro;

  if (!text) throw `${tradutor.texto1}`;
  const isSpotifyUrl = text.match(/^(https:\/\/open\.spotify\.com\/(album|track|playlist)\/[a-zA-Z0-9]+)/i);
  if (!isSpotifyUrl && !text) throw `${tradutor.texto2}`;
  try {
    if (isSpotifyUrl) {
      if (isSpotifyUrl[2] === 'album') {
        const album = await spotifyGet(`/albums/${spotifyId(isSpotifyUrl[0])}`);
        const tracks = album.tracks?.items || [];
        let spotifyi = `${tradutor.texto3[0]}\n\n`;
        spotifyi += `\t${tradutor.texto3[1]} ${album.name}\n`;
        spotifyi += `\t${tradutor.texto3[2]} ${artistNames(album.artists)}\n`;
        spotifyi += `\t${tradutor.texto3[3]} ${album.release_date}\n`;
        spotifyi += `\t${tradutor.texto3[4]} ${tracks.length}\n\n`;
        spotifyi += `${tradutor.texto3[5]}`;
        await infoReply(conn, m, spotifyi, coverImage(album.images), isSpotifyUrl[0]);
        for (const track of tracks) {
          const data = await stellarDownload(track.external_urls.spotify);
          if (!data?.download) continue;
          await conn.sendMessage(m.chat, { audio: { url: data.download }, fileName: `${track.name}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      } else if (isSpotifyUrl[2] === 'track') {
        const track = await spotifyGet(`/tracks/${spotifyId(isSpotifyUrl[0])}`);
        let spotifyi = `${tradutor.texto4[0]}\n\n`;
        spotifyi += `\t${tradutor.texto4[1]} ${track.name}\n`;
        spotifyi += `\t${tradutor.texto4[2]} ${artistNames(track.artists)}\n`;
        spotifyi += `\t${tradutor.texto4[3]} ${formatDuration(track.duration_ms)}\n`;
        spotifyi += `\t${tradutor.texto4[4]} ${track.album.name}\n`;
        spotifyi += `\t${tradutor.texto4[5]} ${track.album.release_date}\n\n`;
        spotifyi += `${tradutor.texto4[6]}`;
        await infoReply(conn, m, spotifyi, coverImage(track.album.images), track.external_urls.spotify);
        const data = await stellarDownload(track.external_urls.spotify);
        if (!data?.download) return m.reply(tradutor.texto7);
        await conn.sendMessage(m.chat, { audio: { url: data.download }, fileName: `${track.name}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
      } else if (isSpotifyUrl[2] === 'playlist') {
        const playlist = await spotifyGet(`/playlists/${spotifyId(isSpotifyUrl[0])}`);
        const tracks = (playlist.tracks?.items || []).map((i) => i.track).filter(Boolean);
        let spotifyi = `${tradutor.texto5[0]}\n\n`;
        spotifyi += `\t${tradutor.texto5[1]} ${playlist.name}\n`;
        spotifyi += `\t${tradutor.texto5[2]} ${tracks.length}\n\n`;
        spotifyi += `${tradutor.texto5[3]}`;
        await infoReply(conn, m, spotifyi, coverImage(playlist.images), playlist.external_urls.spotify);
        let target = m.chat;
        if (m.isGroup && tracks.length > 20) {
          target = m.sender;
        }
        for (const track of tracks) {
          const data = await stellarDownload(track.external_urls.spotify);
          if (!data?.download) continue;
          await conn.sendMessage(target, { audio: { url: data.download }, fileName: `${track.name}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
        }
      }
    } else {
      const search = await spotifyGet('/search', { q: text, type: 'track', limit: 1 });
      const track = search.tracks?.items?.[0];
      if (!track) return m.reply(tradutor.texto7);
      let spotifyi = `${tradutor.texto6[0]}\n\n`;
      spotifyi += `\t${tradutor.texto6[1]} ${track.name}\n`;
      spotifyi += `\t${tradutor.texto6[2]} ${artistNames(track.artists)}\n`;
      spotifyi += `\t${tradutor.texto6[3]} ${formatDuration(track.duration_ms)}\n`;
      spotifyi += `\t${tradutor.texto6[4]} ${track.album.name}\n`;
      spotifyi += `\t${tradutor.texto6[5]} ${track.album.release_date}\n\n`;
      spotifyi += `${tradutor.texto6[6]}`;
      await infoReply(conn, m, spotifyi, coverImage(track.album.images), track.external_urls.spotify);
      const data = await stellarDownload(track.external_urls.spotify);
      if (!data?.download) return m.reply(tradutor.texto7);
      await conn.sendMessage(m.chat, { audio: { url: data.download }, fileName: `${track.name}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
    }
  } catch (error) {
    console.error(error);
    throw tradutor.texto7;
  }
};
handler.command = /^(spotifydl|spotifypro)$/i;
export default handler;
