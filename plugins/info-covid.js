import fetch from 'node-fetch';

const handler = async (m, {text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.info_covid

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
