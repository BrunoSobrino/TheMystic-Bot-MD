import fetch from 'node-fetch';
import { addExif } from '../src/libraries/sticker.js';
import uploadFile from '../src/libraries/uploadFile.js';
import uploadImage from '../src/libraries/uploadImage.js';
import { webp2png } from '../src/libraries/webp2mp4.js';
let Sticker;
import('wa-sticker-formatter')
  .then((module) => {
    Sticker = module.Sticker;
  })
  .catch((error) => {
    console.error('wa-sticker-formatter');
  });

async function handler(m, { conn, args, usedPrefix, command }) {
  let stiker = false;

  try {
    let [packname, ...author] = args.join(' ').split(' ');
    author = (author || []).join(' ');

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    let img = await q.download?.();

    if (/webp/g.test(mime)) {
      stiker = await addExif(img, packname || global.packname, author || global.author);
    } else if (/image/g.test(mime)) {
      stiker = await createSticker(img, false, packname || global.packname, author || global.author);
    } else if (/video/g.test(mime)) {
      stiker = await mp4ToWebp(img, { pack: packname || global.packname, author: author || global.author });
    } else if (args[0] && isUrl(args[0])) {
      stiker = await createSticker(false, args[0], '', author, 20);
    } else {
      throw `[❗𝐈𝐍𝐅𝐎❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽 𝚅𝙸𝙳𝙴𝙾, 𝙸𝙼𝙰𝙶𝙴𝙽 𝙾 𝙸𝙽𝚂𝙴𝚁𝚃𝙴 𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝙲𝙸𝙾́𝙽 .𝚓𝚙𝚐 𝙴𝙻 𝙲𝚄𝙰𝙻 𝚂𝙴𝚁𝙰 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙳𝙾 𝙴𝙽 𝚂𝚃𝙸𝙲𝙺𝙴𝚁, 𝙳𝙴𝙱𝙴 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴𝚁 𝙾 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`;
    }
  } catch (error) {
    console.error(error);
    try {
      let [packname, ...author] = args.join(' ').split(' ');
      author = (author || []).join(' ');

      let q = m.quoted ? m.quoted : m;
      let mime = (q.msg || q).mimetype || q.mediaType || '';

      let img = await q.download?.();
      let out;

      if (/webp/g.test(mime)) out = await webp2png(img);
      else if (/image/g.test(mime)) out = await uploadImage(img);
      else if (/video/g.test(mime)) out = await uploadFile(img);

      if (typeof out !== 'string') out = await uploadImage(img);

      stiker = await createSticker(false, out, global.packname, global.author);

      if (args[0] && isUrl(args[0])) {
        stiker = await createSticker(false, args[0], global.packname, global.author);
      } else {
        throw `[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 / 𝚄𝚁𝙻 / 𝙻𝙸𝙽𝙺 𝙽𝙾 𝙴𝚂 𝚅𝙰𝙻𝙸𝙳𝙰, 𝙻𝙰 𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝙲𝙸𝙾𝙽 𝙳𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 / 𝚄𝚁𝙻 / 𝙻𝙸𝙽𝙺 𝙳𝙴𝙱𝙴 𝚂𝙴𝚁 .𝚓𝚙𝚐, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix}s https://telegra.ph/file/0dc687c61410765e98de2.jpg*`;
      }
    } catch (error) {
      stiker = `[❗𝐈𝐍𝐅𝐎❗] 𝙾𝙲𝚄𝚁𝚁𝙸𝙾 𝚄𝙽 𝙴𝚁𝚁𝙾𝚁, 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾. 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽 𝚅𝙸𝙳𝙴𝙾, 𝙸𝙼𝙰𝙶𝙴𝙽 𝙾 𝙸𝙽𝚂𝙴𝚁𝚃𝙴 𝙴𝙻 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝙲𝙸𝙾́𝙽 .𝚓𝚙𝚐 𝙴𝙻 𝙲𝚄𝙰𝙻 𝚂𝙴𝚁𝙰 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙳𝙾 𝙴𝙽 𝚂𝚃𝙸𝙲𝙺𝙴𝚁`;
    }
  } finally {
    m.reply(stiker);
  }
}

handler.help = ['sfull'];
handler.tags = ['sticker'];
handler.command = /^(s2|sticker2)$/i;

export default handler;

const isUrl = (text) => text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));

async function createSticker(img, url, packName, authorName, quality) {
  let stickerMetadata = { type: 'full', pack: packName, author: authorName, quality };
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer();
}

async function mp4ToWebp(file, stickerMetadata) {
  if (!stickerMetadata) stickerMetadata = {};
  if (!stickerMetadata.pack) stickerMetadata.pack = '‎';
  if (!stickerMetadata.author) stickerMetadata.author = '‎';
  if (!stickerMetadata.crop) stickerMetadata.crop = false;

  let getBase64 = file.toString('base64');
  const Format = {
    file: `data:video/mp4;base64,${getBase64}`,
    processOptions: {
      crop: stickerMetadata.crop,
      startTime: '00:00:00.0',
      endTime: '00:00:7.0',
      loop: 0
    },
    stickerMetadata: { ...stickerMetadata },
    sessionInfo: {
      WA_VERSION: '2.2106.5',
      PAGE_UA: 'WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
      WA_AUTOMATE_VERSION: '3.6.10 UPDATE AVAILABLE: 3.6.11',
      BROWSER_VERSION: 'HeadlessChrome/88.0.4324.190',
      OS: 'Windows Server 2016',
      START_TS: 1614310326309,
      NUM: '6247',
      LAUNCH_TIME_MS: 7934,
      PHONE_VERSION: '2.20.205.16'
    },
    config: {
      sessionId: 'session',
      headless: true,
      qrTimeout: 20,
      authTimeout: 0,
      cacheEnabled: false,
      useChrome: true,
      killProcessOnBrowserClose: true,
      throwErrorOnTosBlock: false,
      chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
      ],
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    }
  };

  let res = await fetch('https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl', {
    method: 'post',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(Format)
  });

  return Buffer.from((await res.text()).split(';base64,')[1], 'base64');
}
