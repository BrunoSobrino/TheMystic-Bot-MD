import fetch from 'node-fetch';
import cheerio from 'cheerio';
import translate from 'translate-google-api';

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

async function alquran(surah, ayat) {
    let res = await fetch(`https://kalam.sindonews.com/ayat/${ayat}/${surah}`);
    if (!res.ok) throw 'عذرا لم نجد ما تبحث عنه';
    let $ = cheerio.load(await res.text());
    let content = $('body > main > div > div.content.clearfix > div.news > section > div.list-content.clearfix');
    let Surah = $(content).find('div.ayat-title > h1').text();
    let arab = $(content).find('div.ayat-detail > div.ayat-arab').text();
    let latin = $(content).find('div.ayat-detail > div.ayat-latin').text();
    let terjemahan = $(content).find('div.ayat-detail > div.ayat-detail-text').text();
    let tafsir = '';
    $(content).find('div.ayat-detail > div.tafsir-box > div').each(function () {
        tafsir += $(this).text() + '\n';
    });
    tafsir = tafsir.trim();
    let keterangan = $(content).find('div.ayat-detail > div.ayat-summary').text();
    let audio = `https://quran.kemenag.go.id/cmsq/source/s01/${surah < 10 ? '00' : surah >= 10 && surah < 100 ? '0' : ''}${surah}${ayat < 10 ? '00' : ayat >= 10 && ayat < 100 ? '0' : ''}${ayat}.mp3`;
    return {
        surah: Surah,
        arab,
        latin,
        terjemahan,
        tafsir,
        audio,
        keterangan,
    };
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!(args[0] || args[1])) return conn.reply(m.chat, `هذا الأمر من خلاله ستعرف تفسير أي آية في القرآن يجب أن تكون عارفاً لترتيب السور في القرآن حتى يشتغل معك الامر : لتشغيل هذه الميزة سوف تكتب الامر متبوعا برقم السورة ثم رقم الاية التي تريدها مثال \n\n*.coran* 1 3 \n\nالرقم 1 يرمز لسورة الفاتحة لانها اول سورة في المصحف ثم الرقم 3 تشير الى الاية التي اريد ان اعرف تفسيرها ♥`, m);
    if (isNaN(args[0]) || isNaN(args[1])) conn.reply(m.chat, `هذا الأمر من خلاله ستعرف تفسير اي اية في القرآن يجب ان تكون عارفا لترتيب السور في القرآن حتى يشتغل معك الامر : لتشغيل هذه الميزة سوف تكتب الامر متبوعا برقم السورة ثم رقم الاية التي تريدها مثال \n\n*.coran* 1 3 \n\nالرقم 1 يرمز لسورة الفاتحة لانها اول سورة في المصحف ثم الرقم 3 تشير الى الاية التي اريد ان اعرف تفسيرها ♥`, m);
    let res = await alquran(args[0], args[1]);

    // Translate the Indonesian translation and tafsir to Arabic
    let terjemahanArab = await translate(res.terjemahan, { to: 'ar' });
    let tafsirArab = await translate(res.tafsir, { to: 'ar' });

    conn.reply(m.chat, `
${res.arab}
${res.latin}

${res.terjemahan}
${readMore}
${tafsirArab}

${terjemahanArab}
( ${res.surah} )
`, m, { quoted: m });

    conn.sendFile(m.chat, res.audio, 'audio.mp3', '', m);
};

handler.help = ['coran'];
handler.tags = ['islam'];
handler.command = /^coran$/i;
export default handler;
