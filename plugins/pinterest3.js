//By Shirokami Ryzen
//Dont delete this credit!!!
import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw `*يمكنك تحميل صور داك جودة عالية وممتازة من منصة pinterest عبر كتابة الامر متبوعا باسم الصورة التي تريد تحميلها مثال*\n\n*${usedPrefix + command} صورة الكون*`
  conn.reply(m.chat, '*انتظر قليلا يا عزيزي ...*', m)

  try {
    const hasil = await pinterest(text);
    let gambarUrls = hasil.slice(0, 20); // Ambil 20 gambar pertama

    // Mengacak array gambarUrls
    for (let i = gambarUrls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gambarUrls[i], gambarUrls[j]] = [gambarUrls[j], gambarUrls[i]];
    }

    // Mengirim 10 gambar secara acak
    for (let i = 0; i < 10; i++) {
      let imageUrl = gambarUrls[i];
      let imageRes = await fetch(imageUrl);
      let imageBuffer = await imageRes.buffer();

      // Menggunakan fungsi sendImage untuk mengirim gambar ke WhatsApp
      await conn.sendFile(m.chat, imageBuffer, 'boibza.jpg', '');

      // Tambahkan jeda agar tidak mengirim gambar terlalu cepat
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (e) {
    console.log(e)
    conn.reply(m.chat, 'حدث خطأ أثناء تنزيل الصورة.', m)
  }
}

handler.help = ['pinterest3']
handler.tags = ['downloader']
handler.command = /^pinterest3$/i

export default handler

async function pinterest(text) {
  try {
    const response = await fetch(`https://id.pinterest.com/search/pins/?autologin=true&q=${encodeURIComponent(text)}`, {
      headers: {
        "cookie": "_auth=1; _b=\"AXOtdcLOEbxD+qMFO7SaKFUCRcmtAznLCZY9V3z9tcTqWH7bPo637K4f9xlJCfn3rl4=\"; _pinterest_sess=TWc9PSZWcnpkblM5U1pkNkZ0dzZ6NUc5WDZqZEpGd2pVY3A0Y2VJOGg0a0J0c2JFWVpQalhWeG5iTTRJTmI5R08zZVNhRUZ4SmsvMG1CbjBWUWpLWVFDcWNnNUhYL3NHT1EvN3RBMkFYVUU0T0dIRldqVVBrenVpbGo5Q1lONHRlMzBxQTBjRGFSZnFBcTdDQVgrWVJwM0JtN3VRNEQyeUpsdDYreXpYTktRVjlxb0xNanBodUR1VFN4c2JUek1DajJXbTVuLzNCUDVwMmRlZW5VZVpBeFQ5ZC9oc2RnTGpEMmg4M0Y2N2RJeVo2aGNBYllUYjRnM05VeERzZXVRUVVYNnNyMGpBNUdmQ1dmM2s2M0txUHRuZTBHVFJEMEE1SnIyY2FTTm9DUEVTeWxKb3V0SW13bkV3TldyOUdrdUZaWGpzWmdaT0JlVnhWb29xWTZOTnNVM1NQSzViMkFUTjBpRitRRVMxaUFxMEJqell1bVduTDJid2l3a012RUgxQWhZT1M3STViSVkxV0dSb1p0NTBYcXlqRU5nPT0ma25kRitQYjZJNTVPb2tyVnVxSWlleEdTTkFRPQ==; _ir=0"
      }
    });
    const data = await response.text();
    const $ = cheerio.load(data);
    const result = [];
    const hasil = [];
    $('div > a').get().map(b => {
      const link = $(b).find('img').attr('src');
      result.push(link);
    });
    result.forEach(v => {
      if (v && v.includes('236')) {
        hasil.push(v.replace(/236/g, '736'));
      }
    });
    hasil.shift();
    return hasil;
  } catch (error) {
    throw error;
  }
}
