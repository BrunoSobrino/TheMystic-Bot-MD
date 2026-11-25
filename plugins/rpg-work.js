

const handler = async (m, { conn, isPrems }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_work

  global.work = tradutor.texto1;


  let enviando;
  if (enviando) return
  enviando = true
  const hasil = Math.floor(Math.random() * 5000);
  const time = global.db.data.users[m.sender].lastwork + 600000;
  if (new Date - global.db.data.users[m.sender].lastwork < 600000) throw `${tradutor.texto2[0]}${msToTime(time - new Date(), tradutor)}${tradutor.texto2[1]}`;
  conn.sendMessage(m.chat, { text: `${tradutor.texto3[0]}${pickRandom(global.work)}${tradutor.texto3[1]}${hasil}${tradutor.texto3[2]}` }, { quoted: m });
  global.db.data.users[m.sender].exp += hasil;
  global.db.data.users[m.sender].lastwork = new Date() * 1;
  enviando = false
};
handler.help = ['work'];
handler.tags = ['xp'];
handler.command = /^(work|trabajar|chambear)$/i
handler.fail = null;
export default handler;

function msToTime(duration, tradutor) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + tradutor.texto4[0] + seconds + tradutor.texto4[1];
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}


