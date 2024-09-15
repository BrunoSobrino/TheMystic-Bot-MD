import { Sticker } from "wa-sticker-formatter";
import axios from "axios";
import fs from "fs";

const handler = async (m, { usedPrefix, conn, args, text, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(
    fs.readFileSync(`./src/languages/${idioma}.json`),
  );
  const tradutor = _translate.plugins.sticker_semoji;
  let [tipe, emoji] = text.includes("|") ? text.split("|") : args;
  const defaultType = "apple";
  if (tipe && !emoji) {
    emoji = "😎";
    tipe = defaultType;
  }
  const err = `${tradutor.texto1[0]}
*◉ ${usedPrefix + command} ${tradutor.texto1[1]}

${tradutor.texto1[0]}
*◉ ${usedPrefix + command}* ${tradutor.texto1[2]}

${tradutor.texto1[3]} 

${tradutor.texto1[4]}
${tradutor.texto1[5]}
${tradutor.texto1[6]}
${tradutor.texto1[7]}
${tradutor.texto1[8]}
${tradutor.texto1[9]}
${tradutor.texto1[10]}
${tradutor.texto1[11]}
${tradutor.texto1[12]}
${tradutor.texto1[13]}
${tradutor.texto1[14]}

${tradutor.texto1[0]}`;
  if (!emoji) throw err;
  const typess = {
    mo: "mozilla",
    op: "openmoji",
    pi: "joypixels",
    sa: "samsung",
    go: "google",
    wha: "whatsapp",
    fa: "facebook",
    ap: "apple",
    mi: "microsoft",
    ht: "htc",
    tw: "twitter",
  };
  tipe = tipe && typess[tipe] ? typess[tipe] : defaultType;
  try {
    emoji = emoji.trim();
    tipe = tipe.trim().toLowerCase();
    const response = await axios.get("https://deliriusapi-official.vercel.app/tools/emoji", {
      params: {
        text: emoji
      }
    });
    const json = response.data;
    let chosenURL = json.data[tipe] || json.data["apple"];
    console.log(chosenURL);
    const stiker = await createSticker(
      false,
      chosenURL,
      global.packname,
      global.author,
      20,
    );
    m.reply(stiker);
  } catch (e) {
    console.log(new Error(e).message);
    throw tradutor.texto2;
  }
};

handler.help = ["emoji <tipo> <emoji>"];
handler.tags = ["sticker"];
handler.command = ["emoji", "smoji", "semoji"];
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
