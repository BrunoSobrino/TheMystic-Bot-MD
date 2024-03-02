import fetch from 'node-fetch';
import {
    FormData,
    Blob
} from 'formdata-node';
import {
    fileTypeFromBuffer
} from 'file-type';
import cheerio from "cheerio"
let handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command
}) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime) throw ' برفع الملفات لي موقع top4top العربي الشهير ارسل صورة او فيديو ثم قم بالاشارة اليه عبر كتابة \n*.top4top*';
        let media = await q.download();
        await m.reply(wait);
        let linkPom = await top4top(media);
        let {
            upBoxTitle,
            imgSrc,
            imgURL,
            imgBBC,
            imgHTML,
            delCode
        } = linkPom
        let caption = `${upBoxTitle}
📮 *L I N K:*
${imgURL || imgSrc}

*Del Code*
${delCode}
📊 *S I Z E :* ${media.length} Byte
`
        await conn.reply(m.chat, caption, m)
    } catch (error) {
        console.error(error);
        await m.reply('هذا الامر خاص برفع الملفات لي موقع top4top العربي الشهير ارسل صورة او فيديو ثم قم بالاشارة اليه عبر كتابة \n*.top4top*');
    }
}
handler.help = ["top4top"]
handler.tags = ["uploader"]
handler.command = /^(top4top)$/i
export default handler

const top4top = async buffer => {
    try {
        const {
            ext,
            mime
        } = await fileTypeFromBuffer(buffer) || {};
        let form = new FormData();
        const blob = new Blob([buffer.toArrayBuffer()], {
            type: mime
        });
        form.append('file_1_', blob, 'tmp.' + ext);
        form.append("submitr", "[ رفع الملفات ]");
        let res = await fetch('https://www.top4top.me/#uploader', {
            method: 'POST',
            body: form
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const data = $('.list-group-item').map((index, element) => ({
            upBoxTitle: $(element).find('.up-box-title').text().trim(),
            imgSrc: $(element).find('img').attr('src'),
            imgURL: $(element).find('#image1').val(),
            imgBBC: $(element).find('#imageBBC').val(),
            imgHTML: $(element).find('#imageHTML').val(),
            delCode: $(element).find('#imagedelCode').val(),
        })).get();
        return data[0];
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to the calling function
    }
};

function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
