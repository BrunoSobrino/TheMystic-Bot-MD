import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_readqrcode

const handler = async (m, {conn, text, usedPrefix, command}) => {
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
