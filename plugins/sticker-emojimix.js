import {sticker} from '../lib/sticker.js';
import MessageType from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.sticker_emojimix
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, text, args}) => {
  if (!args[0]) throw tradutor.texto1;
  const [emoji1, emoji2] = text.split`&`;
  const anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
  for (const res of anu.results) {
    const stiker = await sticker(false, res.url, global.packname, global.author);
    conn.sendFile(m.chat, stiker, null, {asSticker: true});
  }
};
handler.help = ['emojimix'].map((v) => v + ' emot1|emot2>');
handler.tags = ['fun'];
handler.command = /^(emojimix)$/i;
export default handler;
const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
  fetch(url, options)
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      })
      .catch((err) => {
        reject(err);
      });
});
