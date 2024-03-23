import axios from 'axios';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas_clima
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {args}) => {
  if (!args[0]) throw tradutor.texto1;
  try {
    const response = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
    const res = await response;
    const name = res.data.name;
    const Country = res.data.sys.country;
    const Weather = res.data.weather[0].description;
    const Temperature = res.data.main.temp + '°C';
    const Minimum_Temperature = res.data.main.temp_min + '°C';
    const Maximum_Temperature = res.data.main.temp_max + '°C';
    const Humidity = res.data.main.humidity + '%';
    const Wind = res.data.wind.speed + 'km/h';
    const wea = `${tradutor.texto2[0]} ${name}\n${tradutor.texto2[1]} ${Country}\n${tradutor.texto2[2]} ${Weather}\n${tradutor.texto2[3]} ${Temperature}\n${tradutor.texto2[4]} ${Minimum_Temperature}\n${tradutor.texto2[5]} ${Maximum_Temperature}\n${tradutor.texto2[6]} ${Humidity}\n${tradutor.texto2[7]} ${Wind}`;
    m.reply(wea);
  } catch {
    return tradutor.texto3;
  }
};
handler.help = ['clima *<ciudad/país>*'];
handler.tags = ['herramientas'];
handler.command = /^(clima|tiempo)$/i;
export default handler;
