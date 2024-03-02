import PDFDocument from 'pdfkit';
import {
    Writable
} from 'stream';

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    // Usage example
    let query = `هذا الامر يقوم بتحويل اي نص لــpdf \nلكن شريطة ان يكون النص بلغة اجنبية لانه لا يدعم اللغة العربية للاسف ♥ نكتب هكذا على سبيل المثال حتى تفهم\n\n*.textpdf* hello my name is Yassine follow me in my instagram`
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw query
    
    await m.reply(wait)
    try {
        let pdf = await textToPDFBuffer(text)
            .then(buffer => {
                // Use the resulting buffer as needed
                return (buffer);
            })
        await conn.sendMessage(m.chat, {
            document: pdf,
            mimetype: "application/pdf",
            fileName: `For ${m.name}.pdf`
        }, {
            quoted: m
        })
        } catch (e) {
        await m.reply('error')
        }
}
handler.help = ['texttopdf']
handler.tags = ['pdf']
handler.command = /^(texttopdf)$/i
export default handler

async function textToPDFBuffer(text) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        const streamBuffer = new Writable({
            write(chunk, encoding, next) {
                buffers.push(chunk);
                next();
            },
        });

        const doc = new PDFDocument();

        doc.pipe(streamBuffer);
        doc.text(text);
        doc.end();

        streamBuffer.on('finish', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        streamBuffer.on('error', reject);
    });
}
