import Starlights from '@StarlightsTeam/Scraper';

let handler = async (m, { conn, args, usedPrefix, command }) => {

  if (!args || !args[0]) return conn.reply(m.chat, '🚩 الرجاء إدخال رابط فيديو TikTok مع الأمر.\n\n`مثال:`\n' + `> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m);

  if (!args[0].match(/tiktok/gi)) {
    await conn.reply(m.chat, `تأكد من أن الرابط خاص بـ TikTok`, m);
    return await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
  }

  await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

  try {
    const url = args[0];

    // استخراج البيانات من الفيديو
    let { title, author, duration, views, likes, comment, share, published, downloads, dl_url, thumbnail } = await Starlights.tiktokdl(url);

    let txt = '`◉—✩ تيـكـتوك  -  تـحـمـيـل ✩—◉`\n\n';
    txt += `	✩  *العنوان* : ${title}\n`;
    txt += `	✩  *الكاتب* : ${author}\n`;
    txt += `	✩  *المدة* : ${duration} ثواني\n`;
    txt += `	✩  *المشاهدات* : ${views}\n`;
    txt += `	✩  *الإعجابات* : ${likes}\n`;
    txt += `	✩  *التعليقات* : ${comment}\n`;
    txt += `	✩  *المشاركات* : ${share}\n`;
    txt += `	✩  *تاريخ النشر* : ${published}\n`;
    txt += `	✩  *الرابط* : ${dl_url}\n`;
    txt += `	✩  *عدد التحميلات* : ${downloads}\n\n`;
    txt += `> ✩  *أنتظر جاري إرسال الملفات ...*\n\n`;

    // إرسال الرسالة مع التفاصيل
    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: `🔍 ${title}`,
          body: `🗄️ ${author}`,
          thumbnailUrl: thumbnail, // الصورة المصغرة من البيانات
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // إرسال الفيديو مع الصورة المصغرة
    await conn.sendMessage(m.chat, {
      video: { url: dl_url },
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2, // تحديد mediaType إلى 2 لرسالة الفيديو
          mediaUrl: url,
          title: `🎬 ${title}`,
          body: `بقلم ${author} | ${views} مشاهدة`,
          sourceUrl: url,
          thumbnail: { url: thumbnail } // الصورة المصغرة من الفيديو
        }
      }
    }, { quoted: m });

    // إرسال الصوت مع الصورة المصغرة
    await conn.sendMessage(m.chat, {
      audio: { url: dl_url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: url,
          title: `🎵 ${title}`,
          body: `الاستماع الآن | بقلم ${author}`,
          sourceUrl: url,
          thumbnail: { url: thumbnail } // الصورة المصغرة من الفيديو
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });

  } catch (e) {
    await conn.reply(m.chat, '⚠️ حدث خطأ أثناء محاولة تحميل الفيديو.', m);
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
  }
};

handler.help = ['tiktok *<رابط tt>*'];
handler.tags = ['downloader'];
handler.command = /^(تيكس)$/i;

export default handler;
