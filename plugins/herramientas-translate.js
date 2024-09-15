import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';


const handler = async (m, {args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas__translate

  const msg = `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}\n*${usedPrefix + command} ${tradutor.texto1[2]}\n*- https://cloud.google.com/translate/docs/languages*`;
  if (!args || !args[0]) return m.reply(msg);
  let lang = args[0];
  let text = args.slice(1).join(' ');
  const defaultLang = 'es';
  if ((args[0] || '').length !== 2) {
    lang = defaultLang;
    text = args.join(' ');
  }
  if (!text && m.quoted && m.quoted.text) text = m.quoted.text;
  try {
    const result = await translate(`${text}`, {to: lang, autoCorrect: true});
    await m.reply(tradutor.texto3 + result.text);
  } catch {
    try {
      const lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${lolkeysapi}&text=${text}`);
      const loll = await lol.json();
      const result2 = loll.result.translated;
      await m.reply(`${tradutor.texto3 }` + result2);
    } catch {
      await m.reply(tradutor.texto2);
    }
  }
};
handler.command = /^(translate|traducir|trad)$/i;
export default handler;
