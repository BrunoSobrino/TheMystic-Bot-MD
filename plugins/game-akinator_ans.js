import fetch from 'node-fetch';


import translate from '@vitalets/google-translate-api';

export async function before(m) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.game_akinator_ans
  const teks = tradutor.texto1;


  if (global.db.data.users[m.sender].banned) return;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text) return !0;
  const aki = global.db.data.users[m.sender].akinator;
  if (!aki.sesi || m.quoted.id != aki.soal.key.id) return;
  if (!somematch(['0', '1', '2', '3', '4', '5'], m.text)) return this.sendMessage(m.chat, {text: `${tradutor.texto2} \n\n${teks}`}, {quoted: aki.soal});
  const {server, frontaddr, session, signature, question, progression, step} = aki;
  if (step == '0' && m.text == '5') return m.reply(tradutor.texto3);
  let res; let anu; let soal;
  try {
    if (m.text == '5') res = await fetch(`https://api.lolhuman.xyz/api/akinator/back?apikey=${lolkeysapi}&server=${server}&session=${session}&signature=${signature}&step=${step}`);
    else res = await fetch(`https://api.lolhuman.xyz/api/akinator/answer?apikey=${lolkeysapi}&server=${server}&frontaddr=${frontaddr}&session=${session}&signature=${signature}&step=${step}&answer=${m.text}`);
    anu = await res.json();
    if (anu.status != '200') {
      aki.sesi = false;
      aki.soal = null;
      return m.reply(tradutor.texto4);
    }
    anu = anu.result;
    if (anu.name) {
      await this.sendMessage(m.chat, {image: {url: anu.image}, caption: `${tradutor.texto5} ${anu.name}*\n_${anu.description}_`, mentions: [m.sender]}, {quoted: m});
      aki.sesi = false;
      aki.soal = null;
    } else {
      const resultes = await translate(`${anu.question}`, {to: 'es', autoCorrect: true});
      soal = await this.sendMessage(m.chat, {text: `${tradutor.texto6[0]} ${anu.step} (${anu.progression.toFixed(2)} %)*\n\n${tradutor.texto6[1]} @${m.sender.split('@')[0]}*\n${tradutor.texto6[2]} ${resultes.text}*\n\n${teks}`, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
      aki.step = anu.step;
      aki.progression = anu.progression;
    }
  } catch (e) {
    aki.sesi = false;
    aki.soal = null;
    m.reply(tradutor.texto7);
  }
  return !0;
}
function somematch( data, id ) {
  const res = data.find((el) => el === id );
  return res ? true : false;
}
