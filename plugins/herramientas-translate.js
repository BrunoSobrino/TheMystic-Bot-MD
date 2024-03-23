import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.herramientas__translate
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {args, usedPrefix, command}) => {
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
      await m.reply(tradutor.texto3 + result2);
    } catch {
      await m.reply(tradutor.texto2);
    }
  }
};
handler.command = /^(translate|traducir|trad)$/i;
export default handler;
