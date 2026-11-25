import { sticker } from "../src/libraries/sticker.js";
import axios from "axios";
import fs from 'fs';
const emj = /^[\p{Emoji}\u200d]+$/u;

const handler = async (m, { text, conn }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.sticker_moji
  if (!text) throw tradutor.texto1;
  //if (!emj.test(text)) throw "*🍟 Ingresa un emoji valido.*"
  try {
    const res = await axios.get(`https://emojicdn.elk.sh/${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
    const stiker = await sticker(
      Buffer.from(res.data),
      null,
      global.packname,
      global.author,
    );
    conn.sendFile(m.chat, stiker, "sticker.webp", "", m, { asSticker: true });
  } catch (e) {
    m.reply(tradutor.texto2);
  }
};
handler.help = ["moji"].map((v) => v + " emoji");
handler.tags = ["sticker"];
handler.command = /^(moji|mojit)$/i;
//handler.rowner = true;
export default handler;
