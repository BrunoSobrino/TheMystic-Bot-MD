import fs from 'fs'
import fetch from 'node-fetch'
import { searchMusic, getAudioBuffer, getVideoBuffer } from '../src/libraries/ytmusic.js'

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

  const regex = "https://youtube.com/watch?v="
  const result = await searchMusic(args.join(' '), command === 'play2' ? 'videos' : 'songs')
  if (!result) return conn.reply(m.chat, tradutor.texto6, m);
  const body = `${tradutor.texto2[0]} ${result.title}\n${tradutor.texto2[1]} ${result.ago || '?'}\n${tradutor.texto2[2]} ${result.duration?.timestamp || '?'}\n${tradutor.texto2[3]} ${formatNumber(result.views || 0)}\n${tradutor.texto2[4]} ${result.author?.name || '?'}\n${tradutor.texto2[5]} ${result.videoId}\n${tradutor.texto2[6]} ${result.type}\n${tradutor.texto2[7]} ${result.url}\n${tradutor.texto2[8]} ${result.author?.url || ''}\n\n${tradutor.texto2[9]} ${additionalText}, ${tradutor.texto2[10]}`.trim();
  if (result.thumbnail) {
    await conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: body }, { quoted: m });
  } else {
    await conn.sendMessage(m.chat, { text: body }, { quoted: m });
  }

  if (command === 'play') {
    try {
      const { buffer, mimeType } = await getAudioBuffer(result.videoId);
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: mimeType }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en YouTube Music audio, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const audioLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { audio: { url: audioLink }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, tradutor.texto6, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp3:', err2);
        conn.reply(m.chat, tradutor.texto6, m);
      }
    }
  }

  if (command === 'play2') {
    try {
      const { buffer, mimeType } = await getVideoBuffer(result.videoId);
      await conn.sendMessage(m.chat, { video: buffer, mimetype: mimeType, fileName: `${result.title}.mp4` }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en YouTube Music video, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const videoLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { video: { url: videoLink }, mimetype: "video/mp4" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, tradutor.texto6, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp4:', err2);
        conn.reply(m.chat, tradutor.texto6, m);
      }
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
handler.command = /^(play|play2)$/i;

export default handler;

function formatNumber(num) {
  return num.toLocaleString();
}
