import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*هذا الأمر يقوم بإنشاء صور من ملحوظات النص*\n\n*مثال على الاستخدام*\n*◉ ${usedPrefix + command} فتاة أنيمي جميلة*\n*◉ ${usedPrefix + command} إيلون ماسك بلون وردي الناتج*`;

  try {
    m.reply('*يرجى الانتظار، جار إنشاء الصور...*');

    const endpoint = `https://gurugpt.cyclic.app/dalle?prompt=${encodeURIComponent(text)}`;
    const response = await fetch(endpoint);
    
    if (response.ok) {
      const imageBuffer = await response.buffer();
      await conn.sendFile(m.chat, imageBuffer, 'image.png', null, m);
    } else {
      throw '*فشل إنشاء الصورة*';
    }
  } catch {
    throw '*عذرًا! حدث خطأ ما أثناء إنشاء الصور. يرجى المحاولة مرة أخرى لاحقًا.*';
  }
};

handler.help = ['dalle'];
handler.tags = ['AI'];
handler.command = ['dalle', 'رسم', 'ارسم', 'openai2'];
export default handler;