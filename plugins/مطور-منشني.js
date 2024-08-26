import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fetch from 'node-fetch';

let handler = m => m;

handler.all = async function (m, conn) {
    let img =["https://telegra.ph/file/ae5e5bfbc98cb7825f8ac.jpg",
              "https://telegra.ph/file/ae5e5bfbc98cb7825f8ac.jpg",
             "https://telegra.ph/file/ae5e5bfbc98cb7825f8ac.jpg",
             "https://telegra.ph/file/ae5e5bfbc98cb7825f8ac.jpg",
             "https://telegra.ph/file/d870091e1b346afd2d30f.png",
             "https://telegra.ph/file/f7799a1459cac6eb1346c.png",
             "https://telegra.ph/file/4e84292a76a07ab824228.png",
             "https://telegra.ph/file/ae5e5bfbc98cb7825f8ac.jpg"];
    let num = "201144480436";
    let img1 = await img[Math.floor(img.length * Math.random())];
    if (m.mentionedJid && m.mentionedJid[0]) {
        let phoneNumber = m.mentionedJid[0].replace(/[^0-9]/g, '');
        if (phoneNumber === num) {
            // تحميل الصورة
            let response = await fetch(img1);
            let buffer = await response.buffer();

            // تحويل الصورة إلى ملصق
            let sticker = new Sticker(buffer, {
                pack: 'Sticker Pack',
                author: 'Your Name',
                type: StickerTypes.FULL, // يمكنك استخدام StickerTypes.CROP لتنسيق مختلف
                quality: 50 // جودة الملصق
            });

            let stickerBuffer = await sticker.toBuffer();

            // إرسال الملصق
            return this.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        }
    } else {
        return;
    }
}

export default handler;
