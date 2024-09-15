import fetch from "node-fetch";
let Sticker;
import("wa-sticker-formatter")
  .then((module) => {
    Sticker = module.Sticker;
  })
  .catch((error) => {
    console.error("wa-sticker-formatter");
  });

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(
    fs.readFileSync(`./src/languages/${idioma}.json`),
  );
  const tradutor = _translate.plugins.sticker_ttp_attp;
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Mystic-Bot*`;
  if (command == "attp") {
    const a1 = await (
      await fetch(
        `https://api.cafirexos.com/api/maker/attp?text=${decodeURI(text)}`,
      )
    ).buffer();
    const a2 = await createSticker(a1, false, global.packname, global.author);
    conn.sendFile(m.chat, a2, "sticker.webp", "", m, { asSticker: true });
  }
  if (command == "ttp2") {
    const ttppredd = `${global.BASE_API_DELIRIUS}/canvas/ttp?text=${encodeURI(text)}&color=red`;
    const stiker = await createSticker(
      ttppredd,
      false,
      global.packname,
      global.author,
      20,
    );
    m.reply(stiker);
  }

  if (command == "ttp") {
    const tctctctc = `${global.BASE_API_DELIRIUS}/canvas/ttp?text=${encodeURI(text)}`;
    const stiker = await createSticker(
      tctctctc,
      false,
      global.packname,
      global.author,
      20,
    );
    m.reply(stiker);
  }
};
handler.command = handler.help = ["ttp", "ttp2", "attp"];
handler.tags = ["sticker"];
export default handler;

async function createSticker(img, url, packName, authorName, quality) {
  const stickerMetadata = {
    type: "full",
    pack: packName,
    author: authorName,
    quality,
  };
  return new Sticker(img ? img : url, stickerMetadata).toBuffer();
}
