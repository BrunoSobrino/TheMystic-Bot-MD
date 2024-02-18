import fetch from 'node-fetch'
import { pinterest } from '../lib/scrape.js'

let handler = async (m, { conn, command, text, usedPrefix }) => {

  try {
    const hasil = await pinterest('Dragon ball z');
    let gambarUrls = hasil.slice(0, 20); // Ambil 20 gambar pertama

    // Mengacak array gambarUrls
    for (let i = gambarUrls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gambarUrls[i], gambarUrls[j]] = [gambarUrls[j], gambarUrls[i]];
    }

    // Mengirim 10 gambar secara acak
    for (let i = 0; i < 5; i++) {
      let imageUrl = gambarUrls[i];
      let imageRes = await fetch(imageUrl);
      let imageBuffer = await imageRes.buffer();

      // Menggunakan fungsi sendImage untuk mengirim gambar ke WhatsApp
      await conn.sendFile(m.chat, imageBuffer, 'Dragon-ball-z.jpg', '');

      // Tambahkan jeda agar tidak mengirim gambar terlalu cepat
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    console.log(e)
    conn.reply(m.chat, 'Error', m)
  }
}

handler.help = ['dragon-ball-z']
handler.tags = ['anime']
handler.command = /^dragon-ball-z$/i
export default handler
