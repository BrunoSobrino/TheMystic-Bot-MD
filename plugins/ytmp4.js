import { ytmp4 } from '../../lib/download.js'
export default {
   names: ['Downloader'],
   tags: ['ytmp4'],
   command: ['ytmp4', 'ytv'],
   start: async (m, {
      conn,
      text,
      prefix,
      command,
      Format
   }) => {
      if (!text) return m.reply(`Masukan Link Youtubenya ${prefix+command} https://youtu.be/MvsAesQ-4zA`)
      let { title, size, video, quality } = await ytmp4(text)     
      let Ytmp4 = ` 📽 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐕𝐈𝐃𝐄𝐎\n`
      Ytmp4 += ` ⭔ Judul : ${title}\n`
      Ytmp4 += ` ⭔ Kualitas : ${quality}\n`
      Ytmp4 += ` ⭔ Size : ${size}`
      m.adsReply(Ytmp4, setting.thumbnail, m.chat)
      let media = await Format.streamFile(conn, video, 'mp4', m)
      conn.docFile(m.chat, media, `${title}-${quality}~Ruhend-MD.mp4`, '', 'video/mp4', m)      
   },
   limit: 10,
   premium: false
};
