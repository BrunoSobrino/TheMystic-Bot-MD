import { generateWAMessageFromContent } from "baileys";
import Tiktok from "@tobyg74/tiktok-api-dl";

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_tiktok;

  if (!text) throw `${tradutor.texto1} _${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/_`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `${tradutor.texto2} _${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/_`;
  const texto = `${tradutor.texto3}`;

  try {
    const aa = { quoted: m, userJid: conn.user.jid };
    const prep = generateWAMessageFromContent(m.chat, {
      extendedTextMessage: {
        text: texto,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }
    }, aa);
    await conn.relayMessage(m.chat, prep.message, { messageId: prep.key.id, mentions: [m.sender] });

    const result = await Tiktok.Downloader(args[0], { version: "v1" });
    if (result.status === "success") {
      const desc1n = `${tradutor.texto4[0]} _${usedPrefix}tomp3_ ${tradutor.texto4[1]}`;
      await conn.sendMessage(m.chat, { video: { url: result.result.video.downloadAddr }, caption: desc1n }, { quoted: m });
    } else {
      throw new Error(result.message);
    }
  } catch (ee1) {
    try {
      const result = await Tiktok.Downloader(args[0], { version: "v1" });
      if (result.status === "success") {
        const desc1 = `${tradutor.texto5[0]} _${usedPrefix}tomp3_ ${tradutor.texto5[1]}`;
        await conn.sendMessage(m.chat, { video: { url: result.result.video.downloadAddr }, caption: desc1 }, { quoted: m });
      } else {
        throw new Error(result.message);
      }
    } catch (e1) {
      try {
        const result = await Tiktok.Downloader(args[0], { version: "v1" });
        if (result.status === "success") {
          const desc2 = `${tradutor.texto6[0]} _${usedPrefix}tomp3_ ${tradutor.texto6[1]}`;
          await conn.sendMessage(m.chat, { video: { url: result.result.video.downloadAddr }, caption: desc2 }, { quoted: m });
        } else {
          throw new Error(result.message);
        }
      } catch (e2) {
        try {
          const result = await Tiktok.Downloader(args[0], { version: "v1" });
          if (result.status === "success") {
            const cap = `${tradutor.texto8[0]} _${usedPrefix}tomp3_ ${tradutor.texto8[1]}`;
            await conn.sendMessage(m.chat, { video: { url: result.result.video.downloadAddr }, caption: cap }, { quoted: m });
          } else {
            throw new Error(result.message);
          }
        } catch {
          throw `${tradutor.texto9}`;
        }
      }
    }
  }
};

handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;
export default handler;
