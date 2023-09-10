import {toDataURL} from 'qrcode';
const handler = async (m, {text, conn}) => {
  if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝚀𝚄𝙴 𝚀𝚄𝙸𝙴𝚁𝙰 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝚁 𝙴𝙽 𝙲𝙾𝙳𝙸𝙶𝙾 𝚀𝚁*`;
  conn.sendFile(m.chat, await toDataURL(text.slice(0, 2048), {scale: 8}), 'qrcode.png', '¯\\_(ツ)_/¯', m);
};
handler.help = ['', 'code'].map((v) => 'qr' + v + ' <teks>');
handler.tags = ['tools'];
handler.command = /^qr(code)?$/i;
export default handler;
