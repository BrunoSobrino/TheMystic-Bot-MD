import {WAMessageStubType} from 'baileys';
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import {watchFile} from 'fs';

const terminalImage = global.opts['img'] ? require('terminal-image') : '';
const urlRegex = (await import('url-regex-safe')).default({strict: false});

// Define una longitud máxima para el mensaje
const MAX_MESSAGE_LENGTH = 400; // Cambia este valor según tus necesidades

export default async function(m, conn = {user: {}}) {
  const _name = await conn.getName(m.sender);
  const sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '');
  const chat = await conn.getName(m.chat);
  let img;
  try {
    if (global.opts['img']) {
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false;
    }
  } catch (e) {
    console.error(e);
  }
  const filesize = (m.msg ?
    m.msg.vcard ?
    m.msg.vcard.length :
    m.msg.fileLength ?
    m.msg.fileLength.low || m.msg.fileLength :
    m.msg.axolotlSenderKeyDistributionMessage ?
    m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ?
    m.text.length :
    0 :
    m.text ? m.text.length : 0) || 0;
  const user = global.db.data.users[m.sender];
  const me = PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international');

  console.log(`▣────────────···
│ ${chalk.redBright('%s')}\n│⏰ㅤ${chalk.black(chalk.bgYellow('%s'))}\n│📑ㅤ${chalk.black(chalk.bgGreen('%s'))}\n│📊ㅤ${chalk.magenta('%s [%s %sB]')}
│📤ㅤ${chalk.green('%s')}\n│📃ㅤ${chalk.yellow('%s%s')}\n│📥ㅤ${chalk.green('%s')}\n│💬ㅤ${chalk.black(chalk.bgYellow('%s'))}
▣────────────···
`.trim(),
  me + ' ~' + conn.user.name + `${conn.user.jid == global.conn.user.jid ? '' : ' (Sub Bot)'}`,
  (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString(),
    m.messageStubType ? WAMessageStubType[m.messageStubType] : '',
    filesize,
    filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1),
    ['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || '',
    sender,
    m ? m.exp : '?',
    user ? '|' + user.exp + '|' + user.limit : '' + ('|' + user.level),
    m.chat + (chat ? ' ~' + chat : ''),
    m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, (v) => v.toUpperCase()) : '',
  );

  if (img) console.log(img.trimEnd());

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '');

    // Nuevos formatos/estilos para el texto en consola
    // Créditos para: https://github.com/GataNina-Li
    const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g;
    const mdFormat = (depth = 4) => (_, type, text, monospace) => {
      const types = {
        '_': 'italic',
        '*': 'bold',
        '~': 'strikethrough',
        '`': 'bgGray',
      };
      text = text || monospace;
      const formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1)));
      return formatted;
    };

    log = log.replace(mdRegex, mdFormat(4));

    if (log.length > MAX_MESSAGE_LENGTH) {
      log = log.substring(0, MAX_MESSAGE_LENGTH) + '\n' + chalk.blue('Character Limit Exceeded...');
    }

    log = log.split('\n').map((line) => {
      if (line.trim().startsWith('>')) {
        return chalk.bgGray.dim(line.replace(/^>/, '┃'));
      } else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
        return line.replace(/^(\d+)\./, (match, number) => {
          const padding = number.length === 1 ? '  ' : ' ';
          return padding + number + '.';
        });
      } else if (/^[-*]\s/.test(line.trim())) {
        return line.replace(/^[*-]/, '  •');
      }
      return line;
    }).join('\n');

    log = log.replace(urlRegex, (url, i, text) => {
      const end = url.length + i;
      return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url;
    });

    log = log.replace(mdRegex, mdFormat(4));

    if (m.mentionedJid) for (const user of m.mentionedJid) log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' + await conn.getName(user)));
    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log);
  }

  if (m.messageStubParameters) {
    console.log(m.messageStubParameters.map((jid) => {
      jid = conn.decodeJid(jid);
      const name = conn.getName(jid);
      return chalk.gray(PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') + (name ? ' ~' + name : ''));
    }).join(', '));
  }

  if (/document/i.test(m.mtype)) console.log(`🗂️ ${m.msg.fileName || m.msg.displayName || 'Document'}`);
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦 ${' ' || ''}`);
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`);
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds;
    console.log(`${m.msg.ptt ? '🎤ㅤ(PTT ' : '🎵ㅤ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`);
  }
}

const file = global.__filename(import.meta.url);
watchFile(file, () => {
  console.log(chalk.redBright('Update \'lib/print.js\''));
});

