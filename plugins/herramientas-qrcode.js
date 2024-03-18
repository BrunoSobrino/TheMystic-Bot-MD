import {toDataURL} from 'qrcode';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_qrcode

const handler = async (m, {text, conn}) => {
  if (!text) throw tradutor.texto1;
  conn.sendFile(m.chat, await toDataURL(text.slice(0, 2048), {scale: 8}), 'qrcode.png', '¯\\_(ツ)_/¯', m);
};
handler.help = ['', 'code'].map((v) => 'qr' + v + ' <teks>');
handler.tags = ['tools'];
handler.command = /^qr(code)?$/i;
export default handler;
