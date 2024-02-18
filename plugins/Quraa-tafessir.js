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
        "list",
        "surah",
        "tafsir"
    ]

    let [feature, inputs, inputs_, inputs__, inputs___] = text.split(" ")
    if (!lister.includes(feature)) return m.reply("*Example:*\n.nu search vpn\n\n*Pilih type yg ada*\n" + lister.map((v, index) => "  ○ " + v).join("\n"))

    if (lister.includes(feature)) {

        if (feature == "list") {
            await m.reply(wait)
            try {
                let res = await surahList()
                let teks = res.surahList.map((item, index) => {
                    return `🔍 *[ RESULT ${index + 1} ]*

📚 Name: ${item.name}
🔗 Link: ${item.link}
📝 No: ${item.number}
  `
                }).filter(v => v).join("\n\n________________________\n\n")
                await m.reply(teks)
            } catch (e) {
                await m.reply('error')
            }
        }

        if (feature == "surah") {
            if (!inputs) return m.reply("Input query link\nExample: .nu surah 5\nList: .nu list")
            await m.reply(wait)
            try {
                let res = await surahList()
                let data = await surahAyah(res.surahList[parseInt(inputs) + 1].link)
                let teks = data.map((item, index) => {
                    return `🔍 *[ RESULT ${index + 1} ]*

📖 Arab: ${item.quranTitle}
🌐 Latin: ${item.quranLatin}
🌍 Translate: ${item.quranTranslate}
🔗 Link: ${item.url}
`
                }).filter(v => v).join("\n\n________________________\n\n")
                await m.reply(teks)
            } catch (e) {
                await m.reply('error')
            }
        }
        
        if (feature == "tafsir") {
            if (!inputs) return m.reply("Input query link\nExample: .nu 2 5\nList: .nu list")
            if (!inputs_) return m.reply("Input query link\nExample: .nu 2 5\nList: .nu list")
            await m.reply(wait)
            try {
                let res = await surahList()
                let data = await surahAyah(res.surahList[parseInt(inputs) + 1].link)
                let item = await surahTafsir(data[parseInt(inputs_) + 1].url)
                let teks = `🔍 *[ RESULT ]*

📖 Tafsir Tahlili: ${item.firstText}
📘 Tafsir Wajiz: ${item.secondText}
`
                await m.reply(teks)

            } catch (e) {
                await m.reply('error')
            }
        }
        
        
    }
}
handler.help = ["coran"]
handler.tags = ["islam"]
handler.command = /^(coran)$/i
export default handler

/* New Line */

// Fungsi untuk memeriksa apakah format input adalah nomor
function isNumberFormat(input) {
    return /^\d+$/.test(input);
}

async function surahList() {
  try {
  	const url = 'https://quran.nu.or.id/al-fatihah'; // Ganti dengan URL yang sesuai
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const surahList = $('.flex.justify-center .mr-1 select option').map((index, element) => ({
      name: $(element).val().split('/')[1],
      number: $(element).text().trim().split('.')[0],
      link: 'https://quran.nu.or.id' + $(element).val(),
    })).get();

    const ayahList = $('#ayah-select option').map((index, element) => $(element).val()).get();

    return { surahList, ayahList };
  } catch (error) {
    console.log(error);
    return null;
  }
};

async function surahAyah(query){
  try {
  const url = query; // Ganti dengan URL yang sesuai
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const data = [];

    $('div[id^="ayah"]').each((index, element) => {
      const url = 'https://quran.nu.or.id' + $(element).find('a[href^="/"]').attr('href');
      const tafsir = $(element).find('a[href^="/"]').next().text().trim();
      const quranTitle = $(element).find('.text-right.font-omar.text-3xl').text().trim();
      const quranLatin = $(element).find('.font-omar.text-2xl').text().trim();
      const quranTranslate = $(element).find('.font-inter').text().trim();

      data.push({ url, tafsir, quranTitle, quranLatin, quranTranslate });
    });

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

async function surahTafsir(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const firstText = $('#first').find('p.font-inter').text().trim();
    const secondText = $('#second').find('p.font-inter').text().trim();

    return { firstText, secondText };
  } catch (error) {
    console.log(error);
    return null;
  }
};
