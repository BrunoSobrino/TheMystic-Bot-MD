import axios from 'axios';
import jimp from 'jimp';
import FormData from 'form-data';
import {Sticker, createSticker, StickerTypes} from 'wa-sticker-formatter';

async function GetBuffer(url) {
  return new Promise(async (resolve, reject) => {
    let buffer;
    await jimp
        .read(url)
        .then((image) => {
          image.getBuffer(image._originalMime, function(err, res) {
            buffer = res;
          });
        })
        .catch(reject);
    if (!Buffer.isBuffer(buffer)) reject(false);
    resolve(buffer);
  });
}
function GetType(Data) {
  return new Promise((resolve, reject) => {
    let Result; let Status;
    if (Buffer.isBuffer(Data)) {
      Result = new Buffer.from(Data).toString('base64');
      Status = 0;
    } else {
      Status = 1;
    }
    resolve({
      status: Status,
      result: Result,
    });
  });
}
async function Cartoon(url) {
  return new Promise(async (resolve, reject) => {
    let Data;
    try {
      const buffer = await GetBuffer(url);
      const Base64 = await GetType(buffer);
      await axios
          .request({
            url: 'https://access1.imglarger.com/PhoAi/Upload',
            method: 'POST',
            headers: {
              'connection': 'keep-alive',
              'accept': 'application/json, text/plain, */*',
              'content-type': 'application/json',
            },
            data: JSON.stringify({
              type: 11,
              base64Image: Base64.result,
            }),
          })
          .then(async ({data}) => {
            const code = data.data.code;
            const type = data.data.type;
            while (true) {
              const LopAxios = await axios.request({
                url: 'https://access1.imglarger.com/PhoAi/CheckStatus',
                method: 'POST',
                headers: {
                  'connection': 'keep-alive',
                  'accept': 'application/json, text/plain, */*',
                  'content-type': 'application/json',
                },
                data: JSON.stringify({
                  code: code,
                  isMember: 0,
                  type: type,
                }),
              });
              const status = LopAxios.data.data.status;
              if (status == 'success') {
                Data = {
                  message: 'success',
                  download: {
                    full: LopAxios.data.data.downloadUrls[0],
                    head: LopAxios.data.data.downloadUrls[1],
                  },
                };
                break;
              } else if (status == 'noface') {
                Data = {
                  message: 'noface',
                };
                break;
              }
            }
          });
    } catch (_error) {
      Data = false;
    } finally {
      if (Data == false) {
        reject(false);
      }
      resolve(Data);
    }
  });
}
function randomId() {
  return Math.floor(100000 + Math.random() * 900000);
}
const handler = async (m, {conn, usedPrefix, command}) => {
  conn.cartoon = conn.cartoon ? conn.cartoon : {};
  if (m.sender in conn.cartoon) {
    throw 'Todavía hay un proceso inconcluso, amigo. Por favor espera hasta que termine. >//<';
  }
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  if (!mime) throw `Where is the picture you want to convert to a cartoon?`;
  if (!/image\/(jpe?g|png)/.test(mime)) throw `file ${mime} not supported`;
  else conn.cartoon[m.sender] = true;
  m.reply('convertir la imagen a dibujos animados');
  const img = await q.download?.();
  try {
    Cartoon(img).then(async (response) => {
      if (response.message == 'success') {
        await conn.sendFile(
            m.chat,
            response.download.full,
            '',
            'La operación fue exitosa♥  >//<',
            m,
        );
        const name = await conn.getName(m.sender);
        const sticker = new Sticker(response.download.head, {
          pack: global.packname,
          author: name,
          type: StickerTypes.FULL,
          categories: ['🤩', '🎉'],
          id: randomId(),
          quality: 100,
          background: '#00000000',
        });
        conn.sendMessage(m.chat, await sticker.toMessage(), {quoted: m});
      } else {
        m.reply(
            'Disculpe amigo, la imagen no muestra un rostro, envíe una imagen en la que el rostro esté expuesto y visible.',
        );
      }
    });
  } catch {
    m.reply('Process failed :(');
  } finally {
		conn.cartoon[m.sender] ? delete conn.cartoon[m.sender] : false;
  }
};
handler.help = ['cartoon'];
handler.tags = ['ai'];
handler.command = ['cartoon'];

handler.premium = false;

export default handler;
