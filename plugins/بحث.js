import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, {conn, text}) => {
  if (!text) throw '⚠️ *_ما الذي تريد البحث عنه في يوتيوب؟_*';
  const results = await yts(text);
  const tes = results.all;
  const teks = results.all.map((v) => {
    switch (v.type) {
      case 'فيديو': return `
° *_${v.title}_*
↳ 🫐 *_لينك :_* ${v.url}
↳ 🕒 *_المده :_* ${v.timestamp}
↳ 📥 *_تم النشر :_* ${v.ago}
↳ 👁 *_المشاهدات :_* ${v.views}`;
    }
  }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m);
};
handler.help = ['ytsearch *<texto>*'];
handler.tags = ['search'];
handler.command = ['ytsearch' , 'yts' , 'بحث'];
export default handler;