import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';

const handler = async (m, {conn, usedPrefix, command, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_akinator

  if (m.isGroup) return;
  const aki = global.db.data.users[m.sender].akinator;
  if (text == 'end') {
    if (!aki.sesi) return m.reply(tradutor.texto1);
    aki.sesi = false;
    aki.soal = null;
    m.reply(tradutor.texto2);
  } else {
    if (aki.sesi) return conn.reply(m.chat, tradutor.texto3, aki.soal);
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/akinator/start?apikey=${lolkeysapi}`);
      const anu = await res.json();
      if (anu.status !== 200) throw tradutor.texto4;
      const {server, frontaddr, session, signature, question, progression, step} = anu.result;
      aki.sesi = true;
      aki.server = server;
      aki.frontaddr = frontaddr;
      aki.session = session;
      aki.signature = signature;
      aki.question = question;
      aki.progression = progression;
      aki.step = step;
      const resultes2 = await translate(question, {to: 'es', autoCorrect: false});
      let txt = `${tradutor.texto5[0]} @${m.sender.split('@')[0]}*\n${tradutor.texto5[1]} ${resultes2.text}*\n\n`;
      txt += tradutor.texto5[2] 
      txt += tradutor.texto5[3] 
      txt += tradutor.texto5[4]
      txt += tradutor.texto5[5] 
      txt += tradutor.texto5[6] 
      txt += `${tradutor.texto5[7]}  ${usedPrefix + command} ${tradutor.texto5[8]}`;
      const soal = await conn.sendMessage(m.chat, {text: txt, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
    } catch {
      m.reply(tradutor.texto6);
    }
  }
};
handler.menu = ['akinator'];
handler.tags = ['game'];
handler.command = /^(akinator)$/i;
export default handler;
