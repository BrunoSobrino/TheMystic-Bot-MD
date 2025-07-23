import Jimp from 'jimp';

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  try {
    const userJid = conn.user.jid;
    const quoted = m.quoted ? m.quoted : m;

    if (!m.quoted) {
      throw `*[❗𝐈𝐍𝐅𝐎❗] NO SE ENCONTRO LA IMAGEN, POR FAVOR RESPONDE A UNA IMAGEN USANDO EL COMANDO ${usedPrefix + command}*`;
    }

    const mime = (quoted.mimetype || quoted.mimetype) || '';
    const imgData = await quoted.download();
    const jid = await userJid;

    async function processImage(imgBuffer) {
      const image = await Jimp.read(imgBuffer);
      const resized = image.getWidth() > image.getHeight()
        ? image.resize(720, Jimp.AUTO)
        : image.resize(Jimp.AUTO, 720);

      return {
        img: await resized.getBufferAsync(Jimp.MIME_JPEG)
      };
    }

    const { img } = await processImage(imgData);

    await conn.query({
      tag: 'iq',
      attrs: {
        to: jid,
        type: 'set',
        xmlns: 'w:profile:picture'
      },
      content: [
        {
          tag: 'picture',
          attrs: { type: 'image' },
          content: img
        }
      ]
    });

    m.reply('*[❗𝐈𝐍𝐅𝐎❗] SE CAMBIO CON EXITO LA FOTO DE PERFIL DEL NUMERO DEL BOT*');
  } catch {
    throw `*[❗𝐈𝐍𝐅𝐎❗] NO SE ENCONTRO LA IMAGEN, POR FAVOR RESPONDE A UNA IMAGEN USANDO EL COMANDO ${usedPrefix + command}*`;
  }
};

handler.command = /^setppbot$/i;
handler.rowner = true;

export default handler;


/* let handler = async (m, { conn, usedPrefix, command }) => {
let bot = conn.user.jid
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (/image/.test(mime)) {
let img = await q.download()
if (!img) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾 𝚂𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙾 𝙻𝙰 𝙸𝙼𝙰𝙶𝙴𝙽, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚄𝚂𝙰𝙽𝙳𝙾 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`
await conn.updateProfilePicture(bot, img)
conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝚂𝙴 𝙲𝙰𝙼𝙱𝙸𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾 𝙻𝙰 𝙵𝙾𝚃𝙾 𝙳𝙴 𝙿𝙴𝚁𝙵𝙸𝙻 𝙳𝙴𝙻 𝙽𝚄𝙼𝙴𝚁𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃*', m)
} else throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾 𝚂𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙾 𝙻𝙰 𝙸𝙼𝙰𝙶𝙴𝙽, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙴 𝙰 𝚄𝙽𝙰 𝙸𝙼𝙰𝙶𝙴𝙽 𝚄𝚂𝙰𝙽𝙳𝙾 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`}
handler.command = /^setppbot$/i
handler.rowner = true
export default handler*/
