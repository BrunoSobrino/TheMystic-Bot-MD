import fs from 'fs';
import fetch from 'node-fetch';

const sendPDF = async (conn, m, url, fileName) => {
  const res = await fetch(url);
  const buffer = await res.buffer();
  const tempFilePath = `/tmp/${fileName}`;

  fs.writeFileSync(tempFilePath, buffer);

  await conn.sendMessage(m.chat, { document: { url: tempFilePath }, mimetype: 'application/pdf', fileName }, { quoted: m });

  // Clean up temporary file
  fs.unlinkSync(tempFilePath);
};

let handler = async (m, { conn }) => {
  const pdfUrl = 'https://qu.ax/bfvT.pdf';
  const fileName = 'Maestro de Oferta.pdf';

  await sendPDF(conn, m, pdfUrl, fileName);
};

handler.help = ['sendpdf'];
handler.tags = ['utility'];
handler.command = ['maestro'];

export default handler;
