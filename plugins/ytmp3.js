import { ytmp4 } from '../../lib/download.js'
export default {
   names: ['Downloader'],
   tags: ['ytmp3'],
   command: ['ytmp3', 'yta', 'ytaudio'],
   start: async (m, {
      conn,
      text,
      prefix,
      command,
      Format
   }) => {
      if (!text) return m.reply(`Masukan link kontolnya! \nContoh: ${prefix + command} https://youtu.be/uNkO9WWIzHE`);
      let { title, video } = await ytmp4(text);
      m.adReply(loading, setting.thumbnail, m.chat);
      let buffer = await Format.getBuffer(video);
      let result = await Format.mp3(buffer);
      conn.sendMessage(m.chat, {
         document: result,
         mimetype: 'audio/mpeg',
         fileName: `${title}~Ruhend-MD.mp3`
      }, {
         quoted: m
      });
   },
   limit: 5,
   premium: false
};
