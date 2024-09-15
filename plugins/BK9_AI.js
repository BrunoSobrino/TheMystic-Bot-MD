import fetch from 'node-fetch';
import fs from 'fs';
import uploader from '../src/libraries/uploadImage.js';

const handler = async (m, {conn, text, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.BK9.BK9;

  if (command === 'bk9dalle') {
    if (!text) throw `${tradutor.bk9dalletext}`;

    await conn.sendMessage(m.chat, {text: tradutor.bk9dallewait}, {quoted: m});

    try {
      const BK9 = `https://bk9.fun/ai/photoleap?q=${encodeURIComponent(text)}`;
      const response = await fetch(BK9);
      const result = await response.json();

      if (result.status) {
        await conn.sendMessage(m.chat, {image: {url: result.BK9}}, {quoted: m});
      }
    } catch (error) {
      throw `${tradutor.bk9dalleerr}`;
    }
  } else if (command === 'bk9') {
    if (!text) throw `${tradutor.bk9text}`;

    try {
      conn.sendPresenceUpdate('composing', m.chat);
      const BK9api = `https://bk9.fun/ai/gpt4?q=${encodeURIComponent(text)}`;
      const BK99 = await fetch(BK9api);
      const BK8 = await BK99.json();
      if (BK8.status && BK8.BK9) {
        const respuestaAPI = BK8.BK9;
        conn.reply(m.chat, respuestaAPI, m);
      } else {
        throw `${tradutor.bk9err}`;
      }
    } catch (error) {
      throw `${tradutor.bk9err}`;
    }
  } else if (command === 'bk9img') {
    let BK7 = m.quoted ? m.quoted : m;
    let BK8 = (BK7.msg || BK7).mimetype || BK7.mediaType || '';
    if (/image/g.test(BK8) && !/webp/g.test(BK8)) {
      let BK0 = await BK7.download();
      let BK9img = await uploader(BK0);
      let BK9api = await (await fetch(`https://bk9.fun/ai/geminiimg?url=${BK9img}&q=${text}`)).json();
      conn.sendMessage(m.chat, { text: BK9api.BK9 }, { quoted: m });
    } else {
      throw `${tradutor.bk9imgtext}`;
    }
  }
};

handler.command = ['bk9dalle', 'bk9', 'bk9img'];
handler.tags = ['ai'];
export default handler;
