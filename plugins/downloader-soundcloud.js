import axios from "axios";

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(
    fs.readFileSync(`./src/languages/${idioma}.json`),
  );
  const tradutor = _translate.plugins.downloader_soundcloud;
  if (!text) throw `${tradutor.texto1}`;
  try {
    const searchxd = await axios.get(global.BASE_API_DELIRIUS + "/search/soundcloud",
      {
        params: {
          q: text,
          limit: 1
        },
      },
    );
    const shdata = searchxd.data.data[0];
    const downloadzd = await axios.get(global.BASE_API_DELIRIUS + "/download/soundcloud",
      {
        params: {
          url: shdata.link,
        },
      },
    );
    const downloadres = downloadzd.data.data;
    const soundcloudt = `*亗 S O U N D C L O U D*\n
*› Titulo :* ${downloadres.title || "-"}
*› Artista:* ${downloadres.author.username || "-"}
*› Id :* ${downloadres.author.id || "-"}
*› Followers :* ${downloadres.author.followers_count || "-"}
*› Likes :* ${downloadres.author.likes_count || "-"}
*› Publicado :* ${new Date(downloadres.author.created_at).toLocaleDateString() || "-"}
*› Url :* ${shdata.link || "-"}`;
    const imgxd =
      downloadres.imageURL.replace("t500x500", "t1080x1080") ||
      downloadres.imageURL;
    await conn.sendFile(m.chat, imgxd, "", soundcloudt, m);
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: downloadres.url },
        fileName: `${downloadres.title}.mp3`,
        mimetype: "audio/mpeg",
      },
      { quoted: m },
    );
  } catch {
    throw `${tradutor.texto3}`;
  }
};
handler.command = /^(soundcloud|cover)$/i;
export default handler;
