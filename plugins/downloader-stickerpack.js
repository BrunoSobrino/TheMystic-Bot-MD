/* By https://github.com/ALBERTO9883/NyanCatBot-MD */
import fetch from 'node-fetch';
import {sticker} from '../lib/sticker.js';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_stickerpack// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command}* https://getstickerpack.com/stickers/flork-memes-4-1`;
  try {
    const url = text;
    const res = await fetch(`https://api.akuari.my.id/downloader/stickerpack?link=${url}`);
    const json = await res.json();
    for (const data of (json.result || json)) {
      const stikers = await sticker(false, data, global.packname, global.author);
      conn.sendFile(m.chat, stikers, null, {asSticker: true}, m, true, {contextInfo: {'forwardingScore': 200, 'isForwarded': true}}, {quoted: m});
      // await delay(1500)
    }
  } catch {
    await m.reply(`${tradutor.texto2}`);
  }
};
handler.command = /^stickerpack$/i;
export default handler;
// const delay = time => new Promise(res => setTimeout(res, time))
