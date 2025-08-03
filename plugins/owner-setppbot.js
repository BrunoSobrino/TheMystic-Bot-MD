import Jimp from 'jimp';

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const userJid = conn.user?.jid;
    const quoted = m.quoted ? m.quoted : m;

    if (!m.quoted || !quoted.mimetype?.includes('image')) throw `*[❗INFO❗] NO SE ENCONTRÓ LA IMAGEN. RESPONDE A UNA IMAGEN USANDO EL COMANDO ${usedPrefix + command}*`;

    const imgData = await quoted.download();
    const jpegBuffer = await processImage(imgData);

    await conn.updateProfilePicture(userJid, jpegBuffer);
    await m.reply('*[ ✅ ] SE CAMBIÓ CON ÉXITO LA FOTO DE PERFIL DEL BOT.*');
  } catch (err) {
    await m.reply(`*[❗ERROR❗] Ocurrió un error al intentar cambiar la foto de perfil:\n\n${err?.message || err}*`);
  }
};

handler.command = /^setppbot$/i;
handler.rowner = true;
export default handler;

async function processImage(imgBuffer) {
  const image = await Jimp.read(imgBuffer);
  const resized = image.getWidth() > image.getHeight() ? image.resize(720, Jimp.AUTO) : image.resize(Jimp.AUTO, 720);
  const jpegBuffer = await resized.getBufferAsync(Jimp.MIME_JPEG);
  return jpegBuffer;
}




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
