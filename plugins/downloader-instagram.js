import axios from "axios";
import fs from "fs"; // Asegúrate de importar fs para leer los lenguajes

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_instagram;

  if (!args[0]) {
    throw `${tradutor.texto1} _${usedPrefix + command} https://www.instagram.com/reel/...`;
  }

  // Reacción inicial de "procesando" (opcional)
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const img = await instagramDownload(args[0]);
    
    if (!img.status) throw new Error("Scraper falló");

    for (let i = 0; i < img.data.length; i++) {
      const item = img.data[i];
      if (item.type === "image") {
        await conn.sendMessage(m.chat, { image: { url: item.url } }, { quoted: m });
      } else if (item.type === "video") {
        await conn.sendMessage(m.chat, { video: { url: item.url } }, { quoted: m });
      }
    }
    
    // Reacción de éxito (Check)
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    try {
      const res = await axios.get(global.BASE_API_DELIRIUS + "/download/instagram", { params: { url: args[0] }});
      const result = res.data.data;
      
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (item.type === "image") {
          await conn.sendMessage(m.chat, { image: { url: item.url } }, { quoted: m });
        } else if (item.type === "video") {
          await conn.sendMessage(m.chat, { video: { url: item.url } }, { quoted: m });
        }
      }
      
      // Reacción de éxito (Check) si funciona el respaldo
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err2) {
      // Reacción de error (X) si fallan ambos métodos
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      console.error(err2);
    }
  }
};

handler.command = /^(instagramdl|instagram|igdl|ig|instagramdl2|instagram2|igdl2|ig2|instagramdl3|instagram3|igdl3|ig3)$/i;
export default handler;

// Función de delay para no saturar el servidor de Publer
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const instagramDownload = async (url) => {
  return new Promise(async (resolve) => {
    if (!url.match(/\/(reel|reels|p|stories|tv|s)\/[a-zA-Z0-9_-]+/i)) {
      return resolve({ status: false, creator: "Sareth" });
    }

    try {
      let response = await axios.post(
          "https://app.publer.io/hooks/media",
          { url: url, iphone: false },
          {
            headers: {
              "Content-Type": "application/json",
              "Origin": "https://publer.io",
              "Referer": "https://publer.io/",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            },
          }
      );

      let jobId = response.data.job_id;
      let status = "working";
      let jobStatusResponse;
      let attempts = 0;

      while (status !== "complete" && attempts < 10) {
        await delay(2000); // Espera 2 segundos entre intentos
        jobStatusResponse = await axios.get(`https://app.publer.io/api/v1/job_status/${jobId}`);
        status = jobStatusResponse.data.status;
        attempts++;
      }

      if (status !== "complete") return resolve({ status: false });

      let data = jobStatusResponse.data.payload.map((item) => ({
          type: item.type === "photo" ? "image" : "video",
          url: item.path,
      }));

      resolve({ status: true, data });
    } catch (e) {
      resolve({ status: false, msg: e.message });
    }
  });
};
                                 
