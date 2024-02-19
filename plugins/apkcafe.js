import cheerio from 'cheerio';
import fetch from 'node-fetch';

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    text,
    command
}) => {

    let lister = [
        "s",
        "d"
    ]

    let [feature, inputs, inputs_, inputs__, inputs___] = text.split("+")
    if (!lister.includes(feature)) return m.reply("*هذا الامر خاص بتحميل التطبيقات من موقع \n https://apk.cafe/\nيمكنك تحميل التطبيقات من هذا الامر من خلال كتابة\n*.apkcafe s+instagram lite*\nبعد ان تحصل على رابط التطبيق تعود للبوت وتكتب له هذا الامر لتحميله\n*.apkcafe d+*(رابط التطبيق) \n\n\n*options*\n" + lister.map((v, index) => "  ○ " + v).join("\n"))

    if (lister.includes(feature)) {

        if (feature == "s") {
            if (!inputs) return m.reply("مثال:\n.apkcafe s+instagram lite")
            await m.reply(wait)
            try {
                let res = await searchApp(inputs)
                let teks = res.map((item, index) => {
                    return `🔍 *[ RESULT ${index + 1} ]*

📢 *title:* ${item.name}
🌐 *url:* ${item.href}
🖼️ *image:* ${item.imgUrl}
🔖 *name:* ${item.rightHref}
`

                }).filter(v => v).join("\n\n________________________\n\n")
                await m.reply(teks)
            } catch (e) {
                await m.reply('error')
            }
        }

        if (feature == "d") {
            if (!inputs) return m.reply("مثال \n .apkcafe d+https://instagram-lite.apk.cafe")
            await m.reply(wait)
            try {
                let obje = await getInfo(inputs)
                let item = obje.version[0]
                let cap = `🔍 *[ RESULT ]*

📌 *title:* ${item.title}
🖼️ *image:* ${item.image}
🔗 *url:* ${item.url}
⬇️ *downloadLink:* ${item.downloadLink}
📦 *fileSize:* ${item.fileSize}
📱 *deviceInfo:* ${item.deviceInfo}
🤖 *androidVersion:* ${item.androidVersion}
💾 *downloadText:* ${item.download.downloadText}
🔗 *directLink:* ${item.download.directLink}
📋 *apkTechnicalInfo:*
${Object.entries(item.download.apkTechnicalInfo)
  .map(([key, value]) => { return key + value.trim() })
  .join('\n')}
`
                await conn.sendFile(m.chat, item.image || logo, "", cap, m)
                await conn.sendFile(m.chat, item.download.directLink || logo, item.title || 'Tidak diketahui', null, m, true, {
                    quoted: m,
                    mimetype: "application/vnd.android.package-archive"
                })
            } catch (e) {
                await m.reply('error')
            }
        }
    }
}
handler.help = ["apkcafe"]
handler.tags = ["applications"]
handler.command = /^(apkcafe)$/i
handler.premium = false
export default handler

/* New Line */
async function searchApp(query) {
    const url = `https://apk.cafe/ajax/apk-search.php?s=${query}`;
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const results = [];

    $('.sugg_row').each((index, element) => {
        const suggImg = $(element).find('.sugg_img');
        const suggText = $(element).find('.sugg_text');
        const suggRight = $(element).find('.sugg_right');

        const app = {
            href: suggImg.attr('href'),
            imgUrl: suggImg.find('img').attr('src'),
            name: suggText.text(),
            rightHref: suggRight.attr('href')
        };

        results.push(app);
    });

    return results;
}

async function getInfo(url) {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const appDetails = [];

    const promises = $('li.dwn_up').map(async (index, element) => {
        const downloadLink = $(element).find('a.dwn1').attr('href');
        if (downloadLink.includes('https://apk.cafe/download?file_id')) {
            const fileSize = $(element).find('a.dwn1 span').text().trim();
            const deviceInfo = $(element).find('div.additional_file_info b').text().trim();
            const androidVersion = $(element).find('div.additional_file_info').find('.f_ifo:last-child').text().trim();

            const download = await getDetails(downloadLink);

            const app = {
                title: $('meta[property="og:title"]').attr('content'),
                image: $('meta[property="og:image"]').attr('content'),
                url: $('meta[property="og:url"]').attr('content'),
                downloadLink,
                fileSize,
                deviceInfo,
                androidVersion,
                download
            };

            appDetails.push(app);
        }
    }).get();

    await Promise.all(promises);

    return {
        version: appDetails
    };
}

async function getDetails(url) {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const appDetails = {};

    const downloadText = $('.text_up2 .text_up').text().trim();
    const directLink = $('.text_up2 .download_text a.dwnDirect').attr('href');

    appDetails.downloadText = downloadText;
    appDetails.directLink = directLink;

    const apkTechnicalInfo = {};

    $('.dwn_params_wrap .dwn_params li').each((index, element) => {
        const key = $(element).find('b').text().trim().replace(':', '');
        const value = $(element).text().replace(key, '').trim();

        apkTechnicalInfo[key] = value;
    });

    appDetails.apkTechnicalInfo = apkTechnicalInfo;

    return appDetails;
                      }
