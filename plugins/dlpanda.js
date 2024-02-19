import cheerio from 'cheerio';
import fetch from 'node-fetch';

const handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {

    const msg = `هذا الأمر خاص بتحميل فيديوات التكتوك مثال :\n*.dlpanda* https://www.tiktok.com/@mr_nima_._._x/video/7185424580108897563`;
    let text
    if (args.length >= 1) {
        text = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else throw msg;

    await m.reply(wait);

    try {
        const data = await dlPanda(text);
        if (data.video.length === 0) {
            for (let i = 0; i < data.image.length; i++) {
                await conn.sendFile(m.chat, data.image[i].src, '', `Image *(${i + 1}/${data.image.length})*`, m, false, {
                    mentions: [m.sender]
                });
            }
        } else {
            for (let i = 0; i < data.video.length; i++) {
                await conn.sendFile(m.chat, data.video[i].src, '', `instagram.com/noureddine_ouafy *(${i + 1}/${data.video.length})*`, m, false, {
                    mentions: [m.sender]
                });
            }
        }
    } catch (error) {
        throw eror
    }
};

handler.help = ["dlpanda"];
handler.tags = ["downloader"];
handler.command = /^(dlpanda)$/i;
export default handler;

async function dlPanda(url) {
    try {
        const response = await fetch(`https://dlpanda.com/id?url=${url}&token=G7eRpMaa`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const results = {
            image: [],
            video: []
        };

        $('div.hero.col-md-12.col-lg-12.pl-0.pr-0 img, div.hero.col-md-12.col-lg-12.pl-0.pr-0 video').each(function() {
            const element = $(this);
            const isVideo = element.is('video');
            const src = isVideo ? element.find('source').attr('src') : element.attr('src');

            // Tambahkan awalan "https:" jika src hanya berisi "//"
            const fullSrc = src.startsWith('//') ? 'https:' + src : src;

            results[isVideo ? 'video' : 'image'].push({
                src: fullSrc,
                width: element.attr('width'),
                ...(isVideo ? {
                    type: element.find('source').attr('type'),
                    controls: element.attr('controls'),
                    style: element.attr('style')
                } : {})
            });
        });

        return results;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
