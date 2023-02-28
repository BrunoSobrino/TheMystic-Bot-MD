import ytdl from "ytdl-core";
import fs from "fs";

let handler = async (m, { conn, args, isPrems, isOwner }) => {
  const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };
  if (args.length === 0) {
    m.reply(`*Ingresa un enlace de YouTube.*`);
    return;
  }
  try {
    let urlYt = args[0];
    if (!urlYt.startsWith("http")) {
      m.reply(`Ingresa un link de youtube`);
      return;
    }
    let infoYt = await ytdl.getInfo(urlYt);
    let titleYt = infoYt.videoDetails.title;
    let randomName = getRandom(".mp4");
    const stream = ytdl(urlYt, {
      filter: (info) => info.itag == 22 || info.itag == 18,
    }).pipe(fs.createWriteStream(`./${randomName}`));
    m.reply(`*_⏰ Enviando video... ⏰_*`);
    console.log("Descargando ->", urlYt);
    await new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
    });
    let stats = fs.statSync(`./${randomName}`);
    let fileSizeInBytes = stats.size;
    let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log("Tamaño del video: " + fileSizeInMegabytes);
    if (fileSizeInMegabytes <= 999) {
      conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(`./${randomName}`),
          fileName: `${titleYt}.mp4`,
          mimetype: "video/mp4",
        },
        { quoted: m }
      );
    } else {
      m.reply(`*El archivo es superior a 999 MB.*`);
    }
    fs.unlinkSync(`./${randomName}`);
  } catch (e) {
    m.reply(e.toString());
  }
};
handler.help = ["ytd"];
handler.tags = ["downloader"];
handler.command = ["videodoc", "documentvid", "videodocumento"];
handler.exp = 3;

export default handler;
