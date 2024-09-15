import uploadImage from '../src/libraries/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_readqrcode

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw tradutor.texto1;
  const img = await q.download?.();
  const url = await uploadImage(img);
  const anu = await fetch(`https://api.lolhuman.xyz/api/read-qr?apikey=${lolkeysapi}&img=${url}`);
  const json = await anu.json();
  await m.reply(`${tradutor.texto2} ${json.result}`);
};
handler.command = /^(readqr)$/i;
export default handler;