/* import {WAMessageStubType} from "baileys";
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import {watchFile} from 'fs';

const terminalImage = global.opts['img'] ? require('terminal-image') : '';
const urlRegex = (await import('url-regex-safe')).default({strict: false});

export default async function(m, conn = {user: {}}) {
  const _name = await conn.getName(m.sender);
  const sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '');
  const chat = await conn.getName(m.chat);
  let img;
  try {
    if (global.opts['img']) {
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false;
    }
  } catch (e) {
    console.error(e);
  }
  const filesize = (m.msg ?
m.msg.vcard ?
m.msg.vcard.length :
m.msg.fileLength ?
m.msg.fileLength.low || m.msg.fileLength :
m.msg.axolotlSenderKeyDistributionMessage ?
m.msg.axolotlSenderKeyDistributionMessage.length :
m.text ?
m.text.length :
0 :
m.text ? m.text.length : 0) || 0;
  const user = global.db.data.users[m.sender];
  const me = PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international');

  console.log(`▣────────────···
│ ${chalk.redBright('%s')}\n│⏰ㅤ${chalk.black(chalk.bgYellow('%s'))}\n│📑ㅤ${chalk.black(chalk.bgGreen('%s'))}\n│📊ㅤ${chalk.magenta('%s [%s %sB]')}
│📤ㅤ${chalk.green('%s')}\n│📃ㅤ${chalk.yellow('%s%s')}\n│📥ㅤ${chalk.green('%s')}\n│💬ㅤ${chalk.black(chalk.bgYellow('%s'))}
▣────────────···
`.trim(),

  me + ' ~' + conn.user.name + `${conn.user.jid == global.conn.user.jid ? '' : ' (Sub Bot)'}`,
  (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString(),
m.messageStubType ? WAMessageStubType[m.messageStubType] : '',
filesize,
filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1),
['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || '',
sender,
m ? m.exp : '?',
user ? '|' + user.exp + '|' + user.limit : '' + ('|' + user.level),
m.chat + (chat ? ' ~' + chat : ''),
m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, (v) => v.toUpperCase()) : '',
);
if (img) console.log(img.trimEnd());
if (typeof m.text === 'string' && m.text) {
let log = m.text.replace(/\u200e+/g, '');

// Nuevos formatos/estilos para el texto en consola
// Créditos para: https://github.com/GataNina-Li
let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~`])(?!`)(.+?)\1|```((?:.|[\n\r])+?)```|`([^`]+?)`)(?=\S?(?:[\s\n]|$))/g
let mdFormat = (depth = 4) => (_, type, text, monospace) => {
let types = {
'_': 'italic',
'*': 'bold',
'~': 'strikethrough',
'`': 'bgGray'
}
text = text || monospace
let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(/`/g, '').replace(mdRegex, mdFormat(depth - 1)))
return formatted
}
log = log.replace(mdRegex, mdFormat(4))
log = log.split('\n').map(line => {
if (line.trim().startsWith('>')) {
return chalk.bgGray.dim(line.replace(/^>/, '┃'))
} else if (/^([1-9]|[1-9][0-9])\./.test(line.trim())) {
return line.replace(/^(\d+)\./, (match, number) => {
const padding = number.length === 1 ? '  ' : ' '
return padding + number + '.'
})
} else if (/^[-*]\s/.test(line.trim())) {
return line.replace(/^[*-]/, '  •')
}
return line
}).join('\n')
if (log.length < 1024) {
log = log.replace(urlRegex, (url, i, text) => {
const end = url.length + i
return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url;
  })
    }
    log = log.replace(mdRegex, mdFormat(4));
    if (m.mentionedJid) for (const user of m.mentionedJid) log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' +await conn.getName(user)));
    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log);
  }
  if (m.messageStubParameters) {
    console.log(m.messageStubParameters.map((jid) => {
      jid = conn.decodeJid(jid);
      const name = conn.getName(jid);
      return chalk.gray(PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') + (name ? ' ~' + name : ''));
    }).join(', '));
  }
  if (/document/i.test(m.mtype)) console.log(`🗂️ ${m.msg.fileName || m.msg.displayName || 'Document'}`);
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦 ${' ' || ''}`);
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`);
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds;
    console.log(`${m.msg.ptt ? '🎤ㅤ(PTT ' : '🎵ㅤ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`);
  }

}
const file = global.__filename(import.meta.url);
watchFile(file, () => {
  console.log(chalk.redBright('Update \'lib/print.js\''));
});*/
