import axios from "axios";

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) throw `*Ingresa un enlace de Threads*`;
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
      const txtresthreads = `亗 T H R E A D S\n
*Usuario :* ${res.data.data.username || "-"}
*Descripción :* ${res.data.data.description || "-"}
*Likes :* ${res.data.data.likes || "-"}
*Verificado :* ${res.data.data.is_verified ? "√" : "×"}
*Archivos :* ${res.data.data.media.length || "-"}
*Enlace :* ${args[0].trim()}`;
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
        { text: "*🍟 Sin resultados para :* " + args[0] },
        { quoted: m },
      );
    }
  } catch (err) {
    console.log(new Error(err).message);
  }
};

handler.command = /^(threadsd|threads|threaddl|thread)$/i;

export default handler;