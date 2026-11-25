import fs from 'fs'
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
      console.log('❌ Error al descargar el audio:', error);
      conn.reply(m.chat, tradutor.texto6, m);
    }
  }

  if (command === 'play2') {
    try {
      const { buffer, mimeType } = await getVideoBuffer(result.videoId);
      await conn.sendMessage(m.chat, { video: buffer, mimetype: mimeType, fileName: `${result.title}.mp4` }, { quoted: m });
    } catch (error) {
      console.log('❌ Error al descargar el video:', error);
      conn.reply(m.chat, tradutor.texto6, m);
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
