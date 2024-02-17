import {
    aiovideodl,
    savefrom
} from '@bochilteam/scraper'
import fetch from 'node-fetch'
import got from 'got';
import {
    createContext,
    Script
} from 'vm';

let handler = async (m, {
    command,
    usedPrefix,
    conn,
    text,
    args
}) => {

    let lister = [
        "1",
        "2"
    ]
    let spas = "                "
    let [feature, inputs, inputs_, inputs__, inputs___] = text.split(" ")
    if (!lister.includes(feature.toLowerCase())) return m.reply("*مثال:*\n" + usedPrefix + command + " 2 (الرابط)\n\n\n" + lister.map((v, index) => "  ○ " + v.toUpperCase()).join("\n"))

    if (lister.includes(feature)) {

        if (feature == "1") {
            if (!inputs) return m.reply("نسيت اللينك يحب")
            await m.reply(wait)
            try {
            let Sv = await savefrom(inputs).catch(async _ => await aiovideodl(inputs))
            let S = Sv[0].meta
            let SvCap = `${spas}*[ مليش دعوه بذنوب اغانيك ربنا يهديني ويهديك ]*

*🔗 المصدر:* ${S.source}
*📖 العنوان:* ${S.title}
*⏱ المدة:* ${S.duration}
`
            await conn.sendFile(m.chat, Sv[0].url[0].url, "", SvCap, m)
            } catch (e) {
            await m.reply(eror)
            }

        }
        if (feature == "2") {
            if (!inputs) return m.reply("ضيف اللينك يحب")
            await m.reply(wait)
            try {
            let Sv = await SaveFrom(inputs)
            let S = Sv.meta
            let SvCap = `${spas}*[ مليش دعوه بذنوب اغانيك ربنا يهديني ويهديك ]*

*🔗 المصدر:* ${S.source}
*📖 العنوان:* ${S.title}
*⏱ المدة:* ${S.duration}
`
            await conn.sendFile(m.chat, Sv.url[0].url, "", SvCap, m)
            } catch (e) {
            await m.reply(eror)
            }
        }

    }
}
handler.help = ['savefrom'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(down|تحميل)$/i

export default handler

async function SaveFrom(url) {
    const req = await got.post('https://worker.sf-tools.com/savefrom.php', {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            origin: 'https://pt.savefrom.net',
            referer: 'https://pt.savefrom.net/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
        },
        form: {
            sf_url: url,
            sf_submit: '',
            new: 2,
            lang: 'pt',
            app: '',
            country: 'br',
            os: 'Windows',
            browser: 'Chrome',
            channel: ' main',
            'sf-nomad': 1,
        },
    }).text();

    const executeCode = '[]["filter"]["constructor"](b).call(a);';
    const modifiedReq = req.replace(executeCode, `
    try {
      i++;
      if (i === 2) scriptResult = ${executeCode.split('.call')[0]}.toString();
      else ${executeCode.replace(/;/, '')};
    } catch {}
  `);

    const context = {
        scriptResult: '',
        i: 0,
    };

    createContext(context);
    new Script(modifiedReq).runInContext(context);

    const json = JSON.parse(context.scriptResult.split('window.parent.sf.videoResult.show(')?.[1]?.split(');')?.[0]);
    return json;
}
