import axios from "axios"
let handler = async (m, { args }) => {
if (!args[0]) throw "*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚂𝙲𝚁𝙸𝙱𝙰 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝚂𝚄 𝙿𝙰𝙸𝚂 𝙾 𝙲𝙸𝚄𝙳𝙰𝙳*"
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
const wea = `「 📍 」𝙻𝚄𝙶𝙰𝚁: ${name}\n「 🗺️ 」𝙿𝙰𝙸𝚂: ${Country}\n「 🌤️ 」𝚃𝙸𝙴𝙼𝙿𝙾: ${Weather}\n「 🌡️ 」𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰: ${Temperature}\n「 💠 」 𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰 𝙼𝙸𝙽𝙸𝙼𝙰: ${Minimum_Temperature}\n「 📛 」 𝚃𝙴𝙼𝙿𝙴𝚁𝙰𝚃𝚄𝚁𝙰 𝙼𝙰𝚇𝙸𝙼𝙰: ${Maximum_Temperature}\n「 💦 」𝙷𝚄𝙼𝙴𝙳𝙰𝙳: ${Humidity}\n「 🌬️ 」 𝚅𝙸𝙴𝙽𝚃𝙾: ${Wind}`
m.reply(wea)
} catch {
return "*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾 𝚂𝙴 𝙷𝙰𝙽 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙾 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂, 𝙲𝙾𝚁𝚁𝙾𝙱𝙾𝚁𝙴 𝚀𝚄𝙴 𝙷𝙰𝚈𝙰 𝙴𝚂𝙲𝚁𝙸𝚃𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴 𝚂𝚄 𝙿𝙰𝙸𝚂 𝙾 𝙲𝙸𝚄𝙳𝙰𝙳*"}}
handler.help = ['clima *<ciudad/país>*']
handler.tags = ['herramientas']
handler.command = /^(clima|tiempo)$/i
export default handler
