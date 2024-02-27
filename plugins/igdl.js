import { igdl } from '../../lib/download.js';
export default {
   names: ['Downloader'],
   tags: ['instagram'],
   command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
   start: async (m, {
      conn,
      text,
      prefix,
      command
   }) => {
      if (!text) return m.reply(`Masukan agram contoh ${prefix+command} https://www.instagram.com/p/C1Ad3suiZRu/?igsh=MTV4dHF6a2Jubmhxdw==`);
      let res = await igdl(text);
      m.adReply(loading, setting.thumbnail, m.chat);
      let data = await res.data;
      for (let media of data) {
         new Promise(resolve => setTimeout(resolve, 2000));
         conn.sendFile(m.chat, media.url, {
            quoted: m
         });
      }
   },
   limit: 5,
   premium: false
};
