import uploadImage from '../lib/uploadImage.js';
const handler = async (m, {conn, text, usedPrefix, command, isOwner}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw '*[❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 / 𝙴𝚃𝙸𝚀𝚄𝙴𝚃𝙴 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽*';
  const img = await q.download?.();
  const url = await uploadImage(img);
  const docname = text ? text : m.pushName || 'documento';
  conn.sendFile(m.chat, `http://api.lolhuman.xyz/api/convert/imgtopdf?apikey=${lolkeysapi}&img=${url}`, docname + '.pdf', '', m, false, {asDocument: true});
};
handler.command = /^topdf$/i;
export default handler;
