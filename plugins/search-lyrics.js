import { getTracks } from "@green-code/music-track-data";
import { googleImage } from "@bochilteam/scraper";
import cheerio from "cheerio";
import fs from "fs";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma =
    datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(
    fs.readFileSync(`./src/languages/${idioma}.json`),
  );
  const tradutor = _translate.plugins.buscador_lyrics;
  const teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : "";
  if (!teks) throw `*${tradutor.texto1} ${usedPrefix + command} beret ojala*`;
  try {
    const result = await getTracks(teks);
    let lyrics;
    if (result) {
      lyrics = await searchLyrics(`${result[0]?.artist} ${result[0]?.title}`);
    } else {
      lyrics = await searchLyrics(`${teks}`);
    }
    const tituloL = result[0].title ? result[0].title : lyrics.title;
    const artistaL = result[0].artist ? result[0].artist : lyrics.artist;
    const res = await fetch(
      global.API("https://some-random-api.com", "/lyrics", {
        title: artistaL + tituloL,
      }),
    );
    const json = await res.json();
    let img;
    try {
      img = result.album.artwork;
    } catch {
      try {
        img = json.thumbnail.genius;
      } catch {
        try {
          const bochil = await googleImage(`${artistaL} ${tituloL}`);
          img = await bochil.getRandom();
        } catch {
          img = lyrics.image;
        }
      }
    }

    const previewUrl = result[0]?.preview
      .replace("http://cdn-preview-", "https://cdns-preview-")
      .replace(".deezer.com", ".dzcdn.net");

    const textoLetra = `${tradutor.texto2[0]} *${tituloL || ""}*\n${tradutor.texto2[1]}  *${artistaL || ""}*\n\n${tradutor.texto2[2]} \n${lyrics.lyrics || "Lyrics not found."}`;
    await conn.sendMessage(
      m.chat,
      { image: { url: img }, caption: textoLetra },
      { quoted: m },
    );
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: previewUrl },
        fileName: `${artistaL || "-"} - ${tituloL || "-"}.mp3`,
        mimetype: "audio/mp4",
      },
      { quoted: m },
    );
  } catch (e) {
    console.log(`Error: ${e.message}`);
    throw `*${tradutor.texto2[3]}*`;
  }
};
handler.help = ["lirik", "letra"].map((v) => v + " <Apa>");
handler.tags = ["internet"];
handler.command = /^(lirik|lyrics|lyric|letra)$/i;
export default handler;

/* Creditos: https://github.com/darlyn1234 */
async function searchLyrics(term) {
  try {
    if (!term) return "🟥 Provide the name of the song to search the lyrics";
    const geniusResponse = await axios.get(
      `${global.BASE_API_DELIRIUS}/search/genius?q=${encodeURIComponent(term)}`,
    );
    // La API nueva envuelve genius en data y /search/lyrics ahora es por query (ya no acepta url)
    const geniusData = geniusResponse.data.data || [];
    if (!geniusData.length) return `🟨 Couldn't find any lyrics for "${term}"`;
    const pick = geniusData[0];
    const lyricsQuery = `${pick.artist?.name || ""} ${pick.title || term}`.trim();
    const lyricsResponse = await axios.get(
      `${global.BASE_API_DELIRIUS}/search/lyrics?query=${encodeURIComponent(lyricsQuery)}`,
    );
    const lyricsData = lyricsResponse.data.data || {};
    const result = {
      status: true,
      creador: "Sareth",
      title: pick.title || "",
      fullTitle: pick.fullTitle || pick.title || "",
      artist: pick.artist?.name || "",
      artistUrl: pick.artist?.url || "",
      id: pick.id || "",
      enpoint: pick.endpoint || "",
      instrumental: pick.instrumental,
      image: pick.image || "",
      url: pick.url || "",
      lyrics: lyricsData.lyrics || "",
    };
    return result;
  } catch (error) {
    console.error(error.message);
    return {
      creador: "Sareth",
      status: false,
      message: new Error(error).message,
    };
  }
}
