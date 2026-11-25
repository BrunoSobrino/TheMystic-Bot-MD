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
    const soundcloudt = `${tradutor.texto4[0]}\n
${tradutor.texto4[1]} ${downloadres.title || "-"}
${tradutor.texto4[2]} ${downloadres.author.username || "-"}
${tradutor.texto4[3]} ${downloadres.author.id || "-"}
${tradutor.texto4[4]} ${downloadres.author.followers_count || "-"}
${tradutor.texto4[5]} ${downloadres.author.likes_count || "-"}
${tradutor.texto4[6]} ${new Date(downloadres.author.created_at).toLocaleDateString() || "-"}
${tradutor.texto4[7]} ${shdata.link || "-"}`;
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
