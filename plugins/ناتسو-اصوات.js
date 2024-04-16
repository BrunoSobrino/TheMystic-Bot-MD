let handler = m => m
handler.all = async function (m) {
    let chat = global.db.data.chats[m.chat]
    global.db.data.users[m.sender].money += 50
    global.db.data.users[m.sender].exp += 50

    const audioResponses = [
        { trigger: /^ايتاتشي$/i, file: './media/animevoice (1).mp3' },
        { trigger: /لايت/gi, file: './media/animevoice (2).mp3' },
        { trigger: /ليفاي/gi, file: './media/animevoice (3).mp3' },
        { trigger: /اوهايو|صباح الخير|صباحو|ثباحو/gi, file: './media/animevoice (4).mp3' },
        { trigger: /ناروتو|داتي بايو|اوزوماكي|اوزوماكي ناروتو/gi, file: './media/animevoice (5).mp3' },
        { trigger: /اهرب|اهربو|ليش اهرب|حديقة الظلام/gi, file: './media/animevoice (6).mp3' },
        { trigger: /ساسكي/gi, file: './media/animevoice (7).mp3' },
        { trigger: /ايرين|تاتاكاي|حارب|تستطيع|انت تستطيع|تقدر|انت لها/gi, file: './media/animevoice (8).mp3' },
        { trigger: /مادارا/gi, file: './media/animevoice (9).mp3 vives.mp3' },
        { trigger: /ياميتيي كوداساي/gi, file: './media/animevoice (10).mp3' },
        { trigger: /صوت-انمي11|صوت انمي11/gi, file: './media/animevoice (11).mp3' },
        { trigger: /مضحك|اضحك|اهرب|اهربو|امزح|عم امزح|يضحك|ضحكني|ضحكتني|اضحكتني/gi, file: './media/animevoice (12).mp3' },
        { trigger: /تانجيرو/gi, file: './media/animevoice (13).mp3' },
        { trigger: /باكا/gi, file: './media/animevoice (14).mp3' },
        { trigger: /باي باي|^باي|مع السلامة|بتوفيق|بالتوفيق/gi, file: './media/animevoice (15).mp3' },
        { trigger: /قوي|اقوى|لاتخاف|خايف|يمه|ياماما|تكفى|بليز|ارجوك|ارجوك|غوجو/gi, file: './media/animevoice (16).mp3' },
        { trigger: /حاول|اتحداك|سوكونا|قمبري قمبري|قمبري|انزلي/gi, file: './media/animevoice (17).mp3' },
        { trigger: /انا قوي|انا اقوى منك|انا احسن منك|بجلدك|بصفقك|بهينك|الذري|النطاق الذري|نووي/gi, file: './media/animevoice (18).mp3' },
        { trigger: /راسينغان|راسينجان/gi, file: './media/asen.mp3' },
        { trigger: /انتقال|^أنتقال|مع السلامة|بروح|بنقلع|سوف اذهب|الى اللقاء|وداعا|انا قادم|جايك|انا ذاهب|بجي|بجيك^/gi, file: './media/flash.mp3' },
        { trigger: /موشي موش|موش موش|موش موشي/gi, file: './media/moshi moshi.mp3' },
        { trigger: /يههه ياميتي|ياميتيي/gi, file: './media/Yamete-kudasai.mp3' },
        { trigger: /$02^|زيرو تو/gi, file: './media/ohayo.mp3' },
        { trigger: /اوني-تشان|اوني تشان|اونيه|اوني|اونيه تشان/gi, file: './media/Onichan.mp3' },
        { trigger: /الدون$|كريستيانو|رونالدو^/gi, file: './media/siu.mp3' },
        { trigger: /ايديت|ايدت|مونتاج|تصميم/gi, file: './media/Menuvid1.mp4' },
        { trigger: /Shadow|شادو|^سيد$|كاغينو|كغينو سيد/gi, file: './media/Menuvid2.mp4' },
        { trigger: /حديقة الظلام/gi, file: './media/Menuvid3.mp4' },
        { trigger: /جوي بوي|قير فايف/gi, file: './media/joyboy.mp3' },  
        { trigger: /ساتي|ساتي ساتي ساتي|ساتي ساتي|ميليوداس/gi, file: './media/sate sate sate.mp3' },      
        { trigger: /غني|غناء|غنيلي/gi, file: './media/luffy.mp3' },
        { trigger: /جوي بوي|نيكا|لوفي/gi, file: './media/jooyboy.mp3' },
        { trigger: /مارح استسلم|استسلم|استسلام|انا استسلم|انا انتهيت|استا|فقدت الأمل|فقدت الشغف|مادادا/gi, file: './media/madada.mp3' },
    ];

    for (const response of audioResponses) {
        if (chat.audios && response.trigger.test(m.text)) {
            let vn = response.file;
            this.sendPresenceUpdate('recording', m.chat);
            this.sendFile(m.chat, vn, 'error.mp3', null, m, true, { type: 'audioMessage', ptt: true });
        }
    }

    return !0;
}
export default handler;
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
         }
