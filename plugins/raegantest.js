import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';
const handler = async (m, {args, usedPrefix, command}) => {
  /*const msg = `*[❗𝐈𝐍𝐅𝐎❗] 𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command} (idioma) (texto)*\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} es Hello*\n\n*𝙲𝙾𝙽𝙾𝙲𝙴 𝙻𝙾𝚂 𝙸𝙳𝙸𝙾𝙼𝙰𝚂 𝙰𝙳𝙼𝙸𝚃𝙸𝙳𝙾𝚂 𝙴𝙽:*\n*- https://cloud.google.com/translate/docs/languages*`;
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
    await m.reply('*Traducción:* ' + result.text);
  } catch {
    try {
      const lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${lolkeysapi}&text=${text}`);
      const loll = await lol.json();
      const result2 = loll.result.translated;
      await m.reply('*Traducción:* ' + result2);
    } catch {
      await m.reply('*[❗𝐈𝐍𝐅𝐎❗] ERROR, VUELVA A INTENTARLO*');
    }
  }*/

 function encode(data) {
    return JSON.stringify(data)
        .split('')
        .map((char) => {
            const binary = char.charCodeAt(0).toString(2);
            const paddedBinary = '00000000'.slice(binary.length) + binary;
            return paddedBinary;
        })
        .join(' ')
        .split('')
        .map((binaryNum) => {
            const num = parseInt(binaryNum, 10);
            if (num === 1) {
                return '\u200B'; // U+200B (Zero Width Space)
            } else if (num === 0) {
                return '\u200C'; // U+200C (Zero Width Non-Joiner)
            }
            return '\u200D'; // U+200D (Zero Width Joiner)
        })
        .join('');
}
 function decode(Data) {
    const binaryData = Data
        .split('')
        .map((char) => {
            if (char === '\u200B') {
                return '1'; // U+200B (Zero Width Space)
            } else if (char === '\u200C') {
                return '0'; // U+200C (Zero Width Non-Joiner)
            }
            return ' '; // Space
        })
        .join('');

    const raw = binaryData
        .split(' ')
        .map((num) => String.fromCharCode(parseInt(num, 2)))
        .join('');

    return JSON.parse(raw.substring(raw.indexOf('{'), raw.indexOf('}') + 1));
}

  let message = {
    "messageContextInfo": {
    "messageSecret": "eed1zxI49cxiovBTUFLIEWi1shD9HgIOghONuqPDGTk="},
    "pollCreationMessage": {
    "options": [
    { "optionName": `she ask me how be funny` + encode({
        "type": "template"
    }), "optionId": '1' },
    { "optionName": `but this cannot be teach`, "optionId": '2' },
    { "optionName": 'dos' },
    { "optionName": 'tres' }],
    "name": `probando`,
    "selectableOptionsCount": 1
    }}
    await conn.relayMessage(m.chat, message, {})
};
handler.command = /^(raetest)$/i;
export default handler;