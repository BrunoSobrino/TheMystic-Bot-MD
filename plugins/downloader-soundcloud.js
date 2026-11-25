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
    // La API nueva devuelve el autor como texto y otros nombres de campos
    const authorName = downloadres.author?.username || downloadres.author || "-";
    const authorId = downloadres.author?.id || downloadres.id || "-";
    const followers = downloadres.author?.followers_count ?? downloadres.followers ?? "-";
    const likes = downloadres.author?.likes_count ?? downloadres.likes ?? "-";
    const created = downloadres.author?.created_at || downloadres.created_at;
    const imgUrl = downloadres.imageURL || downloadres.image || "";
    const audioUrl = downloadres.url || downloadres.download;
    const soundcloudt = `${tradutor.texto4[0]}\n
${tradutor.texto4[1]} ${downloadres.title || "-"}
${tradutor.texto4[2]} ${authorName}
${tradutor.texto4[3]} ${authorId}
${tradutor.texto4[4]} ${followers}
${tradutor.texto4[5]} ${likes}
${tradutor.texto4[6]} ${created ? new Date(created).toLocaleDateString() : "-"}
${tradutor.texto4[7]} ${shdata.link || "-"}`;
    const imgxd =
      imgUrl.replace("t500x500", "t1080x1080") ||
      imgUrl;
    await conn.sendFile(m.chat, imgxd, "", soundcloudt, m);
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
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
