import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  try {
    const pp = imagen4;
    // let vn = './media/menu.mp3'
    const img = './Menu2.jpg';
    const d = new Date(new Date + 3600000);
    const locale = 'es';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: 'numeric', month: 'long', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, limit, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const rtotal = Object.entries(global.db.data.users).length || '0'
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const document = doc[Math.floor(Math.random() * doc.length)];
    const str = `

┌──⭓ *Main Menu*
│⎚${usedPrefix} menu
│⎚${usedPrefix} info
│⎚${usedPrefix} delete
│⎚${usedPrefix}quoted
│⎚${usedPrefix}listsw
│⎚ ${usedPrefix}getsw
│⎚ ${usedPrefix}sc
│⎚ ${usedPrefix}get
│⎚ ${usedPrefix} fetch
│⎚ ${usedPrefix} head
│⎚ ${usedPrefix}whatmusic
└───────⭓

┌──⭓ *Tool Menu*
│⎚ ${usedPrefix} rvo
│⎚ ${usedPrefix} exif
│⎚ ${usedPrefix} tourl
│⎚ ${usedPrefix} sticker
│⎚ ${usedPrefix} translate
│⎚ ${usedPrefix} smeme
│⎚ ${usedPrefix} tomp4
│⎚ ${usedPrefix} toimg
└───────⭓

┌──⭓ *Downloader Menu*
│⎚ ${usedPrefix} ytv
│⎚ ${usedPrefix} yta
│⎚ ${usedPrefix}ytmp3
│⎚ ${usedPrefix} ytmp4
│⎚ ${usedPrefix} play
│⎚ ${usedPrefix} song
│⎚ ${usedPrefix} playmp4
│⎚ ${usedPrefix} gitclone
│⎚ ${usedPrefix} fbdl
│⎚ ${usedPrefix} tt
│⎚ ${usedPrefix} twdl
└───────⭓

┌──⭓ *Ai Menu*
│⎚ ${usedPrefix} you
│⎚ ${usedPrefix} bing
│⎚ ${usedPrefix} bard
│⎚ ${usedPrefix} create
│⎚ ${usedPrefix} semsi
└───────⭓

┌──⭓ *Owner Menu*
│⎚ ${usedPrefix} upsw
│⎚ ${usedPrefix}restart
│⎚ ${usedPrefix}contact
│⎚ ${usedPrefix} eval
│⎚ ${usedPrefix} exec
└───────⭓

┌──⭓ *Group Menu*
│ ⎚${usedPrefix}link
│ ⎚$ {usedPrefix}antilink
│ ⎚${usedPrefix}antispam
│ ⎚${usedPrefix}antidelete
│ ⎚${usedPrefix}ban
└───────⭓
*صل على النبي* 


`.trim();
    if (m.isGroup) {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: m});
    } else {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    }
  } catch {
    conn.reply(m.chat, '*YASMINE MD IS NOT AVAILABLE*', m);
  }
};
handler.command = /^(menu|menú|memu|memú|help|info|comandos|allmenu|2help|menu1.2|ayuda|commands|commandos|cmd)$/i;
handler.exp = 50;
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}
