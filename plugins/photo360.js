import {Maker} from 'imagemaker.js';
const handler = async (m, {conn, args, command, usedPrefix}) => {
  const response = args.join(' ').split('|');
  if (!args[0]) throw '*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾*';
  if (command == 'logocorazon') {
    try {
      await conn.reply(m.chat, '*[❗] 𝙴𝙻𝙰𝙱𝙾𝚁𝙰𝙽𝙳𝙾 𝚂𝚄 𝙳𝙸𝚂𝙴𝙽̃𝙾, 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾...*', m);
      const res = await new Maker().Ephoto360('https://en.ephoto360.com/text-heart-flashlight-188.html', [response[0]]);
      await conn.sendFile(m.chat, res.imageUrl, 'error.jpg', null, m);
    } catch {
      await conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*', m);
    }
  }
  if (command == 'logochristmas') {
    try {
      await conn.reply(m.chat, '*[❗] 𝙴𝙻𝙰𝙱𝙾𝚁𝙰𝙽𝙳𝙾 𝚂𝚄 𝙳𝙸𝚂𝙴𝙽̃𝙾, 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾...*', m);
      const res2 = await new Maker().Ephoto360('https://en.ephoto360.com/christmas-effect-by-name-376.html', [response[0]]);
      await conn.sendFile(m.chat, res2.imageUrl, 'error.jpg', null, m);
    } catch {
      await conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*', m);
    }
  }
/* if (command == 'logoephoto360') {
if (!response[0].includes('ephoto360')) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝚄𝙽 𝙴𝙽𝙻𝙰𝙲𝙴 𝙳𝙴 "𝙴𝙿𝙷𝙾𝚃𝙾𝟹𝟼0", 𝙼𝙰𝚂 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙰𝙶𝚁𝙴𝙶𝙰𝚁*

*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂:*
◉ https://en.ephoto360.com/create-3d-text-effect-on-the-beach-online-688.html | Shadow

◉ https://en.ephoto360.com/create-a-graffiti-text-effect-on-the-wall-online-665.html | Shadow | dominando`
try {
await conn.reply(m.chat, '*[❗] 𝙴𝙻𝙰𝙱𝙾𝚁𝙰𝙽𝙳𝙾 𝚂𝚄 𝙳𝙸𝚂𝙴𝙽̃𝙾, 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾...*', m)
let res2 = await new Maker().Ephoto360(response[0], [response[1]], [response[2]])
await conn.sendFile(m.chat, res2.imageUrl, 'error.jpg', null, m)
} catch {
await conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*', m)}}
if (command == 'logotextpro') {
try {
await conn.reply(m.chat, '*[❗] 𝙴𝙻𝙰𝙱𝙾𝚁𝙰𝙽𝙳𝙾 𝚂𝚄 𝙳𝙸𝚂𝙴𝙽̃𝙾, 𝙴𝚂𝙿𝙴𝚁𝙴 𝚄𝙽 𝙼𝙾𝙼𝙴𝙽𝚃𝙾...*', m)
let res2 = await new Maker().TextPro(response[0], [response[1], response[2]])
await conn.sendFile(m.chat, res2.imageUrl, 'error.jpg', null, m)
} catch {
await conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚁𝚁𝙾𝚁, 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*', m)}}*/
};
handler.command = /^logocorazon|logochristmas|logoephoto360|logotextpro/i;
export default handler;
