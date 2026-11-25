import fs from 'fs';
import axios from "axios";

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.downloader_threads

  if (!args[0]) throw tradutor.texto1;
  try {
    const res = await axios.get(
      global.BASE_API_DELIRIUS + "/download/threads",
      {
        params: {
          url: args[0],
        },
      },
    );
    if (res.data.status && res.data.data.media.length > 0) {
      const tdata = res.data.data;
      const txtresthreads = `${tradutor.texto2[0]}${tdata.username || "-"}${tradutor.texto2[1]}${tdata.description || "-"}${tradutor.texto2[2]}${tdata.likes ?? tdata.like ?? "-"}${tradutor.texto2[3]}${(tdata.is_verified ?? tdata.verified) ? "√" : "×"}${tradutor.texto2[4]}${tdata.media.length || "-"}${tradutor.texto2[5]}${args[0].trim()}${tradutor.texto2[6]}`;
      await conn.sendMessage(m.chat, { text: txtresthreads }, { quoted: m });
      const media = res.data.data.media;
      for (const item of media) {
        if (item.type === "image") {
          await conn.sendMessage(
            m.chat,
            { image: { url: item.url } },
            { quoted: m },
          );
        } else if (item.type === "video") {
          await conn.sendMessage(
            m.chat,
            { video: { url: item.url } },
            { quoted: m },
          );
        }
      }
    } else {
      await conn.sendMessage(
        m.chat,
        { text: tradutor.texto3 + args[0] },
        { quoted: m },
      );
    }
  } catch (err) {
    console.log(new Error(err).message);
  }
};

handler.command = /^(threadsd|threads|threaddl|thread)$/i;

export default handler;