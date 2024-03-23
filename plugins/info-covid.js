import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.info_covid
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {text, usedPrefix, command}) => {
  if (!text) throw `${tradutor.texto1} ${usedPrefix + command} Mexico*`;
  const res = await fetch(global.API('https://covid19.mathdro.id', '/api/countries/'+ (text)));
  if (!res.ok) throw await res.text();
  const json = await res.json();
  if (!json.confirmed) throw 'País?';
  if (json.confirmed) {
    m.reply(`
${tradutor.texto2[0]} ${text}
${tradutor.texto2[1]} ${json.confirmed.value}
${tradutor.texto2[2]} ${json.recovered.value}
${tradutor.texto2[3]} ${json.deaths.value}
${tradutor.texto2[4]} ${json.lastUpdate}
`.trim());
  } else throw json;
};
handler.help = ['covid'].map((v) => v + ' <país>');
handler.tags = ['info'];
handler.command = /^(corona|covid|covid19)$/i;
export default handler;
