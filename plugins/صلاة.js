.//قناتي https://whatsapp.com/channel/0029VadAOFcL2ATzSf46sI0r
import axios from 'axios';

const handler = async (m, { text }) => {
    if (!text) {
        return m.reply('يرجى تحديد اسم المدينة لعرض مواقيت الصلاة. مثال:\n\n.الصلاة القاهرة');
    }

    try {
        const prayerResponse = await axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${text}&country=EG`);
        const prayerData = prayerResponse.data.data.timings;

        const message = `مواقيت الصلاة في ${text} اليوم:\n- الفجر: ${prayerData.Fajr}\n- الشروق: ${prayerData.Sunrise}\n- الظهر: ${prayerData.Dhuhr}\n- العصر: ${prayerData.Asr}\n- المغرب: ${prayerData.Maghrib}\n- العشاء: ${prayerData.Isha}`;
        m.reply(message);
    } catch (error) {
        console.error('حدث خطأ في الحصول على مواقيت الصلاة:', error);
        m.reply('عذرًا، لم أتمكن من العثور على مواقيت الصلاة لهذه المدينة.');
    }
}

handler.command = ['الصلاة', 'مواقيت_الصلاة']
handler.tags = ['tools']

export default handler

