/* creditos del código a @darlyn1234 */
import YTDL from "../src/libraries/ytdll.js";
import axios from "axios";
import fs from "fs";
import NodeID3 from "node-id3";
import ytdl from "ytdl-core";


const handler = async (m, {conn, command, args, text, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_ytmeta

  if (!text) return m.reply(tradutor.texto1)
  try {
const extract = (await ytdl.getBasicInfo(text)).videoDetails.title;      
      
  await YTDL.mp3(text).then(async (s) => {
  const tags = {
    title: s.meta.title || "-",
    artist: s.meta.channel || "-",
    album: `${s.meta.keywords[0] ? s.meta.keywords[0] : s.meta.channel}`,
    year: s.meta.publicDate || "-",
    genre: s.meta.category || "-",
    comment: {
      language: "spa",
      text: tradutor.texto2,
    },
    unsynchronisedLyrics: {
      language: "spa",
      text: tradutor.texto2,
    },
    image: {
      mime: "image/jpeg",
      type: {
        id: 3,
        name: "front cover",
      },
      description: "YouTube Thumbnail",
      imageBuffer: await axios.get(s.meta.image, {responseType: "arraybuffer"}).then((response) => Buffer.from(response.data, "binary")),
    },
    mimetype: 'image/jpeg',
    copyright: "Copyright Darlyn © 2023",
  };
  await NodeID3.write(tags, s.path);
  await conn.sendMessage(m.chat, {audio: fs.readFileSync(`./${s.path}`), mimetype: "audio/mpeg", fileName: `${s.meta.title || "-"}.mp3`,}, {quoted: m});
  fs.unlinkSync(`./${s.path}`);
});
  } catch (e) {
    console.log(e);
    m.reply(new Error(e).message);
  }
};
handler.help = ['ytmetadata', 'ytest'].map((v) => v + ' < url >');
handler.tags = ['downloader'];
handler.command = /^(ytmetadata|ytest)$/i;
export default handler;
