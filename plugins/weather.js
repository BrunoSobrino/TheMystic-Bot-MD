import axios from "axios"
let handler = async (m, { args }) => {
if (!args[0]) throw "*إعطاء مكان للبحث*"
try {
const response = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`)
const res = await response
const name = res.data.name
const Country = res.data.sys.country
const Weather = res.data.weather[0].description
const Temperature = res.data.main.temp + "°C"
const Minimum_Temperature = res.data.main.temp_min + "°C"
const Maximum_Temperature = res.data.main.temp_max + "°C"
const Humidity = res.data.main.humidity + "%"
const Wind = res.data.wind.speed + "km/h"
const wea = `هنا هو الطقس مكان معين الخاص بك\n\n「 📍 」المكان: ${name}\n「 🗺️ 」الدولة: ${Country}\n「 🌤️ 」المنظر: ${Weather}\n「 🌡️ 」 درجات الحرارة: ${Temperature}\n「 💠 」 درجة الحرارة القصوى: ${Minimum_Temperature}\n「 📛 」 درجة الحرارة القصوى: ${Maximum_Temperature}\n「 💦 」 الرطوبة: ${Humidity}\n「 🌬️ 」  سرعة الرياح: ${Wind}\n\n🛡️البوت الأمير السويدي ياسين🛡️`
m.reply(wea)
} catch {
return "*خطأ*"}}
handler.help = ['weather *<place>*']
handler.tags = ['tools']
handler.command = /^(climate|weather|mosam)$/i
export default handler
