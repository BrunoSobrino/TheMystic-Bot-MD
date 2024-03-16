import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.downloader_pptiktok

const handler = async (m, {conn, args, text}) => {
  if (!text) throw `${tradutor.texto1}`;
  const res = `https://api.lolhuman.xyz/api/pptiktok/${text}?apikey=${lolkeysapi}`;
  conn.sendFile(m.chat, res, 'error.jpg', `${tradutor.texto2} ${text}*`, m, false);
};
handler.help = ['tiktokfoto'].map((v) => v + ' <username>');
handler.tags = ['downloader'];
handler.command = /^(tiktokfoto|pptiktok)$/i;
export default handler;
