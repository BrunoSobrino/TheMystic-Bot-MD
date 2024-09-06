/*import { createPDFDocument, addImageToPDF } from '../src/libraries/canvaspdf.js';
import { promises as fs } from 'fs';

const handler = async (m, { conn, usedPrefix, command, text }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/image/g.test(mime)) {
        const img = await q.download?.();
        if (!img) throw `${tradutor.texto1} ${usedPrefix + command}*`;

        let pdfId;
        let isNewPdf = false;

        if (!text) {
            // Crear un nuevo PDF
            const pdfDocument = await createPDFDocument();
            pdfId = pdfDocument.pdfId;
            isNewPdf = true;
        } else {
            // Añadir imagen a un PDF existente
            pdfId = text;
        }

        const pdfResult = await addImageToPDF(pdfId, img);

        const pdfBuffer = await fs.readFile(pdfResult.result.url);

        if (isNewPdf) {
            await conn.sendMessage(m.chat, { document: pdfBuffer, mimetype: 'application/pdf', fileName: `${pdfId}.pdf`, caption: `ID: ${pdfId}` }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { document: pdfBuffer, mimetype: 'application/pdf', fileName: `${pdfId}.pdf` }, { quoted: m });
        }
    }
};
handler.command = /^(test)$/i;
export default handler;*/
