import { sticker } from '../lib/sticker.js';
import { Uploader } from '../lib/uploader.js';
import crypto from 'crypto';
import axios from 'axios';

const upload = new Uploader();

async function Quotly(data) {
  try {
    const response = await axios.post('https://qc.sazumi.moe/generate', data, { headers: { 'Content-Type': 'application/json' } });
    return Buffer.from(response?.data?.result?.image, 'base64') || null;
  } catch (e) {
    console.error('Quotly Error:', e);
    return null;
  }
}

const handler = async (m, { conn, text }) => {
  try {
    const q = m.quoted || null;
    const mime = q?.mimetype || null;
    const allowed = ['image', 'video', 'webp'];

    const mediaUrl = mime && allowed.includes(mime.split('/')[0]) ? await upload.uploadPomf2(await q?.download()) || null : null;

    const replyMessage = (q?.text || q?.caption || mime) && {
      name: await conn.getName(q?.sender),
      text: q?.text || q?.caption || '',
      chatId: parseInt(crypto.createHash('md5').update(q?.sender).digest('hex'), 16)
    };

    const json = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#FFFFFF',
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        media: mediaUrl && { url: `https://wsrv.nl/?url=${mediaUrl}&output=png` },
        avatar: true,
        from: {
          id: parseInt(crypto.createHash('md5').update(m.sender).digest('hex'), 16),
          name: await conn.getName(m.sender),
          photo: { url: await conn.profilePictureUrl(m.sender, 'image').catch(_ => logo) }
        },
        text: text || q?.text || q?.caption || m?.text || m?.caption || '',
        replyMessage
      }]
    };

    const buffer = await Quotly(json);
    if (!buffer) return m.reply('فشلنا في تلبية طلبكم.');

    const stickerBuffer = await sticker(buffer, false, await conn.getName(m.sender), m.sender.split('@')[0]);
    if (!stickerBuffer) return m.reply('Error creating sticker.');

    await conn.sendFile(m.chat, stickerBuffer, 'Quotly.webp', '', m);
  } catch (error) {
    console.error('Handler Error:', error);
  }
};

handler.help = ['qc'];
handler.tags = ['sticker'];
handler.command = /^(qc)$/i;

export default handler;
