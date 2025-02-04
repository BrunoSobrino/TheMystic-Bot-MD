import ytdl from 'ytdl-core';
import fs from 'fs';

const handler = async (m, {conn, args, isPrems, isOwner, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.downloader_ytvideodl;

  const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };
  if (args.length === 0) {
    m.reply(`${tradutor.texto1}`);
    return;
  }
  try {
    const urlYt = args[0];
    if (!urlYt.startsWith('http')) {
      m.reply(`${tradutor.texto2}`);
      return;
    }
    const infoYt = await ytdl.getInfo(urlYt);
    const titleYt = infoYt.videoDetails.title;
    const randomName = getRandom('.mp4');
    const stream = ytdl(urlYt, {filter: (info) => info.itag == 22 || info.itag == 18}).pipe(fs.createWriteStream(`./src/tmp/${randomName}`));
    m.reply(global.wait);
    // console.log("Descargando ->", urlYt);
    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
    });
    const stats = fs.statSync(`./src/tmp/${randomName}`);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    // console.log("Tamaño del video: " + fileSizeInMegabytes);
    if (fileSizeInMegabytes <= 999) {
      if (command == 'ytshort') {
        conn.sendMessage( m.chat, {video: fs.readFileSync(`./src/tmp/${randomName}`), fileName: `${titleYt}.mp4`, mimetype: 'video/mp4'}, {quoted: m});
      } else {
        conn.sendMessage( m.chat, {document: fs.readFileSync(`./src/tmp/${randomName}`), fileName: `${titleYt}.mp4`, mimetype: 'video/mp4'}, {quoted: m});
      }
    } else {
      m.reply(`${tradutor.texto3}`);
    }
    fs.unlinkSync(`./src/tmp/${randomName}`);
  } catch (e) {
    m.reply(e.toString());
  }
};
handler.help = ['ytd'];
handler.tags = ['downloader'];
handler.command = ['videodoc', 'documentvid', 'videodocumento', 'ytshort'];
handler.exp = 3;
export default handler;
